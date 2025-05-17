import {
  AggregatorQuoter,
  Coin,
  Commission,
  CommissionType,
  TradeBuilder,
} from "@flowx-finance/sdk";
import { SUI_COIN_TYPE } from "./constant";
import { SuiClient } from "@mysten/sui/client";
import { ACTIVE_NETWORK, Network } from "./utils/sui-utils";
import { getFullnodeUrl } from "@mysten/sui/client";

export async function buildSwapTransaction(
  coinTypeA: string,
  coinTypeB: string,
  amountIn: string,
  address: string,
  network: Network
): Promise<any> {
  const routes = await getRoutes(coinTypeA, coinTypeB, amountIn);
  const tradeBuilder = new TradeBuilder(network as any, routes.routes); //routes get from quoter
  const commission = new Commission(
    address,
    new Coin(SUI_COIN_TYPE),
    CommissionType.PERCENTAGE,
    "1"
  );
  const trade = tradeBuilder
    .sender(address)
    .amountIn(amountIn)
    .amountOut(routes.amountOut) // Estimate amount out, usual get from quoter
    .slippage((1 / 100) * 1e6) // Slippage 1%
    .deadline(Date.now() + 3600) // 1 hour from now
    .commission(commission) // Commission will be explain later
    .build();
  return trade.buildTransaction({
    client: new SuiClient({ url: getFullnodeUrl(network) }) as any,
  });
}

export async function getRoutes(
  coinTypeA: string,
  coinTypeB: string,
  amountIn: string
) {
  const quoter = new AggregatorQuoter(ACTIVE_NETWORK as any);
  const params: any = {
    tokenIn: coinTypeA,
    tokenOut: coinTypeB,
    amountIn: amountIn,
    includeSources: null,
    excludeSources: null,
    commission: null,
  };

  const routes = await quoter.getRoutes(params);
  return routes;
}
