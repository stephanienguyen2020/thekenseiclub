module meme::bonding_curve;

use sui::balance;
use sui::balance::Supply;
use sui::coin::{Self, Coin, TreasuryCap};
use sui::sui::SUI;
use sui::tx_context;

const ETotalSupplyNotEqualZero: u64 = 0;
const EOutputAmountLessThanMin: u64 = 1;
const EDecimalsNotEqualNine: u64 = 2;
const EListingFeeNotEqual: u64 = 3;
const ECurveNotActive: u64 = 4;
const EReserveValuesNotGreaterThanZero: u64 = 5;
const ECurveNotInactive: u64 = 6;

public struct BONDING_CURVE has drop {}
public struct AdminCap has key, store {
    id: UID,
}
public struct BondingCurve<phantom T> has key {
    id: UID,
    sui_balance: balance::Balance<SUI>,
    token_balance: balance::Balance<T>,
    virtual_sui_amt: u64,
    target_supply_threshold: u64,
    swap_fee: u64,
    listing_fee: u64,
    migration_fee:u64,
    is_active: bool,
    creator: address,
    migration_target: u64,
}

fun init(_witness: BONDING_CURVE, ctx: &mut TxContext) {
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer<AdminCap>(admin_cap, tx_context::sender(ctx));
}

public fun create_bonding_curve<T>(
    treasury_cap: &mut coin::TreasuryCap<T>,
    coin_metadata: &coin::CoinMetadata<T>,
    coin: coin::Coin<SUI>,
    migration_target: u64,
    ctx: &mut TxContext,
) {
    assert!(coin::total_supply<T>(treasury_cap) == 0, ETotalSupplyNotEqualZero);
    assert!(coin::get_decimals<T>(coin_metadata) == 9, EDecimalsNotEqualNine);
    let mut sui_balance = coin::into_balance<SUI>(coin);

    let bonding_curve = BondingCurve<T> {
        id: object::new(ctx),
        sui_balance: balance::zero<SUI>(),
        token_balance: coin::mint_balance<T>(treasury_cap, 1_000_000_000_000_000_000),
        virtual_sui_amt: 30_000_000_000,
        target_supply_threshold: 300_000_000_000_000_000,
        migration_fee: 3_000_000_000,
        listing_fee: 1_000_000_000,
        swap_fee: 10_000,
        is_active: true,
        creator: tx_context::sender(ctx),
        migration_target,
    };
    transfer::share_object<BondingCurve<T>>(bonding_curve);
}

fun buy<T>(
    bonding_curve: &mut BondingCurve<T>,
    coin: Coin<SUI>,
    amount: u64,
    min_token_required: u64,
    ctx: &mut TxContext,
) {
    assert!(bonding_curve.is_active, ECurveNotActive);
    let sender = tx_context::sender(ctx);

    amount = amount - take_fee(bonding_curve.swap_fee, amount);
    let (curr_sui_balance, curr_token_balance) = get_token_in_pool(bonding_curve);
    let token_received = get_token_receive(
        amount,
        curr_sui_balance + bonding_curve.virtual_sui_amt,
        curr_token_balance,
    );
    assert!(token_received >= min_token_required, EOutputAmountLessThanMin);
    bonding_curve.sui_balance.join(balance::Balance {value: amount});
    (curr_sui_balance, curr_token_balance) = get_token_in_pool(bonding_curve);
    if (curr_token_balance + token_received >= bonding_curve.target_supply_threshold) {
        bonding_curve.is_active = false;
        //Migrate
    };
    let token = coin::take<T>(&mut bonding_curve.token_balance, token_received, ctx);
    transfer::transfer(token, sender);
}

fun sell<T>(
    bonding_curve: &mut BondingCurve<T>,
    amount: u64,
    min_token_required: u64,
    ctx: &mut TxContext,
) {
    assert!(bonding_curve.is_active, ECurveNotActive);
    let sender = tx_context::sender(ctx);
    let (curr_sui_balance, curr_token_balance) = get_token_in_pool(bonding_curve);
    let sui_received = get_token_receive(
        token_amount,
        curr_token_balance,
        curr_sui_balance + bonding_curve.virtual_sui_amt,
    );
    assert!(sui_received >= min_token_required, EOutputAmountLessThanMin);
    sui_received = sui_received - take_fee(bonding_curve.swap_fee, sui_received);
    bonding_curve.token_balance.join(balance::Balance {value: amount});
    let token = coin::take<SUI>(&mut bonding_curve.sui_balance, sui_received, ctx);
    transfer::transfer(token, sender)
}

fun get_token_receive(
    after_fee_amount: u64,
    curr_token_a_balance: u64,
    curr_token_b_balance: u64
) : u64 {
    let after_fee_amount_val = after_fee_amount as u128;
    (after_fee_amount_val * (curr_token_b_balance as u128) / ((curr_token_a_balance as u128) + after_fee_amount_val)) as u64
}

fun take_fee(
    swap_fee: u64,
    buy_amount: u64,
):u64 {
    swap_fee * (buy_amount / 100_000)
}

fun get_token_in_pool<T>(bonding_curve: &BondingCurve<T>) : (u64, u64) {
    (balance::value<SUI>(&bonding_curve.sui_balance), balance::value<T>(&bonding_curve.token_balance))
}
