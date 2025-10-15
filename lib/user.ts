import { db } from "@/db/db";
import { users } from "@/db/schema";
import { SuiObjectRef } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { eq } from "drizzle-orm";
import { suiClient } from "./sui";

class User {

    private SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY || "";

    constructor() {
        console.log("User class init");
    }

    private async getProfile(id: number | string) {
        const profile = await db.select().from(users).where(
            eq(users.id, Number(id))
        )
        return profile[0];
    }

    private async createSponsoredTransaction() {
        const privateKeyOwner = Ed25519Keypair.fromSecretKey(this.SUI_PRIVATE_KEY);
        const publicKeyOwner = privateKeyOwner.getPublicKey().toSuiAddress();

        // Find all Coin objects owned by address to fund transaction
        let payment: SuiObjectRef[] = [];
        let retries = 10;
        while (retries !== 0) {
            const coins = await suiClient.getCoins({ owner: publicKeyOwner, limit: 1 });

            if (coins.data.length > 0) {
                payment = coins.data.map((coin) => ({
                    objectId: coin.coinObjectId,
                    version: coin.version,
                    digest: coin.digest
                }))
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
            retries--;
        }

        // Initiate the sponsored transaction
        const sponsoredTxn = new Transaction();
        sponsoredTxn.setGasPayment(payment);
        sponsoredTxn.setGasBudget(100000);




    }
    private async mintContract() {

    }

}

export { User };
