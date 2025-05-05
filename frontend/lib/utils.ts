import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getClient, Network } from "coin-sdk/dist/sui-utils";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(timestamp: string): string {
  return dayjs(timestamp).fromNow();
}

export function getObject(id: string) {
  const object = getClient(
    (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network
  ).getObject({
    id,
    options: {
      showType: true,
      showContent: true,
      showDisplay: true,
      showOwner: true,
      showPreviousTransaction: true,
    },
  });

  return object;
}
