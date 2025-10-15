import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';


export const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export async function newPrivateKey() {
    const keyPair = new Ed25519Keypair();
    return keyPair.getSecretKey();
}



