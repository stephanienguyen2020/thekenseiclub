interface CoinResponse {
  message: string;
  network: string;
  coin: {
    id: string;
    name: string;
    symbol: string;
    price: string;
    description: string;
    imageUrl: string;
    address: string;
    createdAt: string;
  }
}