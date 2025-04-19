import express from "express";
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

// Use @ts-ignore to bypass the type checking for the Express route handler
// This is necessary due to compatibility issues between Express v5.1.0 and @types/express v5.0.1
// @ts-ignore
router.get('/ohlcv', (req, res) => {
    const bondingCurveId = req.query.bonding_curve_id as string;
    const resolution = (req.query.resolution as string) || '15 minutes';
    const from = req.query.from ? (req.query.from as string).trim() : undefined;
    const to = req.query.to ? (req.query.to as string).trim() : undefined;

    if (!bondingCurveId) {
        return res.status(400).json({ error: "Missing required parameter: bonding_curve_id" });
    }

    if (!from) {
        return res.status(400).json({ error: "Missing required parameter: from" });
    }

    if (!to) {
        return res.status(400).json({ error: "Missing required parameter: to" });
    }

    // Use parameterized query with Kysely's sql tag to prevent SQL injection
    sql<OHLCVData>`
        WITH bounds AS (
            SELECT 
                ${sql`${from}::timestamp`} AS from_ts,
                ${sql`${to}::timestamp`} AS to_ts
            FROM raw_prices
            WHERE "bondingCurveId" = ${bondingCurveId}
        )
        SELECT 
            time_bucket(${resolution}, "timestamp") AS time,
            "bondingCurveId",
            MAX(price) AS high,
            FIRST(price, timestamp) AS open,
            LAST(price, timestamp) AS close,
            MIN(price) AS low
        FROM raw_prices, bounds
        WHERE "bondingCurveId" = ${bondingCurveId}
            AND "timestamp" >= bounds.from_ts
            AND "timestamp" <= bounds.to_ts
        GROUP BY time, "bondingCurveId"
        ORDER BY time DESC
    `.execute(db)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            console.error("Error executing query:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

export default router;
