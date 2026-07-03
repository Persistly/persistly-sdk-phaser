import {
  PersistlyPhaserStatus,
  createPersistlyPhaserSaves,
  type PersistlyPhaserJsonObject,
  type PersistlyPhaserSaves,
} from "@persistlyapp/phaser";

export type PlayerSaveData = PersistlyPhaserJsonObject;

let saves: PersistlyPhaserSaves | undefined;

export async function configure(runtimeKey: string): Promise<PersistlyPhaserSaves> {
  saves = createPersistlyPhaserSaves({
    runtimeKey,
    deviceLabel: "Browser",
  });
  await saves.start();
  return saves;
}

export async function load(): Promise<PlayerSaveData | null> {
  const loaded = await requireSaves().loadData();
  return loaded.status === PersistlyPhaserStatus.LocalFound
    ? loaded.data ?? null
    : null;
}

export async function saveLocal(data: PlayerSaveData) {
  return await requireSaves().saveData(data, { slotInfo: summarizeSlot(data) });
}

export async function syncCheckpoint() {
  return await requireSaves().forceSyncData();
}

function requireSaves(): PersistlyPhaserSaves {
  if (!saves) {
    throw new Error("Persistly Phaser saves are not configured.");
  }

  return saves;
}

function summarizeSlot(data: PlayerSaveData): PersistlyPhaserJsonObject {
  const slotInfo: PersistlyPhaserJsonObject = {};
  if (typeof data["level"] === "number") {
    slotInfo["level"] = data["level"];
  }
  if (typeof data["checkpoint"] === "string") {
    slotInfo["checkpoint"] = data["checkpoint"];
  }
  return slotInfo;
}
