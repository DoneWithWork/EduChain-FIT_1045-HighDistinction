import { bcs, fromHex, toHex } from '@mysten/bcs';
import { SuiClient, SuiObjectRef } from "@mysten/sui/client";
import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import {
    generateNonce,
    generateRandomness,
    getZkLoginSignature
} from "@mysten/sui/zklogin";
const Address = bcs.bytes(32).transform({
    input: (val: string) => fromHex(val),
    output: (val) => toHex(val),
});

type GetZkProofProps = {
    jwt: string;
    extendedEphemeralPublicKey: string;
    maxEpoch: number;
    randomness: string;
};

type newCertificateMintTransactionProps = {
    studentEmail: string;
    studentAddress: string;
    fullName: string;
    issuerName: string;
    courseImageUrl: string;
    createdAt: string;
}

// PublicZkLoginService handles the public aspects of the ZK login flow on the frontend
class PublicZkLoginService {
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

    // Construct Google OAuth URL
    async constructGoogleAuthUrl(nonce: string): Promise<string> {
        const url = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);
        url.searchParams.set("client_id", this.GOOGLE_CLIENT_ID);
        url.searchParams.set("response_type", "id_token");
        url.searchParams.set("redirect_uri", this.REDIRECT_URL);
        url.searchParams.set("scope", "openid email profile");
        url.searchParams.set("nonce", nonce);
        return url.toString();
    }

    // Get ZK login salt from backend
    async getZkLoginSalt(idToken: string, publicKey: Ed25519PublicKey) {
        const zkRes = await fetch("/api/google/address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idToken,
                publicKey,
            }),
        });
        if (!zkRes.ok) throw new Error("Failed to get zkLogin address");
        const { salt } = await zkRes.json();
        return salt
    }

    // Create new certificate mint transaction
    async newCertificateMintTransaction({
        studentEmail,
        studentAddress,
        fullName,
        issuerName,
        courseImageUrl,
        createdAt
    }: newCertificateMintTransactionProps) {

        const tx = new Transaction();

        const createdDate = new Date(createdAt);
        const expiryDate = new Date(createdDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const expiryTimestampMs = expiryDate.getTime();

        console.log('Preparing to serialize strings...');

        try {
            tx.moveCall({
                target: `${process.env.NEXT_PUBLIC_SUI_SMART_CONTRACT}::cert::new_cert`,
                arguments: [
                    tx.object(process.env.NEXT_PUBLIC_SUI_FACTORY_OBJ!),
                    tx.pure(bcs.string().serialize(studentEmail).toBytes()),
                    tx.pure(Address.serialize(studentAddress).toBytes()),
                    tx.pure(bcs.string().serialize(fullName).toBytes()),
                    tx.pure(bcs.string().serialize(issuerName || "Institution").toBytes()),
                    tx.pure(bcs.string().serialize("Course Completion Cert").toBytes()),
                    tx.pure(bcs.string().serialize(courseImageUrl || "").toBytes()),
                    tx.pure(bcs.string().serialize(createdDate.toDateString()).toBytes()),
                    tx.pure(bcs.u64().serialize(expiryTimestampMs).toBytes()),
                ],
                typeArguments: [],
            });


            console.log('Building transaction...');

            const bytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });

            return bytes;

        } catch (error) {
            console.error('Encoding error:', error);
            throw error;
        }
    }

    // Sponsor a transaction by calling the backend sponsorship service
    async newSponsoredTransaction(address: string, bytes: Uint8Array<ArrayBuffer>) {
        const sponsoredRes = await fetch("/api/google/sponsor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                zkLoginAddress: address,
                transactionKindBytes: Buffer.from(bytes).toString("base64"),
            }),
        });

        if (!sponsoredRes.ok)
            throw new Error("Failed to get sponsored transaction");

        const { sponsoredBytes, sponsorSignature } = await sponsoredRes.json();

        return {
            sponsoredBytes,
            sponsorSignature
        };
    }



}

class PrivateZkLoginService {

    private readonly ENOKI_PRIVATE_KEY = process.env.ENOKI_PRIVATE_KEY || "";
    private readonly PROVER_URL = process.env.PROVER_URL || "https://api.enoki.mystenlabs.com/v1/zklogin/zkp";
    private readonly SALT_ENDPOINT = process.env.SALT_ENDPOINT || "https://api.enoki.mystenlabs.com/v1/zklogin";
    private readonly suiClient: SuiClient;
    private readonly sponsorKeypair: Ed25519Keypair; // signer that will pay gas
    private readonly sponsorAddress: string;
    private readonly ephemeralKeyPair: Ed25519Keypair = Ed25519Keypair.fromSecretKey(
        process.env.SUI_PRIVATE_KEY!
    );
    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient;
        this.sponsorKeypair = Ed25519Keypair.fromSecretKey(process.env.SUI_PRIVATE_KEY!);
        this.sponsorAddress = this.sponsorKeypair.getPublicKey().toSuiAddress();
    }
    async returnPaymentObj() {
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
        return payment;
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

    async getPartialLoginZkSignature({ jwt, extendedEphemeralPublicKey, maxEpoch, randomness }: GetZkProofProps) {
        try {
            const body = {
                ephemeralPublicKey: (extendedEphemeralPublicKey),
                maxEpoch: +maxEpoch,
                randomness: (randomness!),
                network: "testnet"
            };
            console.log("ex", extendedEphemeralPublicKey)
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
    async returnSponsoredTransaction(
        userAddress: string,
        transactionKindBytesBase64: string
    ): Promise<{ sponsoredBytes: string; sponsorSignature: string }> {
        try {
            console.log('Starting sponsorship for user:', userAddress);

            // Decode the transaction kind bytes
            const transactionKindBytes = Uint8Array.from(
                Buffer.from(transactionKindBytesBase64, 'base64')
            );

            console.log('Transaction kind bytes length:', transactionKindBytes.length);

            // Rebuild transaction from kind bytes
            const transaction = Transaction.fromKind(transactionKindBytes);

            // Set the sender
            transaction.setSender(this.sponsorAddress);

            console.log('Transaction reconstructed from kind');

            // Get sponsor's payment objects
            const payment = await this.returnPaymentObj();
            // Set gas configuration
            transaction.setGasPayment(payment);
            transaction.setGasOwner(this.sponsorAddress);
            transaction.setGasBudget(10000000);

            console.log('Gas configuration set, building transaction bytes...');

            // Build the transaction to get bytes BEFORE signing
            const transactionBytes = await transaction.build({
                client: this.suiClient,
            });

            console.log('Transaction built, now signing as sponsor...');

            // Sign the transaction as sponsor
            const sponsorSignature = await this.ephemeralKeyPair.signTransaction(
                transactionBytes
            );

            console.log('✅ Transaction signed successfully by sponsor');

            return {
                sponsoredBytes: Buffer.from(transactionBytes).toString('base64'),
                sponsorSignature: sponsorSignature.signature,
            };
        } catch (error) {
            console.error('❌ Error in returnSponsoredTransaction:', error);
            throw new Error(
                `Failed to sponsor transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

}
export type PartialZkLoginSignature = Omit<
    Parameters<typeof getZkLoginSignature>['0']['inputs'],
    'addressSeed'
>;
export { PrivateZkLoginService, PublicZkLoginService };

