from datetime import datetime, timedelta
from typing import Dict, Optional
import aiohttp
from app.constant.pumpfun import BITQUERY_HEADERS, BITQUERY_URL, DEV_HOLDINGS_QUERY, GET_FIST_BUYERS_PUMPFUN_TOKEN_QUERY, GET_TOKEN_INFORMATION, GET_TOP_TRADER_TOKEN_PUMPFUN_DEX_QUERY, GET_TRADING_VOLUME_TOKEN_QUERY, HISTORICAL_PRICE_AND_VOLUME_QUERY, PUMPFUN_TOKEN_LATEST_TRADES_QUERY, TOKEN_CREATION_QUERY, TOP_HOLDERS_QUERY, TOP_MARKET_CAP_PUMPFUN_COIN, TOP_TOKEN_CREATORS_PUMPFUN_QUERY, VOLUME_AND_MARKETCAP_QUERY
import pandas as pd

async def fetch_bitquery_data(query: str, variables: Dict[str, str]) -> Optional[Dict]:
    """
    Helper function to send a GraphQL request to the BitQuery API.
    
    :param query: GraphQL query string.
    :param variables: Variables to be passed into the query.
    :return: Parsed JSON response or None if the request fails.
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(BITQUERY_URL, headers=BITQUERY_HEADERS, json={"query": query, "variables": variables}) as response:
                if response.status != 200:
                    return None
                return await response.json()
    except Exception as e:
        return None
    
async def get_top_token_holders(token_mint_address: str) -> list[dict[str, str]]:
    """
    Fetches the top 10 holders of a specific token.
    
    :param token_mint_address: The mint address of the token on Solana.
    :return: A list of top holders with their balance.
    """
    try:
        data = await fetch_bitquery_data(TOP_HOLDERS_QUERY, {"token": token_mint_address})
        if not data:
            holders = []

        # Extract holder details safely
        holders = [
            {
                "holder_address": holder['BalanceUpdate']['Account']['Address'],
                "percentage": float(holder['BalanceUpdate']['Holding']) / 1e7,
                "token_name": holder['BalanceUpdate']['Currency']['Name'],
                "symbol": holder['BalanceUpdate']['Currency']['Symbol']
            }
            for holder in data.get('data', {}).get('Solana', {}).get('BalanceUpdates', [])
        ]

        return {"data": holders}

    except Exception as e:
        return {"error": str(e)}

async def get_dev_holdings(dev_address: str, token_mint_address: str) -> int:
    """
    Fetches the developer's holdings of a specific token.
    
    :param dev_address: The wallet address of the developer.
    :param token_mint_address: The mint address of the token on Solana.
    :return: The developer's token balance. (in %)
    """
    try:
        data = await fetch_bitquery_data(DEV_HOLDINGS_QUERY, {"dev": dev_address, "token": token_mint_address})

        if not data:
            return {'data': 0}

        # Extract balance safely
        holdings = data.get('data', {}).get('Solana', {}).get('BalanceUpdates', [])
        return {'data': holdings[0]['BalanceUpdate']['balance'] if holdings else 0}
    except Exception as e:
        return {"error": str(e)}

async def get_volume_and_marketcap(token_mint_address: str, side: str) -> list[dict[str, str]]:
    try:
        now = datetime.utcnow()
        time_1h_ago = (now - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
        data = await fetch_bitquery_data(VOLUME_AND_MARKETCAP_QUERY, {"token": token_mint_address, "side":side, "time_1h_ago": time_1h_ago})
        if not data:
            return {"error": "Failed to fetch token creation info"}
        
        df = pd.json_normalize(data)

        df.rename(columns={
            'liquidity.Pool.Base.PostAmountInUSD': 'liquidity_in_usd',
            'marketcap.TokenSupplyUpdate.PostBalanceInUSD': 'marketcap_in_usd',
            'marketcap.TokenSupplyUpdate.Currency.Name': 'token_name',
            'marketcap.TokenSupplyUpdate.Currency.Symbol': 'symbol',
            'marketcap.TokenSupplyUpdate.Currency.MintAddress': 'mint_address',
        }, inplace=True)
        return {
            "metadata": {
                "token_mint_address": token_mint_address,
                "side": side,
                "time_1h_ago": time_1h_ago
            },
            "data": df.to_dict(orient='records')
        }
    except Exception as e:
        return {"error": str(e)}


async def get_top_market_cap_pumpfun_coin():
    """Fetches the top market cap memecoin on Pump Fun."""
    try:
        data = await fetch_bitquery_data(TOP_MARKET_CAP_PUMPFUN_COIN, None)
        data = data.get('data', {}).get('Solana', {}).get('TokenSupplyUpdates', [])
        
        if not data:
            data = []
            
        return {'data': data}
    except Exception as e:
        return {"error": str(e)}

async def get_token_information(
    token_mint_address: str,
    before_timestamp: datetime
) -> dict:
    """
    Get Buy Volume, Sell Volume, Buys, Sells, Makers, Total Trade Volume, Buyers, Sellers of a specific Token
    """
    try:
        before_timestamp = before_timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
        curr_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        if before_timestamp > curr_time:
            return {"error": "Invalid timestamp"}
        
        variables = {
            "token": token_mint_address,
            "before_timestamp": before_timestamp,
        }
        data = await fetch_bitquery_data(GET_TOKEN_INFORMATION, variables)
        if not data:
            data = []
        else:
            data = data.get('data', {}).get('Solana', {}).get('DEXTradeByTokens', [])

        return {"data": data}
    except Exception as e:
        return {"error": str(e)}


async def fetch_top_token_creators():
    """
    Fetches the top token creators on Pump Fun
    """
    try:
        data = await fetch_bitquery_data(TOP_TOKEN_CREATORS_PUMPFUN_QUERY, None)
        if not data:
            data = []
        else:
            data = data.get('data', {}).get('Solana', {}).get('Instructions', [])

        return {"data": data}
    except Exception as e:
        return {"error": str(e)}
    
async def get_top_traders(token_address: str, limit: int = 10) -> dict:
    """
    Fetches the top traders of a specific token on Pump Fun DEX.

    :param token_address: The token's mint address.
    :return: List of top traders sorted by volume in USD.
    """
    try:
        variables = {"token": token_address, "limit": limit}
        data = await fetch_bitquery_data(GET_TOP_TRADER_TOKEN_PUMPFUN_DEX_QUERY, variables = variables)
        
        if not data:
            return {"data": []}
        else:
            traders = data.get('data', {}).get('Solana', {}).get('DEXTradeByTokens', [])
        return {"data": traders}
    
    except Exception as e:
        return {"error": str(e)}
    
async def get_trading_volume_on_dexs(    
    token_mint_address: str,
    before_timestamp: datetime
):
    """
    Fetches the trading volume of a specific token on multiple DEXs since $since_time.

    :param token_address: The token's mint address.
    :param hours_ago: The time frame in hours to fetch trading volume.
    :return: List of dictionaries containing DEX name and corresponding trading volume.
    """
    try:
        before_timestamp = before_timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")
        curr_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        if before_timestamp > curr_time:
            return {"error": "Invalid timestamp"}
        
        variables = {
            "token": token_mint_address,
            "since_time": before_timestamp,
        }
        
        data = await fetch_bitquery_data(GET_TRADING_VOLUME_TOKEN_QUERY, variables)
        if not data:
            data = []
        else:
            print(data)
            data = data.get('data', {}).get('Solana', {}).get('DEXTradeByTokens', [])

        return {"data": data}
    except Exception as e:
        return {"error": str(e)}
    
async def get_first_buyers(token_address: str, limit: int = 100):
    """
    Fetches the first 'limit' buyers of a specific token on Pump Fun DEX.

    :param token_address: The token's mint address.
    :param limit: The number of first buyers to retrieve (default is 100).
    :return: List of dictionaries containing buyer addresses and their purchase amounts.
    """
    try:
        variables = {
            "token": token_address,
            "limit": limit
        }
        
        data = await fetch_bitquery_data(GET_FIST_BUYERS_PUMPFUN_TOKEN_QUERY, variables)
        if not data:
            data = []
        else:
            print(data)
            data = data.get('data', {}).get('Solana', {}).get('DEXTrades', [])

        return {"data": data}
    except Exception as e:
        return {"error": str(e)}
    
# Get Latest Trades for a Pump Fun Token
async def get_latest_trades(token_address: str, limit: int = 50):
    """
    Fetches the latest trades for a specific token on Pump Fun DEX.

    :param token_address: The token's mint address.
    :param limit: The number of latest trades to retrieve (default is 50).
    :return: List of dictionaries containing trade details.
    """
    try:
        variables = {
            "token": token_address,
            "limit": limit
        }
        data = await fetch_bitquery_data(PUMPFUN_TOKEN_LATEST_TRADES_QUERY, variables)
        if not data:
            data = []
        else:
            print(data)
            data = data.get('data', {}).get('Solana', {}).get('DEXTradeByTokens', [])

        return {"data": data}
    
    except Exception as e:
        return {"error": str(e)}
    
# ===================== NOT USED =====================
async def get_last_n_transactions(token_mint_address: str, n: int) -> list[dict[str, str]]:
    
    data = await fetch_bitquery_data(HISTORICAL_PRICE_AND_VOLUME_QUERY, {"token": token_mint_address, "n": n,})
    if not data:
        return {"error": "Failed to fetch token creation info"}

    df = pd.json_normalize(data)

    df.rename(columns={
        'Block.Time': 'time',
        'Trade.PriceInUSD': 'price_in_usd',
        'Trade.Account.Address': 'address',
        'Trade.Account.Owner': 'owner',
        'Trade.Amount': 'amount',
        'Trade.Price': 'price',
        'Transaction.Signature': 'transaction_signature'
    }, inplace=True)

    df['time'] = pd.to_datetime(df['time'])

    df['volume'] = pd.to_numeric(df['volume'])
    df['volume_in_usd'] = pd.to_numeric(df['volume_in_usd'])

    return {
        "metadata": {
            "token_mint_address": token_mint_address,
            "n": n
        },
        "data": df.to_dict(orient='records')
    }
    

async def get_historical_price_and_volume(token_mint_address: str, since: datetime, interval_in: str, interval_count: int) -> list[dict[str, str]]:
    data = await fetch_bitquery_data(HISTORICAL_PRICE_AND_VOLUME_QUERY, {"token": token_mint_address, "since": since, "interval_in": interval_in, "interval_count": interval_count})
    if not data:
        return {"error": "Failed to fetch token creation info"}

    df = pd.json_normalize(data)

    df.rename(columns={
        'Block.Timefield': 'time',
        'Trade.open': 'open',
        'Trade.high': 'high',
        'Trade.low': 'low',
        'Trade.close': 'close',
    }, inplace=True)

    df['time'] = pd.to_datetime(df['time'])

    df['volume'] = pd.to_numeric(df['volume'])
    df['volume_in_usd'] = pd.to_numeric(df['volume_in_usd'])

    aggregated = df.groupby('time').agg({
        'open': 'first',   
        'high': 'max',     
        'low': 'min',     
        'close': 'last', 
        'volume': 'sum',
        'volume_in_usd': 'sum'
    })

    return {
        "metadata": {
            "token_mint_address": token_mint_address,
            "since": since,
            "interval_in": interval_in,
            "interval_count": interval_count
        },
        "data": aggregated.to_dict(orient='records')
    }
    
async def get_token_creation_info(token_mint_address: str) -> Dict[str, str]:
    """
    Fetches the creation time and creator of a Pump Fun Token.

    :param token_mint_address: The mint address of the token on Solana.
    :return: A dictionary with creation timestamp and creator address.
    """
    data = await fetch_bitquery_data(TOKEN_CREATION_QUERY, {"token": token_mint_address})

    if not data:
        return {"error": "Failed to fetch token creation info"}

    transaction_data = data.get('data', {}).get('Solana', {}).get('Instructions', [])

    if not transaction_data:
        return {"error": "Token creation info not found"}

    block_time = transaction_data[0]['Block']["Time"]
    creator_address = transaction_data[0]['Transaction']['Signer']

    return {
        "creator": creator_address,
        "creation_time": block_time
    }
# ===================== NOT USED =====================