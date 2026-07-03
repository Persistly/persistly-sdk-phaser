# Persistly Phaser Adapter

Phaser adapter for Persistly cloud saves, powered by `@persistlyapp/sdk`.

Use this package when you want Phaser-friendly save helpers and optional lifecycle wiring while keeping Persistly runtime behavior in the JavaScript SDK.

## Install

```bash
npm install @persistlyapp/phaser phaser
```

## Quickstart

```ts
import Phaser from "phaser";
import {
  PersistlyPhaserStatus,
  createPersistlyPhaserSaves,
} from "@persistlyapp/phaser";

const saves = createPersistlyPhaserSaves({
  runtimeKey: "ps_test_replace_me",
  deviceLabel: "Browser",
});

export class MainScene extends Phaser.Scene {
  private coins = 0;

  async create() {
    await saves.start();
    const loaded = await saves.loadData();
    if (loaded.status === PersistlyPhaserStatus.LocalFound && loaded.data) {
      this.coins = Number(loaded.data.coins ?? 0);
    }
  }

  async collectCoin() {
    this.coins += 1;
    await saves.saveData({ coins: this.coins }, { slotInfo: { coins: this.coins } });
  }

  async checkpoint() {
    await saves.forceSyncData();
  }
}
```

`saveData` writes local-first data to the default `autosave` slot. Call `forceSyncData` at safe moments such as manual save, checkpoint, pause, blur, or scene shutdown.

## Named Slots

```ts
await saves.saveSlot("slot-1", {
  level: 8,
  coins: 420,
}, {
  slotInfo: { label: "Knight", level: 8 },
});

const slot = await saves.loadSlot("slot-1");
await saves.forceSyncSlot("slot-1");
const slots = await saves.listSlots();
```

For save-select screens, keep the full save state in `saveSlot` and small preview fields in `slotInfo`. Load `listSlots()` for the menu, then call `loadSlot(slotId)` only after the player chooses the slot.

## Lifecycle Binder

The adapter does not serialize your game state automatically. Provide callbacks when you want lifecycle events to save and sync the current state.

```ts
import { bindPersistlyPhaserLifecycle } from "@persistlyapp/phaser";

const unbind = bindPersistlyPhaserLifecycle({
  events: this.events,
  service: saves,
  lifecycle: {
    getState: () => ({ coins: this.coins }),
    getSlotInfo: () => ({ coins: this.coins }),
    syncOnPause: true,
    syncOnShutdown: true,
  },
});
```

If no `getState` callback is supplied, lifecycle events call `syncDue()` for already-dirty local data.

## Phaser Plugin Registration

You can also register the adapter as a Phaser global plugin and configure it from a boot scene.

```ts
import Phaser from "phaser";
import { PersistlyPhaserPlugin } from "@persistlyapp/phaser";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  plugins: {
    global: [
      {
        key: PersistlyPhaserPlugin.key,
        plugin: PersistlyPhaserPlugin,
        start: true,
      },
    ],
  },
});
```

Then fetch the plugin from Phaser and configure it once:

```ts
const plugin = this.plugins.get(PersistlyPhaserPlugin.key) as PersistlyPhaserPlugin;
const saves = await plugin.configure({
  runtimeKey: "ps_test_replace_me",
  deviceLabel: "Browser",
}, {
  getState: () => ({ coins: this.coins }),
  syncOnPause: true,
});
```

## Auth Bridge

Use Auth Bridge when your game already signs players in with Firebase Auth, Supabase Auth, or Auth0. Persistly verifies the provider token once and returns a normal Persistly account session. Save, load, and sync calls do not send provider tokens.

```ts
import {
  createPersistlyPhaserSaves,
  isPersistlyAccountAuthConflict,
} from "@persistlyapp/phaser";

const saves = createPersistlyPhaserSaves({
  runtimeKey: "ps_test_replace_me",
  accountMode: "anonymousFirst",
  deviceLabel: "Browser",
});

try {
  await saves.connectWithFirebaseToken(firebaseIdToken);
} catch (error) {
  if (!isPersistlyAccountAuthConflict(error)) {
    throw error;
  }

  showAccountChoiceUi();
}
```

For sign-in-first games, use `signInWithFirebaseToken`, `signInWithSupabaseToken`, or `signInWithAuth0Token`. For anonymous-first games that connect later, use `connectWithFirebaseToken`, `connectWithSupabaseToken`, or `connectWithAuth0Token`.

If a provider identity is already linked to another Persistly account, Persistly returns `account_auth_conflict` and preserves the current local anonymous progress. Do not merge, copy, import, or overwrite another provider-linked account automatically.

## API Surface

- `createPersistlyPhaserSaves(config)`
- `start`
- `saveData`, `loadData`, `forceSyncData`
- `acceptCloudData`, `overwriteCloudData`, `keepLocalDataForLater`
- `saveSlot`, `loadSlot`, `forceSyncSlot`, `listSlots`
- `acceptCloudVersion`, `overwriteCloudVersion`, `keepLocalForLater`
- `syncDue`
- `signInWithFirebaseToken`, `signInWithSupabaseToken`, `signInWithAuth0Token`
- `connectWithFirebaseToken`, `connectWithSupabaseToken`, `connectWithAuth0Token`
- `signOut`
- `bindPersistlyPhaserLifecycle`
- `PersistlyPhaserPlugin`

The adapter re-exports `PersistlyGameSaveStatus` as `PersistlyPhaserStatus`, plus `PersistlyGameSaveStatus` and `isPersistlyAccountAuthConflict` from `@persistlyapp/sdk`.

## Security

Keep runtime keys environment-specific. Keep provider tokens and Persistly account session tokens out of logs, analytics, crash reports, and public repositories.
