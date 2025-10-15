// server/zkLoginService.ts
import { SuiClient, SuiObjectRef } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import {
    generateNonce,
    generateRandomness,
    getZkLoginSignature
} from "@mysten/sui/zklogin"; // keep path consistent with your SDK version


type GetZkProofProps = {
    jwt: string;
    extendedEphemeralPublicKey: string;
    maxEpoch: number;
    randomness: Uint8Array | string;
};

export class PublicZkLoginService {
    private readonly suiClient: SuiClient;
    private readonly GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    private readonly REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL || "";
    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient;
    }
    async createNewClientInfo(): Promise<{ nonce: string; ephemeralKeyPair: string; maxEpoch: number; randomness: string }> {
        const { epoch } = await this.suiClient.getLatestSuiSystemState();
        const maxEpoch = Number(epoch) + 7;
        const ephemeralKeyPair = new Ed25519Keypair();
        const randomness = generateRandomness();
        const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);


        return { nonce, ephemeralKeyPair: ephemeralKeyPair.getSecretKey(), maxEpoch, randomness: randomness };
    }

    // 2) Construct Google OAuth URL (frontend will redirect user to this)
    async constructGoogleAuthUrl(nonce: string): Promise<string> {
        const url = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);
        url.searchParams.set("client_id", this.GOOGLE_CLIENT_ID);
        url.searchParams.set("response_type", "id_token");
        url.searchParams.set("redirect_uri", this.REDIRECT_URL);
        url.searchParams.set("scope", "openid email profile");
        url.searchParams.set("nonce", nonce);
        return url.toString();
    }
}

type SponsorTypeProps = {
    sender: string;
    transactionKindBytes: string
}
class ZkLoginService {

    private readonly ENOKI_PRIVATE_KEY = process.env.ENOKI_PRIVATE_KEY || "";
    private readonly PROVER_URL = process.env.PROVER_URL || "https://api.enoki.mystenlabs.com/v1/zklogin/zkp";
    private readonly SALT_ENDPOINT = process.env.SALT_ENDPOINT || "https://api.enoki.mystenlabs.com/v1/zklogin";
    private readonly suiClient: SuiClient;
    private readonly sponsorKeypair: Ed25519Keypair; // signer that will pay gas
    private readonly sponsorAddress: string;

    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient;
        this.sponsorKeypair = Ed25519Keypair.fromSecretKey(process.env.SUI_PRIVATE_KEY!);
        this.sponsorAddress = this.sponsorKeypair.getPublicKey().toSuiAddress();
    }

    async createSponsoredTransaction({ sender, transactionKindBytes }: SponsorTypeProps) {

        let payment: SuiObjectRef[] = []
        let retries = 50;

        while (retries !== 0) {
            const coins = await this.suiClient.getCoins({ owner: this.sponsorAddress, limit: 1 });
            if (coins.data.length > 0) {
                payment = coins.data.map((coin) => ({
                    objectId: coin.coinObjectId,
                    version: coin.version,
                    digest: coin.digest,
                }));
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
            retries -= 1;
        }
        const trxBytes = Uint8Array.from(Buffer.from(transactionKindBytes, 'base64'));
        const transaction = Transaction.fromKind(trxBytes);
        transaction.setSender(sender);
        transaction.setGasOwner(this.sponsorAddress);
        transaction.setGasPayment(payment);
        const { bytes, signature } = await this.sponsorKeypair.signTransaction(await transaction.build({ client: this.suiClient }));
        return { bytes, signature };

    }

    // 3) Get salt from your salt service (Enoki salt server) - returns string decimal or base64 depending on endpoint
    async getSaltFromServer(jwt: string): Promise<string | null> {
        try {
            const res = await fetch(this.SALT_ENDPOINT, {
                method: "GET",
                headers: {
                    "zklogin-jwt": jwt,
                    Authorization: `Bearer ${this.ENOKI_PRIVATE_KEY}`,
                },
            });
            if (!res.ok) {
                console.error("getSaltFromServer non-ok:", res.status, await res.text());
                return null;
            }
            const data = await res.json();
            return data.data.salt
        } catch (e) {
            console.error("getSaltFromServer error:", e);
            return null;
        }
    }



    // 4) Request ZK proof from prover 
    async getZkProof({ jwt, extendedEphemeralPublicKey, maxEpoch, randomness }: GetZkProofProps) {
        try {
            const body = {
                ephemeralPublicKey: extendedEphemeralPublicKey,
                maxEpoch: +maxEpoch,
                randomness: randomness,
                network: "testnet"
            };

            const res = await fetch(this.PROVER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "zklogin-jwt": jwt,
                    Authorization: `Bearer ${this.ENOKI_PRIVATE_KEY}`,
                },
                body: JSON.stringify(body),
            });

            const json = await res.json();
            if (!res.ok) {
                console.error("Prover error:", res.status, json);
                throw new Error("Prover request failed: " + (json?.error || res.status));
            }
            const partialZkLoginSignature = json.data as PartialZkLoginSignature;
            return partialZkLoginSignature;

        } catch (e) {
            console.error("getZkProof error:", e);
            throw e;
        }
    }


}
type PartialZkLoginSignature = Omit<
    Parameters<typeof getZkLoginSignature>['0']['inputs'],
    'addressSeed'
>;
export { ZkLoginService };

