from datetime import datetime, timedelta
from fastapi import APIRouter, Query

from app.service.search.pumpfun import fetch_top_token_creators, get_dev_holdings, get_first_buyers, get_historical_price_and_volume, get_last_n_transactions, get_latest_trades, get_token_creation_info, get_token_information, get_top_market_cap_pumpfun_coin, get_top_token_holders, get_top_traders, get_trading_volume_on_dexs, get_volume_and_marketcap
router = APIRouter(tags=["tools"], prefix="/tools")

@router.get("/pumpfun-top-holders/{token_mint_address}")
async def top_token_holders(token_mint_address: str):
    return await get_top_token_holders(token_mint_address)

@router.get("/pumpfun-dev-holdings/{dev_address}/{token_mint_address}")
async def dev_holdings(dev_address: str, token_mint_address: str):
    return await get_dev_holdings(dev_address, token_mint_address)

@router.get("/pump-volume-marketcap/{token_mint_address}")
async def volume_and_marketcap(
    token_mint_address: str,
    side: str = Query("buy", enum=["buy", "sell"]),
):
    return await get_volume_and_marketcap(token_mint_address, side)

@router.get("/pump-top-market-cap")
async def top_market_cap_pumpfun_coin():
    return await get_top_market_cap_pumpfun_coin()
    
@router.get("/pump-info/{token}")
async def token_information(
    token: str,
    before_timestamp: datetime = Query(None, description="Get token information since this timestamp"),
):
    return await get_token_information(token, before_timestamp)

@router.get("/pump-top-token-creators")
async def token_information():
    return await fetch_top_token_creators()

@router.get("/pump-top-traders-token/{token_mint_address}")
async def get_pumpfun_top_traders(
    token_mint_address: str, 
    limit: int = Query(10, ge=1)
):
    return await get_top_traders(token_address = token_mint_address, limit=limit)

@router.get("/pump-trading-volumes/dexes/{token_mint_address}")
async def get_trading_volume(
    token_mint_address: str,
    before_timestamp: datetime = Query(..., description="Get token information since this timestamp"),
):
    return await get_trading_volume_on_dexs(token_mint_address=token_mint_address, before_timestamp=before_timestamp)

@router.get("/pump-first-token-buyers/{token_mint_address}")
async def get_first_buyer_token(
    token_mint_address: str,
    limit: int = Query(10, ge=1),
):
    return await get_first_buyers(token_address=token_mint_address, limit=limit)

@router.get("/pump-first-latest-trades/{token_mint_address}")
async def get_latest_trades_(
    token_mint_address: str,
    limit: int = Query(10, ge=1),
):
    return await get_latest_trades(token_address=token_mint_address, limit=limit)
################################ NOT USED ################################
    
@router.get("/pumpfun-historical-price-volume/{token_mint_address}")
async def historical_price_and_volume(
    token_mint_address: str,
    since: datetime,
    interval_in: str = Query("hour", enum=["minute", "hour", "day", "week"]),
    interval_count: int = Query(1, ge=1),
):
    try:
        return await get_historical_price_and_volume(token_mint_address, since, interval_in, interval_count)
    except Exception as e:
        return {"error": str(e)}

@router.get("/pump-last-transactions/{token_mint_address}")
async def last_n_transactions(token_mint_address: str, n: int = Query(10, ge=1)):
    try:
        return await get_last_n_transactions(token_mint_address, n)
    except Exception as e:
        return {"error": str(e)}
    
@router.get("/pumpfun-creation-info/{token_mint_address}")
async def token_creation_info(token_mint_address: str):
    try:
        return await get_token_creation_info(token_mint_address)
    except Exception as e:
        return {"error": str(e)}