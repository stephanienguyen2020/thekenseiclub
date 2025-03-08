from fastapi import HTTPException
import httpx
BASE_URL="https://api.geckoterminal.com/api/v2"

async def get_sorted_trending_pools(include: str = "base_token,quote_token", page: int = 1, duration: str = "1h"):
    """
    Fetch trending pools on the Sui network and sort them by `pool_created_at` from the most recent to the least recent.
    
    Args:
        include (str): Related resources to include.
        page (int): Page number for results.
        duration (str): Duration for sorting the trending list.

    Returns:
        JSON response containing trending pools sorted by `pool_created_at`.
    """
    
    url = f"{BASE_URL}/networks/sonic/trending_pools"
    params = {
        "include": include,
        "page": page,
        "duration": duration
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            # Extract 'included' if present
            included_data = data.get("included", [])

            # Sort the 'data' field based on 'pool_created_at' in descending order
            sorted_data = sorted(
                data.get("data", []),
                key=lambda pool: pool["attributes"].get("pool_created_at", ""),
                reverse=True
            )

            return {"data": sorted_data, "included": included_data}
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=response.status_code, detail=f"HTTP error: {e.response.json()}")
    
    
async def get_ohlcv_data(
    network: str,
    pool_address: str,
    timeframe: str = "hour",
    aggregate: int = 1,
    before_timestamp: int = None,
    limit: int = 100,
    currency: str = "usd",
    token: str = "base"
):
    """
    Fetch OHLCV data for a specific pool on a given network.

    Args:
        network (str): Network ID (e.g., "eth", "sui-network").
        pool_address (str): Address of the pool.
        timeframe (str): Timeframe for the OHLCV data (e.g., "day", "hour", "minute").
        aggregate (int): Aggregation period for each OHLCV data point.
        before_timestamp (int): Return OHLCV data before this timestamp (in seconds since epoch).
        limit (int): Limit the number of OHLCV results (default: 100, max: 1000).
        currency (str): Return data in "usd" or "quote" currency (default: "usd").
        token (str): Return data for "base" or "quote" token (default: "base").

    Returns:
        JSON response containing OHLCV data.
    """
    url = f"{BASE_URL}/networks/{network}/pools/{pool_address}/ohlcv/{timeframe}"
    params = {
        "aggregate": aggregate,
        "before_timestamp": before_timestamp,
        "limit": limit,
        "currency": currency,
        "token": token,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            response_data = response.json()
            data = response_data['data']['attributes']['ohlcv_list']
            return {'data': data}
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=response.status_code, detail=f"HTTP error: {e.response.json()}")
    
async def find_liquidity_pool_by_token(
    token_address: str,
    network: str = "sui-network",
    include: str = "base_token,quote_token,dex",
    page: int = 1
):
    """
    Find the liquidity pool address based on the token address.

    Args:
        token_address (str): The token address to search for.
        network (str, optional): The network ID (e.g., "sui-network").
        include (str, optional): Additional attributes to include in the response.
        page (int, optional): The page number of results.

    Returns:
        JSON response with matching liquidity pools.
    """
    url = f"{BASE_URL}/search/pools"
    params = {
        "query": token_address,
        "network": network,
        "include": include,
        "page": page,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data
            # # Extract pool addresses from the response
            # pools = [
            #     {
            #         "name": pool.get("attributes", {}).get("name", "Unknown Pool"),
            #         "address": pool.get("attributes", {}).get("address", "Unknown Address"),
            #     }
            #     for pool in data.get("data", [])
            # ]
            
            # return {"pools": pools}
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=response.status_code, detail=f"HTTP error: {e.response.json()}")
    
async def get_specific_token(
    token_address: str,
    network: str = "sui-network",
    include: str = "top_pools"
):
    """
    Fetch details of a specific token on a network.

    Args:
        network (str): The network ID (e.g., "eth", "sui-network").
        token_address (str): The address of the token to fetch details for.
        include (str, optional): Additional attributes to include, such as "top_pools".

    Returns:
        JSON response with the token details.
    """
    url = f"{BASE_URL}/networks/{network}/tokens/{token_address}"
    params = {"include": include}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=response.status_code, detail=f"HTTP error: {e.response.json()}")