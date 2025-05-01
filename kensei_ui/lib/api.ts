import axios from "axios";

// Get environment variables
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  `http://${process.env.BE_HOST || "localhost"}:${
    process.env.BE_PORT || "3001"
  }`;
// Create axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
