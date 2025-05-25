module meme::bonding_curve;

use sui::balance;
use sui::coin::{Self, Coin};
use sui::event;
use sui::sui::SUI;

const ETotalSupplyNotEqualZero: u64 = 0;
const EOutputAmountLessThanMin: u64 = 1;
const EDecimalsNotEqualNine: u64 = 2;
const ECurveNotActive: u64 = 4;

public struct BONDING_CURVE has drop {}

public struct AdminCap has key, store {
    id: UID,
}

public struct BondingCurve<phantom T> has key, store {
    id: UID,
    sui_balance: balance::Balance<SUI>,
    token_balance: balance::Balance<T>,
    virtual_sui_amt: u64,
    target_supply_threshold: u64,
    swap_fee: u64,
    listing_fee: u64,
    migration_fee: u64,
    is_active: bool,
    creator: address,
    migration_target: u64,
}

public struct BuyEvent has copy, drop, store {
    bonding_curve_id: ID,
    issuer: address,
    amount_in: u64,
    amount_out: u64,
    price: u64,
}

public struct SellEvent has copy, drop, store {
    bonding_curve_id: ID,
    issuer: address,
    amount_in: u64,
    amount_out: u64,
    price: u64,
}

public struct BondingCurveCreatedEvent has copy, drop, store {
    bonding_curve_id: ID,
    issuer: address,
    treasury_cap: ID,
    coin_metadata: ID,
    migration_target: u64,
}

fun init(_witness: BONDING_CURVE, ctx: &mut TxContext) {
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer<AdminCap>(admin_cap, tx_context::sender(ctx));
}

public fun create_bonding_curve<T>(
    treasury_cap: &mut coin::TreasuryCap<T>,
    coin_metadata: &coin::CoinMetadata<T>,
    migration_target: u64,
    ctx: &mut TxContext,
) {
    assert!(coin::get_decimals<T>(coin_metadata) == 9, EDecimalsNotEqualNine);

    let bonding_curve = BondingCurve<T> {
        id: object::new(ctx),
        sui_balance: balance::zero<SUI>(),
        token_balance: coin::mint_balance<T>(treasury_cap, 1_000_000_000_000_000_000),
        virtual_sui_amt: 1_000_000_000_000,
        target_supply_threshold: 300_000_000_000_000_000,
        migration_fee: 3_000_000_000,
        listing_fee: 1_000_000_000,
        swap_fee: 1,
        is_active: true,
        creator: tx_context::sender(ctx),
        migration_target,
    };

    event::emit(BondingCurveCreatedEvent {
        bonding_curve_id: object::id(&bonding_curve),
        issuer: tx_context::sender(ctx),
        treasury_cap: object::id(treasury_cap),
        coin_metadata: object::id(coin_metadata),
        migration_target,
    });
    transfer::public_share_object<BondingCurve<T>>(bonding_curve);
}

public fun buy<T>(
    bonding_curve: &mut BondingCurve<T>,
    coin: Coin<SUI>,
    amount: u64,
    min_token_required: u64,
    ctx: &mut TxContext,
) {
    assert!(bonding_curve.is_active, ECurveNotActive);
    let sender = tx_context::sender(ctx);
    let original_amount = amount;
    let amount = amount - take_fee(bonding_curve.swap_fee, amount);
    let (curr_sui_balance, curr_token_balance) = get_token_in_pool(bonding_curve);
    let token_received = get_token_receive(
        amount,
        curr_sui_balance + bonding_curve.virtual_sui_amt,
        curr_token_balance,
    );
    assert!(token_received >= min_token_required, EOutputAmountLessThanMin);
    let mut balance = coin::into_balance<SUI>(coin);
    bonding_curve.sui_balance.join(balance.split(original_amount));
    let (curr_sui_balance, curr_token_balance) = get_token_in_pool(bonding_curve);
    if (curr_token_balance + token_received <= bonding_curve.target_supply_threshold) {
        bonding_curve.is_active = false;
        //Migrate
    };
    let token = coin::take<T>(&mut bonding_curve.token_balance, token_received, ctx);
    transfer::public_transfer(token, sender);
    return_back_or_delete<SUI>(balance, ctx);

    // Calculate marginal price after trade
    let marginal_price =
        (
            (((curr_sui_balance as u128) + (bonding_curve.virtual_sui_amt as u128)) * 1_000_000_000_000) / (curr_token_balance as u128),
        ) as u64;

    event::emit(BuyEvent {
        bonding_curve_id: object::id(bonding_curve),
        issuer: sender,
        amount_in: original_amount,
        amount_out: token_received,
        price: marginal_price,
    });
}

public fun sell<T>(
    bonding_curve: &mut BondingCurve<T>,
    coin: Coin<T>,
    amount: u64,
    min_token_required: u64,
    ctx: &mut TxContext,
) {
    assert!(bonding_curve.is_active, ECurveNotActive);
    let sender = tx_context::sender(ctx);
    let (curr_sui_balance, curr_token_balance) = get_token_in_pool(bonding_curve);
    let mut sui_received = get_token_receive(
        amount,
        curr_token_balance,
        curr_sui_balance + bonding_curve.virtual_sui_amt,
    );
    assert!(sui_received >= min_token_required, EOutputAmountLessThanMin);
    sui_received = sui_received - take_fee(bonding_curve.swap_fee, sui_received);
    let mut balance = coin::into_balance<T>(coin);
    bonding_curve.token_balance.join(balance.split(amount));
    let token = coin::take<SUI>(&mut bonding_curve.sui_balance, sui_received, ctx);
    transfer::public_transfer(token, sender);
    return_back_or_delete<T>(balance, ctx);

    // Calculate marginal price after trade
    let (new_sui_balance, new_token_balance) = get_token_in_pool(bonding_curve);
    let marginal_price =
        (
            (((new_sui_balance as u128) + (bonding_curve.virtual_sui_amt as u128)) * 1_000_000_000_000) / (new_token_balance as u128),
        ) as u64;

    event::emit(SellEvent {
        bonding_curve_id: object::id(bonding_curve),
        issuer: sender,
        amount_in: amount,
        amount_out: sui_received,
        price: marginal_price,
    });
}

// Add this function to your bonding_curve.move file
public entry fun withdraw_for_migration<T>(
    bonding_curve: &mut BondingCurve<T>,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == bonding_curve.creator, 0);

    let sui_amount = bonding_curve.sui_balance.value();
    let token_amount = bonding_curve.token_balance.value();

    let sui_coin = coin::take(&mut bonding_curve.sui_balance, sui_amount, ctx);
    let token_coin = coin::take(&mut bonding_curve.token_balance, token_amount, ctx);

    transfer::public_transfer(sui_coin, recipient);
    transfer::public_transfer(token_coin, recipient);
}

fun get_token_receive(
    after_fee_amount: u64,
    curr_token_a_balance: u64,
    curr_token_b_balance: u64,
): u64 {
    let after_fee_amount_val = after_fee_amount as u128;
    (
        after_fee_amount_val * (curr_token_b_balance as u128) / ((curr_token_a_balance as u128) + after_fee_amount_val),
    ) as u64
}

fun take_fee(swap_fee: u64, buy_amount: u64): u64 {
    swap_fee * (buy_amount / 100)
}

fun get_token_in_pool<T>(bonding_curve: &BondingCurve<T>): (u64, u64) {
    (
        balance::value<SUI>(&bonding_curve.sui_balance),
        balance::value<T>(&bonding_curve.token_balance),
    )
}

fun return_back_or_delete<T>(balance: balance::Balance<T>, ctx: &mut TxContext) {
    if (balance.value() > 0) {
        transfer::public_transfer(coin::from_balance(balance, ctx), tx_context::sender(ctx));
    } else {
        balance::destroy_zero(balance);
    }
}
