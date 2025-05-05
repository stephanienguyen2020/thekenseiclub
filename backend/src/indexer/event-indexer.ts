// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {
  EventId,
  SuiClient,
  SuiEvent,
  SuiEventFilter,
} from "@mysten/sui/client";

import { CONFIG } from "../config";
import { handleBondingCurveEvent } from "./trade-handler";
import { ACTIVE_NETWORK, getClient } from "../utils";
import { db } from "../db/database";

type SuiEventsCursor = EventId | null | undefined;

type EventExecutionResult = {
  cursor: SuiEventsCursor;
  hasNextPage: boolean;
};

type EventTracker = {
  type: string;
  filter: SuiEventFilter;
  callback: (events: SuiEvent[], type: string) => Promise<void>;
};

const EVENTS_TO_TRACK: EventTracker[] = [
  {
    type: `${CONFIG.BONDING_CURVE.packageId}::bonding_curve`,
    filter: {
      MoveEventModule: {
        module: "bonding_curve",
        package: CONFIG.BONDING_CURVE.packageId || "",
      },
    },
    callback: handleBondingCurveEvent,
  },
];

const executeEventJob = async (
  client: SuiClient,
  tracker: EventTracker,
  cursor: SuiEventsCursor
): Promise<EventExecutionResult> => {
  try {
    const { data, hasNextPage, nextCursor } = await client.queryEvents({
      query: tracker.filter,
      cursor,
      order: "ascending",
    });

    await tracker.callback(data, tracker.type);

    if (nextCursor && data.length > 0) {
      await saveLatestCursor(tracker, nextCursor);

      return {
        cursor: nextCursor,
        hasNextPage,
      };
    }
  } catch (error: unknown) {
    console.error(error);
  }
  // By default, we return the same cursor as passed in.
  return {
    cursor,
    hasNextPage: false,
  };
};

const runEventJob = async (
  client: SuiClient,
  tracker: EventTracker,
  cursor: SuiEventsCursor
) => {
  const result = await executeEventJob(client, tracker, cursor);

  setTimeout(
    () => {
      runEventJob(client, tracker, result.cursor);
    },
    result.hasNextPage ? 0 : CONFIG.POLLING_INTERVAL_MS
  );
};

const getLatestCursor = async (
  tracker: EventTracker
): Promise<SuiEventsCursor> => {
  const cursor = await db
    .selectFrom("cursors")
    .selectAll()
    .where("id", "=", tracker.type)
    .executeTakeFirst();

  if (cursor) {
    return {
      txDigest: cursor.txDigest,
      eventSeq: cursor.eventSeq,
    };
  }

  return undefined;
};

const saveLatestCursor = async (tracker: EventTracker, cursor: EventId) => {
  const data = {
    id: tracker.type,
    eventSeq: cursor.eventSeq,
    txDigest: cursor.txDigest,
  };

  return await db
    .insertInto("cursors")
    .values(data)
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        eventSeq: cursor.eventSeq,
        txDigest: cursor.txDigest,
      })
    )
    .execute();
};

export const setupListeners = async () => {
  for (const event of EVENTS_TO_TRACK) {
    runEventJob(getClient(ACTIVE_NETWORK), event, await getLatestCursor(event));
  }
};
