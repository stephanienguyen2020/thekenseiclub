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
router.get("/ohlcv", (req: any, res: any) => {
  try {
    const bondingCurveId = req.query.bonding_curve_id;
    const resolution = req.query.resolution || "15 minutes";
    const from = req.query.from ? req.query.from.trim() : undefined;
    const to = req.query.to ? req.query.to.trim() : undefined;

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
    console.log("/ohlcv");

    // Use parameterized query with Kysely's sql tag to prevent SQL injection
    sql<OHLCVData>`
            WITH bounds AS (
                SELECT
                    ${sql`${from}::timestamp`} AS from_ts,
                    ${sql`${to}::timestamp`} AS to_ts
                FROM raw_prices
                WHERE "bonding_curve_id" = ${bondingCurveId}
            )
            SELECT
                time_bucket(${resolution}, "timestamp") AS time,
                "bonding_curve_id",
                MAX(price) AS high,
                FIRST(price, timestamp) AS open,
                LAST(price, timestamp) AS close,
                MIN(price) AS low
            FROM raw_prices, bounds
            WHERE "bonding_curve_id" = ${bondingCurveId}
                AND "timestamp" >= bounds.from_ts
                AND "timestamp" <= bounds.to_ts
            GROUP BY time, "bonding_curve_id"
            ORDER BY time DESC
        `
      .execute(db)
      .then((result) => {
        res.json(result);
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

export default router;
