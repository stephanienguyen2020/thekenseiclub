import express, { Request, Response } from "express";
import { db } from "../db/database";
import { sql } from "kysely";

const router = express.Router();

/**
 * Interface for OHLCV data returned from the database
 */
interface OHLCVData {
  time: Date;
  bondingCurveId: string;
  high: string;
  open: string;
  close: string;
  low: string;
}

/**
 * Endpoint to retrieve OHLCV data for a bonding curve
 * @route GET /ohlcv
 * @param {Request} req - Express request object with query parameters
 * @param {Response} res - Express response object
 * @returns {Response} JSON array of OHLCV data points or error message
 */
router.get("/ohlcv", async (req: any, res: any) => {
  try {
    const bondingCurveId = req.query.bonding_curve_id;
    const resolution = req.query.resolution || "15 minutes";
    const from = req.query.from ? req.query.from.trim() : undefined;
    const to = req.query.to ? req.query.to.trim() : undefined;

    console.log(from)
    console.log(to)

    if (!bondingCurveId) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: bonding_curve_id" });
    }

    if (!from) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: from" });
    }

    if (!to) {
      return res.status(400).json({ error: "Missing required parameter: to" });
    }

    // Use parameterized query with Kysely's sql tag to prevent SQL injection
    const query = sql<OHLCVData>`
            SELECT
                time_bucket(${resolution}, "timestamp") AS time,
                "bonding_curve_id",
                MAX(price) AS high,
                FIRST(price, timestamp) AS open,
                LAST(price, timestamp) AS close,
                MIN(price) AS low
            FROM raw_prices
            WHERE "bonding_curve_id" = ${bondingCurveId}
                AND "timestamp" >= ${from}::timestamp
                AND "timestamp" <= ${to}::timestamp
            GROUP BY time, "bonding_curve_id"
            ORDER BY time DESC
        `;

    console.log(query.compile(db).sql);

    let previousOHLC = await db.selectFrom("rawPrices")
      .select('price')
      .where('bondingCurveId', "=", bondingCurveId)
      .where('timestamp', '<', from)
      .orderBy("timestamp", "desc")
      .executeTakeFirst();

    query
      .execute(db)
      .then((result) => {
        const ohlcs = result.rows;

        console.log(ohlcs)
        if (!ohlcs || ohlcs.length === 0) {
          return res.status(200).json([]);
        }

        let previousClose = ohlcs[0].open;
        if (previousOHLC) {
          previousClose = previousOHLC.price.toString();
        }
        console.log(previousClose)

        return res.status(200).json(transformOHLC(ohlcs, previousClose));
      })
      .catch((error) => {
        console.error("Error executing query:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

function transformOHLC(ohlcs:  OHLCVData[], prevClose: string, nextOpen?: string) {
  ohlcs[0].open = prevClose.toString();
  for (let i = 1; i < ohlcs.length; i++) {
    ohlcs[i].open = ohlcs[i - 1].close;
  }
  return ohlcs;
}

export default router;
