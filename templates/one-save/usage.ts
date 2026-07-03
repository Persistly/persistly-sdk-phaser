import Phaser from "phaser";
import {
  configure,
  load,
  saveLocal,
  syncCheckpoint,
  type PlayerSaveData,
} from "./persistly-phaser-save-service.js";

export class MainScene extends Phaser.Scene {
  private state: PlayerSaveData = {
    level: 1,
    coins: 0,
    checkpoint: "start",
  };

  async create() {
    await configure("ps_test_replace_me");

    const existing = await load();
    if (existing) {
      this.state = existing;
    }
  }

  async collectCoin() {
    this.state = {
      ...this.state,
      coins: Number(this.state.coins ?? 0) + 1,
    };
    await saveLocal(this.state);
  }

  async checkpoint(nextCheckpoint: string) {
    this.state = {
      ...this.state,
      checkpoint: nextCheckpoint,
    };
    await saveLocal(this.state);
    await syncCheckpoint();
  }
}
