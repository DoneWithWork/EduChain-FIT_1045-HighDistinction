"use client";
import { suiClient } from "@/lib/sui";
import { PublicZkLoginService } from "@/lib/zkLogin";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface EphemeralSession {
    epoch: string | null;
    randomness: string | null;
    privateKey: string | null;
    nonce: string | null;

}

const STORAGE_KEY = "ephemeral_session";

export function useZkCredentials() {
    const router = useRouter();
    const cookies = useCookies();
    const [initialized, setInitialized] = useState(false);

    const [zkCredentials, setZkCredentials] = useState<EphemeralSession>({
        epoch: null,
        randomness: null,
        privateKey: null,
        nonce: null,
    });
    const generateNewZkCredentials = useCallback(async () => {
        const { nonce, ephemeralKeyPair, maxEpoch, randomness } = await new PublicZkLoginService(suiClient).createNewClientInfo();
        const newCredentials: EphemeralSession = {
            epoch: maxEpoch.toString(),
            randomness,
            privateKey: ephemeralKeyPair,
            nonce,
        }

        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newCredentials));
        setZkCredentials(newCredentials);
        return newCredentials;
    }, []);
    useEffect(() => {
        const setup = async () => {
            if (typeof window === "undefined") return;

            const item = sessionStorage.getItem(STORAGE_KEY);

            if (!item) {
                await generateNewZkCredentials();
                setInitialized(true);
                return;
            }

            try {
                const parsed: EphemeralSession = JSON.parse(item);
                setZkCredentials(parsed);
                console.log("Successfully loaded ephemeral session from storage.");
            } catch (e) {
                console.error("Failed to parse session:", e);
                sessionStorage.removeItem(STORAGE_KEY);
                await generateNewZkCredentials();
            } finally {
                setInitialized(true);
            }
        }
        setup();
    }, [cookies, zkCredentials.epoch, zkCredentials.privateKey, zkCredentials.randomness, router, generateNewZkCredentials]);
    useEffect(() => {
        if (zkCredentials?.epoch) {
            console.log("Updated zkCredentials:", zkCredentials);
        }
    }, [zkCredentials]);



    const clearZkCredentials = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setZkCredentials({
            epoch: null,
            randomness: null,
            privateKey: null,
            nonce: null,
        });
    }, []);

    return {
        zkCredentials,
        generateNewZkCredentials,
        clearZkCredentials,
        initialized
    };
}
