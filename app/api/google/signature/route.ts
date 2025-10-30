import { db } from "@/db/db";
import { users } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { verifyIdToken } from "@/lib/google";
import { suiClient } from "@/lib/sui";
import { PrivateZkLoginService } from "@/lib/zkLogin";
import { genAddressSeed, getZkLoginSignature } from "@mysten/sui/zklogin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const {
            idToken,
            extendedEphemeralPublicKey,
            maxEpoch,
            randomness,
            salt,
            userSignature,
        } = await req.json();

        if (!idToken || !extendedEphemeralPublicKey) {
            return NextResponse.json(
                { message: "No ID token provided", success: false },
                { status: 400 }
            );
        }

        // Verify the ID token
        const payload = await verifyIdToken(idToken);
        if (!payload) throw new Error("Invalid ID token");

        console.log("Payload:", payload);

        // Initialize zkLogin service
        const privateZkLoginClient = new PrivateZkLoginService(suiClient);


        // Get ZK proof
        console.log(extendedEphemeralPublicKey, maxEpoch, randomness)
        const partialZkLoginSignature = await privateZkLoginClient.getPartialLoginZkSignature({
            jwt: idToken,
            extendedEphemeralPublicKey,
            maxEpoch,
            randomness
        });

        console.log("Partial zkLogin signature obtained");

        // Generate address seed
        const addressSeed = genAddressSeed(
            BigInt(salt!),
            'sub',
            payload.sub,
            payload.aud,
        ).toString();

        // Create zkLogin signature
        const zkLoginSignature = getZkLoginSignature({
            inputs: {
                ...partialZkLoginSignature,
                addressSeed
            },
            maxEpoch: maxEpoch.toString(),
            userSignature
        });

        console.log("zkLogin signature created");

        // Proceed with login or sign up using the email provided
        const email = payload.email;
        const userName = payload.name;
        if (!email) throw new Error("No email in ID token payload");
        if (!userName) throw new Error("No name in ID token payload");
        console.log("User email:", email);

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        })
        const authClient = sessionManager;
        let onBoardingCompleted = false;
        let role;
        if (existingUser) {
            // Existing user, update the address if needed and created a session
            if (existingUser.address !== zkLoginSignature) {
                await db.update(users).set({ address: zkLoginSignature }).where(eq(users.id, existingUser.id));
            }
            if (existingUser.onBoardingCompleted == 1) {
                onBoardingCompleted = true;
            }
            role = existingUser.role;
            await authClient.createSession(existingUser!.id);
        } else {
            // New user, create an account and session  
            const newUser = await db.insert(users).values({
                email,
                address: zkLoginSignature,
                fullName: userName,
            }).returning();
            await authClient.createSession(newUser[0]!.id);
        }

        return NextResponse.json({
            message: "Successful verification",
            success: true,
            signature: zkLoginSignature,
            role,
            PartialZkLoginSignature: partialZkLoginSignature,
            addressSeed,
            onBoardingCompleted,

        });

    } catch (err) {
        console.error("Error in /api/google/verify:", err);
        return NextResponse.json(
            {
                message: err instanceof Error ? err.message : "Internal server error",
                success: false
            },
            { status: 500 }
        );
    }
}