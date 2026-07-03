import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import {
  PersistlyPhaserPlugin,
  bindPersistlyPhaserLifecycle,
} from "../src/plugin.js";

test("lifecycle save calls getState before force sync", async () => {
  const events = new EventEmitter();
  const calls: string[] = [];
  const unbind = bindPersistlyPhaserLifecycle({
    events,
    service: {
      saveData: async () => {
        calls.push("save");
        return { status: "local_saved", target: "slot" };
      },
      forceSyncData: async () => {
        calls.push("sync");
        return { status: "synced", target: "slot" };
      },
    } as never,
    lifecycle: {
      getState: () => ({ level: 2 }),
      syncOnPause: true,
    },
  });

  events.emit("pause");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(calls, ["save", "sync"]);
  unbind();
});

test("lifecycle syncs due data when no state callback is provided", async () => {
  const events = new EventEmitter();
  const calls: string[] = [];
  const unbind = bindPersistlyPhaserLifecycle({
    events,
    service: {
      syncDue: async () => {
        calls.push("syncDue");
        return [];
      },
    } as never,
    lifecycle: {
      syncOnHidden: true,
    },
  });

  events.emit("hidden");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(calls, ["syncDue"]);
  unbind();
});

test("lifecycle unbind removes listeners", async () => {
  const events = new EventEmitter();
  const calls: string[] = [];
  const unbind = bindPersistlyPhaserLifecycle({
    events,
    service: {
      syncDue: async () => {
        calls.push("syncDue");
        return [];
      },
    } as never,
    lifecycle: {
      syncOnBlur: true,
    },
  });

  unbind();
  events.emit("blur");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(calls, []);
});

test("lifecycle routes async failures to the optional error callback", async () => {
  const events = new EventEmitter();
  const errors: unknown[] = [];
  const unbind = bindPersistlyPhaserLifecycle({
    events,
    service: {
      syncDue: async () => {
        throw new Error("sync failed");
      },
    } as never,
    lifecycle: {
      onError: (error) => errors.push(error),
      syncOnPause: true,
    },
  });

  events.emit("pause");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(errors.length, 1);
  assert.match(String(errors[0]), /sync failed/);
  unbind();
});

test("plugin configure starts service and binds game events when available", async () => {
  const events = new EventEmitter();
  const plugin = new PersistlyPhaserPlugin({ game: { events } });
  const calls: string[] = [];

  await plugin.configure({
    runtimeKey: "ps_test_fake",
    gameSaves: {
      saveData: async () => {
        calls.push("save");
        return { status: "local_saved", target: "slot" };
      },
      forceSyncData: async () => {
        calls.push("sync");
        return { status: "synced", target: "slot" };
      },
    } as never,
  }, {
    getState: () => ({ level: 3 }),
    syncOnShutdown: true,
  });

  events.emit("shutdown");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.deepEqual(calls, ["save", "sync"]);
  plugin.destroy();
});
