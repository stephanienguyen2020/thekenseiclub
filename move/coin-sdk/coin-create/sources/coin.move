/// Module: pump
module meme::senachill;

use std::ascii;
use std::string::String;
use sui::coin::{Self, TreasuryCap, Coin};
use sui::url::{Self};

public struct SENACHILL has drop {}

fun init(witness: SENACHILL, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<SENACHILL>(
        witness,
        9,
        b"SENACHILL",
        b"SENACHILL",
        b"SENACHILL",
        option::some(url::new_unsafe_from_bytes(b"https://avatars.githubusercontent.com/u/42907738?v=4")),
        ctx,
    );

    transfer::public_transfer(metadata, tx_context::sender(ctx));
    transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
}

public fun update_coin_info(
    name: String,
    symbol: vector<u8>,
    description: String,
    icon_url: vector<u8>,
    _treasury: &coin::TreasuryCap<SENACHILL>,
    metadata: &mut coin::CoinMetadata<SENACHILL>,
) {
    let icon_url = ascii::string(icon_url);
    let symbol = ascii::string(symbol);
    coin::update_name(_treasury, metadata, name);
    coin::update_symbol(_treasury, metadata, symbol);
    coin::update_description(_treasury, metadata, description);
    coin::update_icon_url(_treasury, metadata, icon_url);
}

public entry fun create_and_transfer(
    treasury_cap: &mut TreasuryCap<SENACHILL>,
    recepient: address,
    amount: u64,
    ctx: &mut TxContext,
) {
    coin::mint_and_transfer(treasury_cap, amount, recepient, ctx)
}

/// Manager can burn coins
public entry fun burn(treasury_cap: &mut TreasuryCap<SENACHILL>, coin: Coin<SENACHILL>) {
    coin::burn(treasury_cap, coin);
}
