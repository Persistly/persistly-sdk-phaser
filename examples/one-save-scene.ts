import Phaser from "phaser";
import {
  PersistlyPhaserStatus,
  bindPersistlyPhaserLifecycle,
  createPersistlyPhaserSaves,
} from "@persistlyapp/phaser";

const saves = createPersistlyPhaserSaves({
  runtimeKey: "ps_test_replace_me",
  deviceLabel: "Browser",
});

export class MainScene extends Phaser.Scene {
  private coins = 0;
  private unbindPersistlyLifecycle?: () => void;

  async create() {
    await saves.start();
    const loaded = await saves.loadData();
    if (loaded.status === PersistlyPhaserStatus.LocalFound && loaded.data) {
      this.coins = Number(loaded.data.coins ?? 0);
    }

    this.unbindPersistlyLifecycle = bindPersistlyPhaserLifecycle({
      events: this.events,
      service: saves,
      lifecycle: {
        getState: () => ({ coins: this.coins }),
        getSlotInfo: () => ({ coins: this.coins }),
        syncOnPause: true,
        syncOnShutdown: true,
      },
    });
  }

  async collectCoin() {
    this.coins += 1;
    await saves.saveData({ coins: this.coins }, { slotInfo: { coins: this.coins } });
  }

  async checkpoint() {
    await saves.forceSyncData();
  }

  destroy() {
    this.unbindPersistlyLifecycle?.();
  }
}
