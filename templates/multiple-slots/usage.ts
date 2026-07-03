import Phaser from "phaser";
import {
  configure,
  listSlotPreviews,
  loadSlot,
  saveSlotLocal,
  syncSlotCheckpoint,
  type SlotSaveData,
  type SlotPreview,
} from "./persistly-phaser-slot-service.js";

export class SaveSelectScene extends Phaser.Scene {
  private selectedSlotId = "slot-1";
  private state: SlotSaveData = {
    label: "Hero",
    level: 1,
    coins: 0,
    checkpoint: "start",
  };

  async create() {
    await configure("ps_test_replace_me");
    this.renderSlots(await listSlotPreviews());
  }

  async chooseSlot(slotId: string) {
    this.selectedSlotId = slotId;
    const loaded = await loadSlot(slotId);
    if (loaded) {
      this.state = loaded;
    }
  }

  async checkpoint(nextCheckpoint: string) {
    this.state = {
      ...this.state,
      checkpoint: nextCheckpoint,
    };
    await saveSlotLocal(this.selectedSlotId, this.state);
    await syncSlotCheckpoint(this.selectedSlotId);
  }

  private renderSlots(_slots: SlotPreview[]) {
    // Render buttons in your Phaser UI and call chooseSlot when the player selects one.
  }
}
