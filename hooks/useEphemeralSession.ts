"use client";

import { suiClient } from "@/lib/sui";
import { PartialZkLoginSignature, PublicZkLoginService } from "@/lib/zkLogin";
import { useCallback, useEffect, useState } from "react";

interface EphemeralSession {
    version: number; // 🔹 new: schema versioning
    epoch: string | null;
    randomness: string | null; // Base64-encoded
    privateKey: string | null;
    nonce: string | null;
    partialZkLoginSignature: PartialZkLoginSignature | null;
    addressSeed: string | null;
    address: string | null;
    salt: string | null;
    sub: string | null;
    aud: string | null;
}

const STORAGE_KEY = "ephemeral_session";
const CURRENT_VERSION = 1; // 🔹 increment this if you ever change data shape

export function useZkCredentials() {
    const [initialized, setInitialized] = useState(false);
    const [zkCredentials, setZkCredentials] = useState<EphemeralSession>({
        version: CURRENT_VERSION,
        epoch: null,
        randomness: null,
        privateKey: null,
        nonce: null,
        partialZkLoginSignature: null,
        addressSeed: null,
        address: null,
        salt: null,
        sub: null,
        aud: null,
    });

    // 🔹 Generate a fresh ephemeral zkLogin session
    const generateNewZkCredentials = useCallback(async () => {
        const zkService = new PublicZkLoginService(suiClient);
        const { nonce, ephemeralKeyPair, maxEpoch, randomness } =
            await zkService.createNewClientInfo();

        const newCredentials: EphemeralSession = {
            version: CURRENT_VERSION,
            epoch: maxEpoch.toString(),
            randomness,
            privateKey: ephemeralKeyPair,
            nonce,
            partialZkLoginSignature: null,
            addressSeed: null,
            address: null,
            salt: null,
            sub: null,
            aud: null,
        };

        setZkCredentials(newCredentials);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newCredentials));
        return newCredentials;
    }, []);

    // 🔹 Validate the structure and version of the stored data
    const validateSession = (data: EphemeralSession): data is EphemeralSession => {
        if (!data || typeof data !== "object") return false;
        if (data.version !== CURRENT_VERSION) return false;
        if (typeof data.epoch !== "string" && data.epoch !== null) return false;
        if (typeof data.randomness !== "string" && data.randomness !== null) return false;
        if (typeof data.privateKey !== "string" && data.privateKey !== null) return false;
        if (typeof data.nonce !== "string" && data.nonce !== null) return false;
        return true;
    };

    // 🔹 Load credentials from storage or generate new ones
    useEffect(() => {
        if (typeof window === "undefined") return;

        const setup = async () => {
            try {
                const item = sessionStorage.getItem(STORAGE_KEY);
                if (item) {
                    const parsed = JSON.parse(item);
                    if (validateSession(parsed)) {
                        setZkCredentials(parsed);
                        console.log("✅ Loaded valid ephemeral session from storage.");
                    } else {
                        console.warn("⚠️ Invalid or outdated session detected. Regenerating...");
                        await generateNewZkCredentials();
                    }
                } else {
                    console.log("ℹ️ No existing session found. Creating new one...");
                    await generateNewZkCredentials();
                }
            } catch (e) {
                console.error("❌ Failed to load session, regenerating:", e);
                await generateNewZkCredentials();
            } finally {
                setInitialized(true);
            }
        };

        setup();
    }, [generateNewZkCredentials]);

    // 🔹 Auto-save updated credentials to sessionStorage
    useEffect(() => {
        if (!initialized) return;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(zkCredentials));
    }, [zkCredentials, initialized]);

    // 🔹 Clear credentials (logout or reset)
    const clearZkCredentials = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setZkCredentials({
            version: CURRENT_VERSION,
            epoch: null,
            randomness: null,
            privateKey: null,
            nonce: null,
            partialZkLoginSignature: null,
            addressSeed: null,
            address: null,
            salt: null,
            sub: null,
            aud: null,
        });
    }, []);

    return {
        zkCredentials,
        generateNewZkCredentials,
        clearZkCredentials,
        setZkCredentials,
        initialized,
    };
}
