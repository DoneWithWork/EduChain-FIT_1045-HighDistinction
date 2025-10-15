"use client";
import { useZkCredentials } from "@/hooks/useEphemeralSession";
import { suiClient } from "@/lib/sui";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { getExtendedEphemeralPublicKey } from "@mysten/sui/zklogin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleAuthPage() {
  const [status, setStatus] = useState("Verifying your account...");
  const router = useRouter();
  const { zkCredentials, initialized } = useZkCredentials();
  useEffect(() => {
    if (!initialized) return;
    const verifyToken = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");

      if (!idToken) {
        setStatus("No ID token found in redirect URL.");
        return;
      }
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
        zkCredentials.privateKey!
      );
      const publicKey = ephemeralKeyPair.getPublicKey();

      try {
        //Get the ZkLogin Address
        const zkRes = await fetch("/api/google/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            publicKey,
          }),
        });
        if (!zkRes.ok) throw new Error("Failed to get zkLogin address");
        const { address, salt } = await zkRes.json();
        console.log("ZkLogin Address:", address);

        // Create and sign a transaction to transfer 1 MIST to the zkLogin address
        // Sponsor (me) will pay for gas
        const trx = new Transaction();
        const [coin] = trx.splitCoins(trx.gas, [1]);
        trx.transferObjects([coin], address);
        const bytes = await trx.build({
          client: suiClient,
          onlyTransactionKind: true,
        });

        // Get a sponsored transaction from my sponsor API
        // This signs the transaction with my private key as the gas payer/sponsor
        // I then forward the sponsored transaction to the user to sign with their ephemeral key
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
        const { bytes: sponsoredBytes, signature: sponsorSignature } =
          await sponsoredRes.json();

        // Rebuild the sponsored transaction
        const sponsoredTx = Transaction.from(sponsoredBytes);

        const signed = await sponsoredTx.sign({
          client: suiClient,
          signer: ephemeralKeyPair,
        });

        // Get user signature from my API - this endpoint verifies the ID token and zkLogin address ownership
        const userSignatureResponse = await fetch("/api/google/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            extendedEphemeralPublicKey: getExtendedEphemeralPublicKey(
              ephemeralKeyPair.getPublicKey()
            ),
            maxEpoch: zkCredentials.epoch,
            randomness: zkCredentials.randomness,
            salt,
            userSignature: signed!.signature,
          }),
        });
        if (!userSignatureResponse.ok)
          throw new Error("Failed to get user signature");

        const { signature: userSignature } = await userSignatureResponse.json();

        // Execute the transaction with both signatures
        await suiClient.executeTransactionBlock({
          transactionBlock: signed!.bytes,
          signature: [userSignature, sponsorSignature],
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        });

        setStatus("Login successful! Redirecting...");
        console.log("Verification success");
        // setTimeout(() => router.push("/dashboard"), 1000);
      } catch (err) {
        console.error(err);
        setStatus("Verification failed. Please try signing in again.");
      }
    };

    verifyToken();
  }, [
    initialized,
    router,
    zkCredentials.epoch,
    zkCredentials.privateKey,
    zkCredentials.randomness,
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <h1 className="text-xl font-semibold">{status}</h1>
        <p className="mt-2 text-sm text-gray-400">
          Please wait while we verify your credentials securely.
        </p>
      </div>
    </div>
  );
}
