import {
  PersistlyPhaserStatus,
  createPersistlyPhaserSaves,
  type PersistlyPhaserJsonObject,
  type PersistlyPhaserSaves,
} from "@persistlyapp/phaser";

export type SlotSaveData = PersistlyPhaserJsonObject;
export type SlotPreview = {
  slotId: string;
  label: string;
  level?: number;
  updatedAt?: string;
};

let saves: PersistlyPhaserSaves | undefined;

export async function configure(runtimeKey: string): Promise<PersistlyPhaserSaves> {
  saves = createPersistlyPhaserSaves({
    runtimeKey,
    deviceLabel: "Browser",
  });
  await saves.start();
  return saves;
}

export async function listSlotPreviews(): Promise<SlotPreview[]> {
  const slots = await requireSaves().listSlots();
  return slots.map((slot) => {
    const preview: SlotPreview = {
      slotId: String(slot.slotId ?? "autosave"),
      label: String(slot.slotInfo?.label ?? slot.slotId ?? "Save slot"),
    };

    if (typeof slot.slotInfo?.level === "number") {
      preview.level = slot.slotInfo.level;
    }
    const updatedAt = slot.lastRemoteSyncedAt ?? slot.lastLocalSavedAt;
    if (updatedAt !== undefined) {
      preview.updatedAt = updatedAt;
    }

    return preview;
  });
}

export async function loadSlot(slotId: string): Promise<SlotSaveData | null> {
  const loaded = await requireSaves().loadSlot(slotId);
  return loaded.status === PersistlyPhaserStatus.LocalFound
    ? loaded.data ?? null
    : null;
}

export async function saveSlotLocal(slotId: string, data: SlotSaveData) {
  return await requireSaves().saveSlot(slotId, data, { slotInfo: summarizeSlot(data) });
}

export async function syncSlotCheckpoint(slotId: string) {
  return await requireSaves().forceSyncSlot(slotId);
}

function requireSaves(): PersistlyPhaserSaves {
  if (!saves) {
    throw new Error("Persistly Phaser saves are not configured.");
  }

  return saves;
}

function summarizeSlot(data: SlotSaveData): PersistlyPhaserJsonObject {
  const slotInfo: PersistlyPhaserJsonObject = {};
  if (typeof data["label"] === "string") {
    slotInfo["label"] = data["label"];
  }
  if (typeof data["level"] === "number") {
    slotInfo["level"] = data["level"];
  }
  if (typeof data["checkpoint"] === "string") {
    slotInfo["checkpoint"] = data["checkpoint"];
  }
  return slotInfo;
}
