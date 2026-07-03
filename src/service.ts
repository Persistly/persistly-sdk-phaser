import { PersistlyGameSaves } from "@persistlyapp/sdk";
import type {
  PersistlyGameSavesConfig,
  PersistlyGameSavesSaveSlotOptions,
  PersistlyGameSavesSyncOptions,
} from "@persistlyapp/sdk";
import type {
  PersistlyPhaserConfig,
  PersistlyPhaserGameSavesLike,
  PersistlyPhaserJsonObject,
  PersistlyPhaserSaves,
} from "./types.js";
import { PERSISTLY_PHASER_SDK_NAME, PERSISTLY_PHASER_SDK_VERSION } from "./version.js";

const DEFAULT_SLOT_ID = "autosave";

type PersistlyGameSavesConfigWithDiagnostics = PersistlyGameSavesConfig & {
  sdkName: typeof PERSISTLY_PHASER_SDK_NAME;
  sdkVersion: typeof PERSISTLY_PHASER_SDK_VERSION;
  clientVersion?: string;
  platform?: string;
  engineVersion?: string;
};

export function createPersistlyPhaserSaves(config: PersistlyPhaserConfig): PersistlyPhaserSaves {
  const slotId = config.slotId ?? DEFAULT_SLOT_ID;
  let started = Boolean(config.gameSaves);
  let gameSaves: PersistlyPhaserGameSavesLike = config.gameSaves ?? PersistlyGameSaves.shared;

  const service: PersistlyPhaserSaves = {
    async start() {
      if (started) {
        return;
      }

      await PersistlyGameSaves.configure(toGameSavesConfig(config));
      gameSaves = PersistlyGameSaves.shared;
      started = true;
    },

    async saveData(data: PersistlyPhaserJsonObject, options?: PersistlyGameSavesSaveSlotOptions) {
      await service.start();
      return await gameSaves.saveData(data, options);
    },

    async loadData() {
      await service.start();
      return await gameSaves.loadData();
    },

    async forceSyncData(options?: PersistlyGameSavesSyncOptions) {
      await service.start();
      return await gameSaves.forceSyncData(options);
    },

    async acceptCloudData() {
      await service.start();
      return await gameSaves.acceptCloudData();
    },

    async overwriteCloudData(options?: PersistlyGameSavesSyncOptions) {
      await service.start();
      return await gameSaves.overwriteCloudData(options);
    },

    async keepLocalDataForLater() {
      await service.start();
      return await gameSaves.keepLocalDataForLater();
    },

    async saveSlot(nextSlotId: string, data: PersistlyPhaserJsonObject, options?: PersistlyGameSavesSaveSlotOptions) {
      await service.start();
      return await gameSaves.saveSlot(nextSlotId, data, options);
    },

    async loadSlot(nextSlotId: string) {
      await service.start();
      return await gameSaves.loadSlot(nextSlotId);
    },

    async forceSyncSlot(nextSlotId = slotId, options?: PersistlyGameSavesSyncOptions) {
      await service.start();
      return await gameSaves.forceSync(nextSlotId, options);
    },

    async acceptCloudVersion(nextSlotId = slotId) {
      await service.start();
      return await gameSaves.acceptCloudVersion(nextSlotId);
    },

    async overwriteCloudVersion(nextSlotId = slotId, options?: PersistlyGameSavesSyncOptions) {
      await service.start();
      return await gameSaves.overwriteCloudVersion(nextSlotId, options);
    },

    async keepLocalForLater(nextSlotId = slotId) {
      await service.start();
      return await gameSaves.keepLocalForLater(nextSlotId);
    },

    async listSlots(options?: { includeArchived?: boolean }) {
      await service.start();
      return await gameSaves.listSlots(options);
    },

    async syncDue(options?: PersistlyGameSavesSyncOptions) {
      await service.start();
      return await gameSaves.syncDue(options);
    },

    async signInWithFirebaseToken(token: string) {
      await service.start();
      return await gameSaves.signInWithFirebaseToken(token, authOptions(config));
    },

    async signInWithSupabaseToken(token: string) {
      await service.start();
      return await gameSaves.signInWithSupabaseToken(token, authOptions(config));
    },

    async signInWithAuth0Token(token: string) {
      await service.start();
      return await gameSaves.signInWithAuth0Token(token, authOptions(config));
    },

    async connectWithFirebaseToken(token: string) {
      await service.start();
      return await gameSaves.connectWithFirebaseToken(token, authOptions(config));
    },

    async connectWithSupabaseToken(token: string) {
      await service.start();
      return await gameSaves.connectWithSupabaseToken(token, authOptions(config));
    },

    async connectWithAuth0Token(token: string) {
      await service.start();
      return await gameSaves.connectWithAuth0Token(token, authOptions(config));
    },

    async signOut() {
      await service.start();
      return await gameSaves.signOut();
    },
  };

  return service;
}

function authOptions(config: PersistlyPhaserConfig): { deviceLabel?: string } {
  return config.deviceLabel === undefined ? {} : { deviceLabel: config.deviceLabel };
}

function toGameSavesConfig(config: PersistlyPhaserConfig): PersistlyGameSavesConfigWithDiagnostics {
  const { deviceLabel: _deviceLabel, gameSaves: _gameSaves, slotId: _slotId, ...gameSavesConfig } = config;
  return {
    ...gameSavesConfig,
    sdkName: PERSISTLY_PHASER_SDK_NAME,
    sdkVersion: PERSISTLY_PHASER_SDK_VERSION,
  };
}
