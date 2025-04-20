import express from "express";
import {CoinSDK} from "coin-sdk/dist/src";
import {ACTIVE_NETWORK, getClient} from "../utils";

const router = express.Router();

interface Coin {
    name: string;
    symbol: string;
    description: string;
    iconUrl: string;
    client: any;
    address: string;
}

router.post('/coin', async (req: any, res: any) => {
    const body : Coin = req.body;
    const suiClient = getClient(ACTIVE_NETWORK);
    await CoinSDK.deployNewCoin({...body, client: suiClient});
    res.sendStatus(200);
})

export default router;