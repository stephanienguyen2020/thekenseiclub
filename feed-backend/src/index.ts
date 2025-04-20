import express from 'express';
import {setupListeners} from "./indexer/event-indexer";
import ohlcvRouter from "./routes/ohlcv";
import coinRouter from "./routes/coin";
// import './indexer/cron';

export const app = express();
export const port = 3000;
setupListeners();

app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello from TypeScript API!');
});

app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.use(ohlcvRouter);
app.use(coinRouter);
