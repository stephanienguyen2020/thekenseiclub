import { ACTIVE_NETWORK } from "./utils";
import "dotenv/config";

export const CONFIG = {
  BONDING_CURVE: {
    packageId: process.env.PACKAGE_ID,
  },
  NETWORK: ACTIVE_NETWORK,
  POLLING_INTERVAL_MS: 5000,
};
