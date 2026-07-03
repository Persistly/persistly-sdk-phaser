import assert from "node:assert/strict";
import test from "node:test";
import { PersistlyGameSaves } from "@persistlyapp/sdk";
import { createPersistlyPhaserSaves } from "../src/service.js";

test("saveData delegates to the configured SDK instance", async () => {
  const calls: unknown[] = [];
  const service = createPersistlyPhaserSaves({
    runtimeKey: "ps_test_fake",
    gameSaves: {
      saveData: async (...args: unknown[]) => {
        calls.push(args);
        return { status: "local_saved", target: "slot", slotId: "autosave" };
      },
    } as never,
  });

  const result = await service.saveData({ level: 1 }, { slotInfo: { level: 1 } });

  assert.equal(result.status, "local_saved");
  assert.deepEqual(calls, [[{ level: 1 }, { slotInfo: { level: 1 } }]]);
});

test("forceSyncSlot uses configured default slot id", async () => {
  const calls: unknown[] = [];
  const service = createPersistlyPhaserSaves({
    runtimeKey: "ps_test_fake",
    slotId: "manual-1",
    gameSaves: {
      forceSync: async (...args: unknown[]) => {
        calls.push(args);
        return { status: "synced", target: "slot", slotId: "manual-1" };
      },
    } as never,
  });

  const result = await service.forceSyncSlot();

  assert.equal(result.status, "synced");
  assert.deepEqual(calls, [["manual-1", undefined]]);
});

test("conflict helpers delegate to default or explicit slots", async () => {
  const calls: unknown[] = [];
  const service = createPersistlyPhaserSaves({
    runtimeKey: "ps_test_fake",
    slotId: "manual-1",
    gameSaves: {
      acceptCloudData: async () => {
        calls.push(["acceptCloudData"]);
        return { status: "accepted_cloud", target: "slot", slotId: "autosave" };
      },
      overwriteCloudVersion: async (...args: unknown[]) => {
        calls.push(["overwriteCloudVersion", ...args]);
        return { status: "synced", target: "slot", slotId: "manual-1" };
      },
      keepLocalForLater: async (...args: unknown[]) => {
        calls.push(["keepLocalForLater", ...args]);
        return { status: "local_saved", target: "slot", slotId: "manual-2" };
      },
    } as never,
  });

  await service.acceptCloudData();
  await service.overwriteCloudVersion(undefined, { bypassCooldown: true });
  await service.keepLocalForLater("manual-2");

  assert.deepEqual(calls, [
    ["acceptCloudData"],
    ["overwriteCloudVersion", "manual-1", { bypassCooldown: true }],
    ["keepLocalForLater", "manual-2"],
  ]);
});

test("auth helpers pass device label without logging provider tokens", async () => {
  const calls: unknown[] = [];
  const service = createPersistlyPhaserSaves({
    runtimeKey: "ps_test_fake",
    deviceLabel: "Browser",
    gameSaves: {
      connectWithFirebaseToken: async (...args: unknown[]) => {
        calls.push(args);
        return {
          accountId: "acc_test",
          accountSessionToken: "pst_test",
          isNewAccount: false,
          linkedProvider: "firebase",
          wasProviderNewForAccount: true,
        };
      },
    } as never,
  });

  const result = await service.connectWithFirebaseToken("provider-token");

  assert.equal(result.linkedProvider, "firebase");
  assert.deepEqual(calls, [["provider-token", { deviceLabel: "Browser" }]]);
});

test("syncDue delegates to the SDK facade syncDue method", async () => {
  const calls: unknown[] = [];
  const service = createPersistlyPhaserSaves({
    runtimeKey: "ps_test_fake",
    gameSaves: {
      syncDue: async (...args: unknown[]) => {
        calls.push(args);
        return [{ status: "no_changes", target: "slot", slotId: "autosave" }];
      },
    } as never,
  });

  const result = await service.syncDue({ includeSkipped: true });

  assert.deepEqual(result, [{ status: "no_changes", target: "slot", slotId: "autosave" }]);
  assert.deepEqual(calls, [[{ includeSkipped: true }]]);
});

test("start configures the core SDK with Phaser diagnostics", async () => {
  const originalConfigure = PersistlyGameSaves.configure;
  let configured: unknown;

  PersistlyGameSaves.configure = async (config: unknown) => {
    configured = config;
  };

  try {
    const service = createPersistlyPhaserSaves({
      runtimeKey: "ps_test_fake",
      platform: "browser",
      engineVersion: "3.90.0",
    });

    await service.start();

    assert.deepEqual(configured, {
      runtimeKey: "ps_test_fake",
      platform: "browser",
      engineVersion: "3.90.0",
      sdkName: "phaser",
      sdkVersion: "0.1.0",
    });
  } finally {
    PersistlyGameSaves.configure = originalConfigure;
  }
});
