# Multiple-Slots Phaser Template

Use this template when your Phaser game lets the player choose characters, campaigns, manual saves, or challenge runs. It keeps full save state in each slot and small menu preview fields in `slotInfo`.

## Files

- `persistly-phaser-slot-service.ts` wraps slot save/load/sync methods.
- `usage.ts` shows a simple save-select scene shape.

## Setup

```bash
npm install @persistlyapp/phaser phaser
```

Call `configure` once during startup. Use `listSlotPreviews` for save menus, `loadSlot` after the player chooses a slot, and `saveSlotLocal` whenever local gameplay state changes. Call `syncSlotCheckpoint` at safe moments such as manual save, checkpoint, pause, blur, or scene shutdown.
