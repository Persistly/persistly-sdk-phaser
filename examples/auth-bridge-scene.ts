import Phaser from "phaser";
import {
  createPersistlyPhaserSaves,
  isPersistlyAccountAuthConflict,
} from "@persistlyapp/phaser";

const saves = createPersistlyPhaserSaves({
  runtimeKey: "ps_test_replace_me",
  accountMode: "anonymousFirst",
  deviceLabel: "Browser",
});

export class AuthBridgeScene extends Phaser.Scene {
  async create() {
    await saves.start();
  }

  async connectFirebase(firebaseIdToken: string) {
    try {
      await saves.connectWithFirebaseToken(firebaseIdToken);
    } catch (error) {
      if (isPersistlyAccountAuthConflict(error)) {
        this.showAccountChoiceUi();
        return;
      }

      throw error;
    }
  }

  async signInWithSupabase(supabaseAccessToken: string) {
    await saves.signInWithSupabaseToken(supabaseAccessToken);
  }

  async signInWithAuth0(auth0Token: string) {
    await saves.signInWithAuth0Token(auth0Token);
  }

  private showAccountChoiceUi() {
    // Keep local progress active. Let the player retry with another provider identity
    // or explicitly clear local Persistly state before signing into the linked account.
  }
}
