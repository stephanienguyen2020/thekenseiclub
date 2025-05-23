// File: src/indexer/trade-handler.ts
import { db } from "../db/database";
import { BondingCurve, RawPrices } from "../db/kysely-types/postgres";
import { SuiEvent } from "@mysten/sui/client";
import { getClient } from "../utils";

// Define interfaces for the parsed JSON data
interface BondingCurveCreatedEventPayload {
  bonding_curve_id: string;
  issuer: string;
  treasury_cap: string;
  coin_metadata: string;
  migration_target: string;
}

interface TradeEventPayload {
  price: string;
  amount_in: string;
  amount_out: string;
  bonding_curve_id: string;
  direction: string;
  sender: string;
}

// Type guard for BondingCurveCreatedEventPayload
function isBondingCurveCreatedEventPayload(
  payload: unknown
): payload is BondingCurveCreatedEventPayload {
  const p = payload as BondingCurveCreatedEventPayload;
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.bonding_curve_id === "string" &&
    typeof p.issuer === "string" &&
    typeof p.treasury_cap === "string" &&
    typeof p.coin_metadata === "string" &&
    typeof p.migration_target === "string"
  );
}

// Type guard for TradeEventPayload
function isTradeEventPayload(payload: unknown): payload is TradeEventPayload {
  const p = payload as TradeEventPayload;
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.price === "string" &&
    typeof p.amount_in === "string" &&
    typeof p.amount_out === "string" &&
    typeof p.bonding_curve_id === "string"
  );
}

export const handleBondingCurveEvent = async (
  events: SuiEvent[],
  type: string
): Promise<void> => {
  for (const event of events) {
    console.log("Handling bonding curve event", events);
    if (!event.type.startsWith(type))
      throw new Error("Invalid event module origin");

    if (event.type.endsWith("::BondingCurveCreatedEvent")) {
      if (!isBondingCurveCreatedEventPayload(event.parsedJson)) {
        console.error(
          "Invalid BondingCurveCreatedEvent payload:",
          event.parsedJson
        );
        continue;
      }

      const payload = event.parsedJson;
      const bondingCurveData: BondingCurve = {
        id: payload.bonding_curve_id,
        issuer: payload.issuer,
        treasuryCap: payload.treasury_cap,
        coinMetadata: payload.coin_metadata,
        migrationTarget: payload.migration_target,
      };

      const client = getClient();

      const coinMetadata = await client.getObject({
        id: payload.coin_metadata,
        options: {
          showType: true,
          showContent: true,
        },
      });
      console.log("coinMetadata", JSON.stringify(coinMetadata, null, 2));
      await db
        .insertInto("coins")
        .values({
          id: payload.coin_metadata,
          name: coinMetadata.data?.content?.fields?.name,
          symbol: coinMetadata.data?.content?.fields?.symbol,
          description: coinMetadata.data?.content?.fields?.description,
          logo: coinMetadata.data?.content?.fields?.icon_url,
          address: event.sender,
          createdAt: new Date(),
        })
        .execute();

      await db.insertInto("bondingCurve").values(bondingCurveData).execute();
      continue;
    }

    if (!isTradeEventPayload(event.parsedJson)) {
      console.error("Invalid trade event payload:", event.parsedJson);
      continue;
    }

    const payload = event.parsedJson;

    if (event.type.endsWith("::BuyEvent")) {
      payload.direction = "BUY";
    }

    if (event.type.endsWith("::SellEvent")) {
      payload.direction = "SELL";
    }

    // Safely parse timestampMs
    let timestamp: Date;
    if (event.timestampMs !== undefined && event.timestampMs !== null) {
      const timestampNumber = Number(event.timestampMs);
      timestamp = !isNaN(timestampNumber)
        ? new Date(timestampNumber)
        : new Date();
    } else {
      timestamp = new Date();
    }
    const amountIn = parseFloat(payload.amount_in);
    const amountOut = parseFloat(payload.amount_out);

    await db
      .insertInto("rawPrices")
      .values({
        bondingCurveId: payload.bonding_curve_id,
        timestamp: timestamp,
        price:
          payload.direction == "BUY"
            ? amountIn / amountOut
            : amountOut / amountIn,
        amountIn: amountIn,
        amountOut: amountOut,
        direction: payload.direction,
        sender: event.sender,
      })
      .execute();
  }
};
