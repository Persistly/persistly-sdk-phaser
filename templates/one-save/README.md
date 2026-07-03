# One-Save Phaser Template

Use this template when your Phaser game has one current save, such as an idle, casual, or chapter-based game. It uses the default `autosave` slot through `saveData`, `loadData`, and `forceSyncData`.

## Files

- `persistly-phaser-save-service.ts` wraps the Phaser adapter behind game-shaped functions.
- `usage.ts` shows where to call the service from a Phaser scene.

## Setup

Install the adapter and Phaser peer dependency:

```bash
npm install @persistlyapp/phaser phaser
```

Paste the service into your project, call `configure` once during startup, call `saveLocal` whenever local gameplay state changes, and call `syncCheckpoint` from safe lifecycle moments such as manual save, checkpoint, pause, blur, or scene shutdown.

If Auth Bridge returns an account conflict, keep the local progress active and show a player choice. Do not merge, copy, import, or overwrite another provider-linked account automatically.
