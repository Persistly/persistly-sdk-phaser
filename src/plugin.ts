import { createPersistlyPhaserSaves } from "./service.js";
import type {
  PersistlyPhaserConfig,
  PersistlyPhaserJsonObject,
  PersistlyPhaserLifecycleOptions,
  PersistlyPhaserSaves,
  PhaserEventEmitterLike,
} from "./types.js";

export interface PersistlyPhaserLifecycleBindingOptions<TState extends PersistlyPhaserJsonObject> {
  events: PhaserEventEmitterLike;
  service: Pick<PersistlyPhaserSaves, "saveData" | "forceSyncData" | "syncDue">;
  lifecycle?: PersistlyPhaserLifecycleOptions<TState>;
}

export function bindPersistlyPhaserLifecycle<TState extends PersistlyPhaserJsonObject>(
  options: PersistlyPhaserLifecycleBindingOptions<TState>,
): () => void {
  const lifecycle = options.lifecycle ?? {};
  const listeners: Array<[string, () => void]> = [];

  const flush = async () => {
    if (lifecycle.getState) {
      const data = await lifecycle.getState();
      const slotInfo = lifecycle.getSlotInfo ? await lifecycle.getSlotInfo() : undefined;
      await options.service.saveData(data, slotInfo === undefined ? undefined : { slotInfo });
      await options.service.forceSyncData();
      return;
    }

    await options.service.syncDue();
  };

  const bind = (event: string, enabled: boolean | undefined) => {
    if (!enabled) {
      return;
    }

    const listener = () => {
      void flush().catch((error: unknown) => {
        lifecycle.onError?.(error);
      });
    };
    options.events.on(event, listener);
    listeners.push([event, listener]);
  };

  bind("pause", lifecycle.syncOnPause);
  bind("blur", lifecycle.syncOnBlur);
  bind("hidden", lifecycle.syncOnHidden);
  bind("shutdown", lifecycle.syncOnShutdown);

  return () => {
    for (const [event, listener] of listeners) {
      if (options.events.off) {
        options.events.off(event, listener);
      } else {
        options.events.removeListener?.(event, listener);
      }
    }
  };
}

export class PersistlyPhaserPlugin {
  static readonly key = "PersistlyPhaserPlugin";

  readonly pluginManager: unknown;
  service: PersistlyPhaserSaves | undefined;
  private unbindLifecycle: (() => void) | undefined;

  constructor(pluginManager: unknown) {
    this.pluginManager = pluginManager;
    this.service = undefined;
    this.unbindLifecycle = undefined;
  }

  boot(): void {
    // Phaser calls this for global plugins. Configuration remains explicit so runtime keys never live in plugin setup.
  }

  async configure<TState extends PersistlyPhaserJsonObject>(
    config: PersistlyPhaserConfig,
    lifecycle?: PersistlyPhaserLifecycleOptions<TState>,
  ): Promise<PersistlyPhaserSaves> {
    this.service = createPersistlyPhaserSaves(config);
    await this.service.start();

    const events = findPhaserEvents(this.pluginManager);
    if (events && lifecycle) {
      this.unbindLifecycle?.();
      this.unbindLifecycle = bindPersistlyPhaserLifecycle({
        events,
        service: this.service,
        lifecycle,
      });
    }

    return this.service;
  }

  destroy(): void {
    this.unbindLifecycle?.();
    this.unbindLifecycle = undefined;
    this.service = undefined;
  }
}

function findPhaserEvents(pluginManager: unknown): PhaserEventEmitterLike | undefined {
  if (!isRecord(pluginManager)) {
    return undefined;
  }

  const game = pluginManager["game"];
  if (!isRecord(game)) {
    return undefined;
  }

  const events = game["events"];
  if (isEventEmitterLike(events)) {
    return events;
  }

  return undefined;
}

function isEventEmitterLike(value: unknown): value is PhaserEventEmitterLike {
  return isRecord(value) && typeof value["on"] === "function";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
