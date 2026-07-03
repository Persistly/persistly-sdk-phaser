import Phaser from "phaser";
import {
  PersistlyPhaserStatus,
  createPersistlyPhaserSaves,
} from "@persistlyapp/phaser";

const saves = createPersistlyPhaserSaves({
  runtimeKey: "ps_test_replace_me",
  deviceLabel: "Browser",
});

export class SaveSelectScene extends Phaser.Scene {
  private selectedSlotId = "slot-1";

  async create() {
    await saves.start();
    const slots = await saves.listSlots();
    this.renderSaveMenu(slots.map((slot) => ({
      slotId: String(slot.slotId ?? "autosave"),
      label: String(slot.slotInfo?.label ?? slot.slotId ?? "Save slot"),
      level: Number(slot.slotInfo?.level ?? 1),
    })));
  }

  async saveSelectedSlot(state: { level: number; coins: number; checkpoint: string }) {
    await saves.saveSlot(this.selectedSlotId, state, {
      slotInfo: {
        label: `Level ${state.level}`,
        level: state.level,
        checkpoint: state.checkpoint,
      },
    });
    await saves.forceSyncSlot(this.selectedSlotId);
  }

  async loadSelectedSlot() {
    const loaded = await saves.loadSlot(this.selectedSlotId);
    if (loaded.status !== PersistlyPhaserStatus.LocalFound || !loaded.data) {
      return undefined;
    }

    return loaded.data;
  }

  private renderSaveMenu(_slots: Array<{ slotId: string; label: string; level: number }>) {
    // Render buttons in your Phaser UI and set selectedSlotId when the player chooses a slot.
  }
}
