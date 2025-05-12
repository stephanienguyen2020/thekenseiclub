module meme::dao {
    use sui::object;
    use sui::transfer;
    use sui::tx_context;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::vec_map::{Self, VecMap};
    use sui::event;
    use std::string;
    use std::vector;
    use std::option;

    // ===== Errors =====
    const ENotAuthorized: u64 = 0;
    const EProposalClosed: u64 = 2;
    const EAlreadyVoted: u64 = 3;
    const EInvalidOption: u64 = 4;
    const EProposalNotExpired: u64 = 5;

    // ===== Structs =====
    public struct Proposal has store {
        id: u64,
        title: string::String,
        description: string::String,
        options: vector<string::String>,
        created_by: address,
        created_at: u64,
        start_time: u64,
        end_time: u64,
        status: u8, // 0: open, 1: closed
        winning_option: option::Option<string::String>,
        votes: VecMap<address, u64>, // address -> option index
        vote_points: vector<u64>, // points for each option
        total_votes: u64,
        total_points: u64
    }

    public struct DAO has key {
        id: object::UID,
        proposals: Table<u64, Proposal>,
        next_proposal_id: u64,
        min_voting_power: u64
    }

    // ===== Events =====
    public struct ProposalCreated has copy, drop {
        proposal_id: u64,
        title: string::String,
        created_by: address
    }

    public struct VoteSubmitted has copy, drop {
        proposal_id: u64,
        voter: address,
        option_index: u64,
        voting_power: u64
    }

    public struct ProposalClosed has copy, drop {
        proposal_id: u64,
        winning_option: option::Option<string::String>,
        total_votes: u64,
        total_points: u64
    }

    // ===== Functions =====
    fun init(ctx: &mut tx_context::TxContext) {
        let dao = DAO {
            id: object::new(ctx),
            proposals: table::new(ctx),
            next_proposal_id: 0,
            min_voting_power: 1000000 // 0.001 SUI
        };
        transfer::share_object(dao);
    }

    public entry fun create_proposal(
        dao: &mut DAO,
        title: vector<u8>,
        description: vector<u8>,
        options: vector<vector<u8>>,
        created_at: u64,
        start_time: u64,
        end_time: u64,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let proposal_id = dao.next_proposal_id;
        dao.next_proposal_id = proposal_id + 1;

        // Validate timestamps using the clock
        let current_time = clock::timestamp_ms(clock);
        
        // Created at should be in the past or present
        assert!(created_at <= current_time, EInvalidOption);
        
        // End time should be in the future
        assert!(end_time > current_time, EInvalidOption);
        
        // Start time should be before end time
        assert!(start_time < end_time, EInvalidOption);

        let mut proposal = Proposal {
            id: proposal_id,
            title: string::utf8(title),
            description: string::utf8(description),
            options: vector::empty(),
            created_by: tx_context::sender(ctx),
            created_at,
            start_time,
            end_time,
            status: 0,
            winning_option: option::none(),
            votes: vec_map::empty(),
            vote_points: vector::empty(),
            total_votes: 0,
            total_points: 0
        };

        // Add options
        let mut i = 0;
        let len = vector::length(&options);
        while (i < len) {
            let option_bytes = vector::borrow(&options, i);
            vector::push_back(&mut proposal.options, string::utf8(*option_bytes));
            vector::push_back(&mut proposal.vote_points, 0);
            i = i + 1;
        };

        table::add(&mut dao.proposals, proposal_id, proposal);

        event::emit(ProposalCreated {
            proposal_id,
            title: string::utf8(title),
            created_by: tx_context::sender(ctx)
        });
    }

    public entry fun vote(
        dao: &mut DAO,
        proposal_id: u64,
        option_index: u64,
        voting_power: u64,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(voting_power >= dao.min_voting_power, ENotAuthorized);

        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        assert!(proposal.status == 0, EProposalClosed);
        assert!(!vec_map::contains(&proposal.votes, &sender), EAlreadyVoted);
        assert!(option_index < vector::length(&proposal.options), EInvalidOption);

        // Record vote
        vec_map::insert(&mut proposal.votes, sender, option_index);
        *vector::borrow_mut(&mut proposal.vote_points, option_index) = 
            *vector::borrow(&proposal.vote_points, option_index) + voting_power;
        
        proposal.total_votes = proposal.total_votes + 1;
        proposal.total_points = proposal.total_points + voting_power;

        event::emit(VoteSubmitted {
            proposal_id,
            voter: sender,
            option_index,
            voting_power
        });
    }

    public entry fun close_proposal(
        dao: &mut DAO, 
        proposal_id: u64, 
        clock: &Clock,
        _ctx: &mut tx_context::TxContext
    ) {
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        assert!(proposal.status == 0, EProposalClosed);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= proposal.end_time, EProposalNotExpired);

        // Find winning option
        let mut winning_index = 0;
        let mut max_points = 0;
        let mut i = 0;
        let len = vector::length(&proposal.vote_points);
        while (i < len) {
            let points = *vector::borrow(&proposal.vote_points, i);
            if (points > max_points) {
                max_points = points;
                winning_index = i;
            };
            i = i + 1;
        };

        // Set winning option
        if (max_points > 0) {
            proposal.winning_option = option::some(
                *vector::borrow(&proposal.options, winning_index)
            );
        };

        proposal.status = 1;

        event::emit(ProposalClosed {
            proposal_id,
            winning_option: proposal.winning_option,
            total_votes: proposal.total_votes,
            total_points: proposal.total_points
        });
    }

    // ===== View Functions =====
    public fun get_proposal(dao: &DAO, proposal_id: u64): &Proposal {
        table::borrow(&dao.proposals, proposal_id)
    }

    public fun get_proposal_count(dao: &DAO): u64 {
        dao.next_proposal_id
    }

    public fun has_voted(proposal: &Proposal, voter: address): bool {
        vec_map::contains(&proposal.votes, &voter)
    }

    public fun get_voting_power(proposal: &Proposal, option_index: u64): u64 {
        *vector::borrow(&proposal.vote_points, option_index)
    }
}

