import express from "express";
import {db} from "../db/database";
import {sql} from "kysely";

const router = express.Router();

router.get('/ohlcv', async (req: any, res: any) => {
    const bondingCurveId = req.query.bonding_curve_id;
    const resolution = req.query.resolution || '15 minutes';
    const from = req.query.from?.trim();
    const to = req.query.to?.trim();

    const fromSql = from ? `'${from}'::timestamp` : 'NULL';
    const toSql = to ? `'${to}'::timestamp` : 'NULL';

    const rawQuery = `
        WITH bounds AS (SELECT COALESCE(${fromSql}, MIN("timestamp")) AS from_ts,
                               COALESCE(${toSql}, MAX("timestamp"))   AS to_ts
                        FROM raw_prices
                        WHERE "bondingCurveId" = '${bondingCurveId}')
        SELECT time_bucket('${resolution}', "timestamp") AS time,
         "bondingCurveId",
         MAX(price) AS high,
         FIRST(price, timestamp) AS open,
         LAST(price, timestamp) AS close,
         MIN(price) AS low
        FROM raw_prices, bounds
        WHERE "bondingCurveId" = '${bondingCurveId}'
          AND "timestamp" >= bounds.from_ts
          AND "timestamp" <= bounds.to_ts
        GROUP BY time, "bondingCurveId"
        ORDER BY time DESC;
    `;


    try {
        const rs = await sql<any>(rawQuery as any).execute(db);
        return res.json(rs);
    } catch (err: any) {
        console.error("Error executing query:", err);
        return res.status(500).json({error: "Internal Server Error"});
    }
});

export default router;