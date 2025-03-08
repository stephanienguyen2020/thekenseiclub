import time
from typing import Optional
from fastapi import APIRouter, Query

from app.service.search.coingeckco import find_liquidity_pool_by_token, get_ohlcv_data, get_sorted_trending_pools, get_specific_token
router = APIRouter(tags=["coins"], prefix="/coins")
        
@router.get("/trending_pools")
async def trending_pools(
    include: str = Query("base_token,quote_token", description="Attributes to include."),
    page: int = Query(1, ge=1, description="Page number for results."),
    duration: str = Query("1h", description="Duration for sorting the trending list.")
):
    return await get_sorted_trending_pools(include=include, page=page, duration=duration)

# Endpoint to fetch OHLCV data
@router.get("/ohlcv")
async def ohlcv_data(
    network: str,
    pool_address: str,
    timeframe: str = Query("hour", description="Timeframe for OHLCV data."),
    aggregate: int = Query(1, ge=1, description="Aggregation period."),
    limit: int = Query(100, ge=1, le=1000, description="Number of results to return."),
    currency: str = Query("usd", description="Currency (usd or quote)."),
    token: str = Query("base", description="Base or quote token.")
):
    before_timestamp = int(time.time())
    return await get_ohlcv_data(
        network=network,
        pool_address=pool_address,
        timeframe=timeframe,
        aggregate=aggregate,
        before_timestamp=before_timestamp,
        limit=limit,
        currency=currency,
        token=token,
    )

# Endpoint to find liquidity pools by token
@router.get("/find_pool")
async def find_pool(
    token_address: str,
    network: str = Query("sui-network", description="Network ID."),
    include: str = Query("base_token,quote_token,dex", description="Attributes to include."),
    page: int = Query(1, ge=1, description="Page number for results.")
):
    return await find_liquidity_pool_by_token(
        token_address=token_address,
        network=network,
        include=include,
        page=page,
    )

# Endpoint to get details about a specific token
@router.get("/token")
async def specific_token(
    token_address: str,
    network: str = Query("sui-network", description="Network ID."),
    include: str = Query("top_pools", description="Attributes to include, such as 'top_pools'.")
):
    return await get_specific_token(
        token_address=token_address,
        network=network,
        include=include,
    )