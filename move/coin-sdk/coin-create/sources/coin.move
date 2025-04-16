/// Module: pump
module meme::hehehe;

use std::ascii;
use std::string::String;
use sui::coin::{Self, TreasuryCap, Coin};
use sui::url::{Self};

public struct HEHEHE has drop {}

fun init(witness: HEHEHE, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency<HEHEHE>(
        witness,
        9,
        b"HEHEHE",
        b"HEHEHE",
        b"HEHEHE",
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
    _treasury: &coin::TreasuryCap<HEHEHE>,
    metadata: &mut coin::CoinMetadata<HEHEHE>,
) {
    let icon_url = ascii::string(icon_url);
    let symbol = ascii::string(symbol);
    coin::update_name(_treasury, metadata, name);
    coin::update_symbol(_treasury, metadata, symbol);
    coin::update_description(_treasury, metadata, description);
    coin::update_icon_url(_treasury, metadata, icon_url);
}

public entry fun create_and_transfer(
    treasury_cap: &mut TreasuryCap<HEHEHE>,
    recepient: address,
    amount: u64,
    ctx: &mut TxContext,
) {
    coin::mint_and_transfer(treasury_cap, amount, recepient, ctx)
}

/// Manager can burn coins
public entry fun burn(treasury_cap: &mut TreasuryCap<HEHEHE>, coin: Coin<HEHEHE>) {
    coin::burn(treasury_cap, coin);
}
