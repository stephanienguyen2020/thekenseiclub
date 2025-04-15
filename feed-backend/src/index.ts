import express from 'express';

export const app = express();
export const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from TypeScript API!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
