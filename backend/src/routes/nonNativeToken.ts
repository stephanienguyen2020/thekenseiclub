import { Router } from "express";
import { NonNativeTokenService } from "../services/NonNativeTokenService";

const router = Router();
const nonNativeTokenService = new NonNativeTokenService();

// Get all tokens with pagination and platform filtering
router.get("/tokens", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const platform = req.query.platform as string;

    const result = await nonNativeTokenService.getTokenList(
      page,
      limit,
      platform
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tokens", details: error });
  }
});

// Update token list from CoinGecko
router.post("/tokens/update", async (req, res) => {
  try {
    const tokens = await nonNativeTokenService.updateTokenList();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: "Failed to update tokens", details: error });
  }
});

// Get token by ID
router.get("/tokens/:coingeckoId", async (req, res) => {
  try {
    const { coingeckoId } = req.params;
    const token = await nonNativeTokenService.getTokenById(coingeckoId);

    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch token", details: error });
  }
});

// Get OHLC data for a specific coin
router.get("/ohlc/:coinId", async (req, res) => {
  try {
    const { coinId } = req.params;
    const vsCurrency = (req.query.vs_currency as string) || "usd";
    const ohlcData = await nonNativeTokenService.getOHLCData(
      coinId,
      vsCurrency
    );
    res.json(ohlcData);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch OHLC data", details: error });
  }
});

// Update OHLC data for all tokens
router.post("/ohlc/update", async (req, res) => {
  try {
    const vsCurrency = (req.query.vs_currency as string) || "usd";
    const days = parseInt(req.query.days as string) || 365;

    const result = await nonNativeTokenService.updateAllOHLCData(
      vsCurrency,
      days
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to update OHLC data for all tokens",
        details: error,
      });
  }
});

export default router;
