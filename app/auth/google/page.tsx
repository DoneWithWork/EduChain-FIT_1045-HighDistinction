"use client";

import { useZkCredentials } from "@/hooks/useEphemeralSession";
import { suiClient } from "@/lib/sui";
import { PublicZkLoginService } from "@/lib/zkLogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleAuthPage() {
  const [status, setStatus] = useState("Verifying your account...");
  const router = useRouter();
  const { zkCredentials, initialized, setZkCredentials } = useZkCredentials();

  useEffect(() => {
    if (!initialized) return;
    async function verifyIdToken(idToken: string) {
      const response = await fetch("/api/google/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify ID token");
      }

      const data = await response.json();
      return data.payload;
    }

    const verifyToken = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");

        if (!idToken) {
          setStatus("No ID token found in redirect URL.");
          return;
        }

        if (!zkCredentials.privateKey) {
          setStatus("Missing ephemeral keypair. Please restart login.");
          return;
        }
        const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
          zkCredentials.privateKey
        );

        const publicZkClient = new PublicZkLoginService(suiClient);
        const publicKey = ephemeralKeyPair.getPublicKey();
        const extendedEphemeralPublicKey =
          getExtendedEphemeralPublicKey(publicKey);

        setStatus("Requesting zkLogin salt from server...");
        const salt = await publicZkClient.getZkLoginSalt(idToken, publicKey);

        setStatus("Generating ZkLogin Address");
        const zkLoginUserAddress = jwtToAddress(idToken, salt);

        // Creation status
        const creationResponse = await fetch("/api/google/creation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken,
            extendedEphemeralPublicKey,
            zkLoginAddress: zkLoginUserAddress,
            maxEpoch: zkCredentials.epoch,
            randomness: zkCredentials.randomness,
          }),
        });

        const creationData = await creationResponse.json();
        if (!creationData.success) {
          throw new Error(creationData.message || "Account creation failed");
        }
        const payload = await verifyIdToken(idToken);
        if (!payload) {
          throw new Error("Invalid ID token payload");
        }

        setStatus("Verification successful! Updating session...");
        setZkCredentials((prev) => ({
          ...prev,
          address: zkLoginUserAddress,
          salt: salt,
          aud: payload?.aud,
          sub: payload?.sub,
          partialZkLoginSignature: creationData.partialZkLoginSignature,
        }));
        setStatus("Verification successful! Redirecting...");
        setTimeout(() => {
          if (creationData.onBoardingCompleted) {
            router.push(
              creationData.role === "student"
                ? "/dashboard/student"
                : "/dashboard/issuer"
            );
          } else {
            router.push("/onboarding");
          }
        }, 1000);
      } catch (err) {
        console.error("Verification failed:", err);
        setStatus("Verification failed. Please try signing in again.");
      }
    };

    verifyToken();
  }, [
    initialized,
    router,
    setZkCredentials,
    zkCredentials.privateKey,
    zkCredentials.epoch,
    zkCredentials.randomness,
  ]);

  return (
    <div className="w-full flex flex-col items-center justify-center  h-full">
      <div className="mb-6 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
      <h1 className="text-xl font-semibold">{status}</h1>
      <p className="mt-2 text-sm text-gray-400">
        Please wait while we verify your credentials securely.
      </p>
    </div>
  );
}
