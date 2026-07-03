import type {
  PersistlyAccountMode,
  PersistlyAuthSessionResult,
  PersistlyGameSaveSyncResult,
  PersistlyGameSavesConfig,
  PersistlyGameSavesSaveSlotOptions,
  PersistlyGameSavesSyncOptions,
  PersistlySlotInspection,
} from "@persistlyapp/sdk";

export type PersistlyPhaserJsonValue =
  | string
  | number
  | boolean
  | null
  | PersistlyPhaserJsonObject
  | PersistlyPhaserJsonValue[];

export interface PersistlyPhaserJsonObject {
  [key: string]: PersistlyPhaserJsonValue;
}

export type PersistlyPhaserData = PersistlyPhaserJsonObject;
export type PersistlyPhaserSlotInfo = PersistlyPhaserJsonObject;

export interface PersistlyPhaserGameSavesLike {
  saveData(data: PersistlyPhaserJsonObject, options?: PersistlyGameSavesSaveSlotOptions): Promise<PersistlyGameSaveSyncResult>;
  loadData(): Promise<PersistlySlotInspection>;
  forceSyncData(options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  acceptCloudData(): Promise<PersistlyGameSaveSyncResult>;
  overwriteCloudData(options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  keepLocalDataForLater(): Promise<PersistlyGameSaveSyncResult>;
  saveSlot(slotId: string, data: PersistlyPhaserJsonObject, options?: PersistlyGameSavesSaveSlotOptions): Promise<PersistlyGameSaveSyncResult>;
  loadSlot(slotId: string): Promise<PersistlySlotInspection>;
  forceSync(slotId: string, options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  acceptCloudVersion(slotId: string): Promise<PersistlyGameSaveSyncResult>;
  overwriteCloudVersion(slotId: string, options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  keepLocalForLater(slotId: string): Promise<PersistlyGameSaveSyncResult>;
  listSlots(options?: { includeArchived?: boolean }): Promise<PersistlySlotInspection[]>;
  syncDue(options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult[]>;
  signInWithFirebaseToken(token: string, options?: { deviceLabel?: string }): Promise<PersistlyAuthSessionResult>;
  signInWithSupabaseToken(token: string, options?: { deviceLabel?: string }): Promise<PersistlyAuthSessionResult>;
  signInWithAuth0Token(token: string, options?: { deviceLabel?: string }): Promise<PersistlyAuthSessionResult>;
  connectWithFirebaseToken(token: string, options?: { deviceLabel?: string }): Promise<PersistlyAuthSessionResult>;
  connectWithSupabaseToken(token: string, options?: { deviceLabel?: string }): Promise<PersistlyAuthSessionResult>;
  connectWithAuth0Token(token: string, options?: { deviceLabel?: string }): Promise<PersistlyAuthSessionResult>;
  signOut(): Promise<PersistlyGameSaveSyncResult>;
}

export interface PersistlyPhaserConfig extends Omit<PersistlyGameSavesConfig, "onSyncResult" | "sdkName" | "sdkVersion"> {
  runtimeKey: string;
  accountMode?: PersistlyAccountMode;
  slotId?: string;
  deviceLabel?: string;
  clientVersion?: string;
  platform?: string;
  engineVersion?: string;
  gameSaves?: PersistlyPhaserGameSavesLike;
  onSyncResult?: (result: PersistlyGameSaveSyncResult) => void;
}

export interface PersistlyPhaserLifecycleOptions<TState extends PersistlyPhaserJsonObject> {
  getState?: () => TState | Promise<TState>;
  getSlotInfo?: () => PersistlyPhaserSlotInfo | Promise<PersistlyPhaserSlotInfo>;
  onError?: (error: unknown) => void;
  syncOnPause?: boolean;
  syncOnBlur?: boolean;
  syncOnHidden?: boolean;
  syncOnShutdown?: boolean;
}

export interface PersistlyPhaserSaves {
  start(): Promise<void>;
  saveData(data: PersistlyPhaserJsonObject, options?: PersistlyGameSavesSaveSlotOptions): Promise<PersistlyGameSaveSyncResult>;
  loadData(): Promise<PersistlySlotInspection>;
  forceSyncData(options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  acceptCloudData(): Promise<PersistlyGameSaveSyncResult>;
  overwriteCloudData(options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  keepLocalDataForLater(): Promise<PersistlyGameSaveSyncResult>;
  saveSlot(slotId: string, data: PersistlyPhaserJsonObject, options?: PersistlyGameSavesSaveSlotOptions): Promise<PersistlyGameSaveSyncResult>;
  loadSlot(slotId: string): Promise<PersistlySlotInspection>;
  forceSyncSlot(slotId?: string, options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  acceptCloudVersion(slotId?: string): Promise<PersistlyGameSaveSyncResult>;
  overwriteCloudVersion(slotId?: string, options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult>;
  keepLocalForLater(slotId?: string): Promise<PersistlyGameSaveSyncResult>;
  listSlots(options?: { includeArchived?: boolean }): Promise<PersistlySlotInspection[]>;
  syncDue(options?: PersistlyGameSavesSyncOptions): Promise<PersistlyGameSaveSyncResult[]>;
  signInWithFirebaseToken(token: string): Promise<PersistlyAuthSessionResult>;
  signInWithSupabaseToken(token: string): Promise<PersistlyAuthSessionResult>;
  signInWithAuth0Token(token: string): Promise<PersistlyAuthSessionResult>;
  connectWithFirebaseToken(token: string): Promise<PersistlyAuthSessionResult>;
  connectWithSupabaseToken(token: string): Promise<PersistlyAuthSessionResult>;
  connectWithAuth0Token(token: string): Promise<PersistlyAuthSessionResult>;
  signOut(): Promise<PersistlyGameSaveSyncResult>;
}

export interface PhaserEventEmitterLike {
  on(event: string, listener: () => void): unknown;
  off?(event: string, listener: () => void): unknown;
  removeListener?(event: string, listener: () => void): unknown;
}
