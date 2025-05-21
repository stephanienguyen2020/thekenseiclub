import { Router } from "express";
import { db } from "../db/database";

const router = Router();

// Get portfolio history for a user
router.get("/history", async (req, res) => {
  try {
    const { user_address, from, to } = req.query;

    if (!user_address) {
      return res.status(400).json({ error: "User address is required" });
    }

    const query = db
      .selectFrom("portfolios")
      .innerJoin("bondingCurve", "portfolios.bondingCurveId", "bondingCurve.id")
      .innerJoin("coins", "bondingCurve.coinMetadata", "coins.id")
      .select([
        "portfolios.amount",
        "portfolios.timestamp",
        "coins.symbol",
        "coins.name",
        "coins.logo",
      ])
      .where("portfolios.userAddress", "=", user_address as string)
      .orderBy("portfolios.timestamp", "desc");

    if (from) {
      query.where("portfolios.timestamp", ">=", new Date(from as string));
    }
    if (to) {
      query.where("portfolios.timestamp", "<=", new Date(to as string));
    }

    const portfolio = await query.execute();

    res.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current portfolio holdings for a user
router.get("/current", async (req, res) => {
  try {
    const { user_address } = req.query;

    if (!user_address) {
      return res.status(400).json({ error: "User address is required" });
    }

    // Get the latest portfolio entry for each bonding curve
    const portfolio = await db
      .selectFrom("portfolios as p1")
      .innerJoin("bondingCurve", "p1.bondingCurveId", "bondingCurve.id")
      .innerJoin("coins", "bondingCurve.coinMetadata", "coins.id")
      .select([
        "p1.amount",
        "p1.timestamp",
        "coins.symbol",
        "coins.name",
        "coins.logo",
      ])
      .where("p1.userAddress", "=", user_address as string)
      .where((eb) =>
        eb.not(
          eb.exists(
            eb
              .selectFrom("portfolios as p2")
              .whereRef("p2.bondingCurveId", "=", "p1.bondingCurveId")
              .whereRef("p2.userAddress", "=", "p1.userAddress")
              .whereRef("p2.timestamp", ">", "p1.timestamp")
          )
        )
      )
      .execute();

    res.json(portfolio);
  } catch (error) {
    console.error("Error fetching current portfolio:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 