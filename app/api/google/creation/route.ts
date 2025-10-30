import { db } from "@/db/db";
import { users } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { verifyIdToken } from "@/lib/google";
import { suiClient } from "@/lib/sui";
import { PrivateZkLoginService } from "@/lib/zkLogin";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const {
        idToken,
        extendedEphemeralPublicKey,
        zkLoginAddress,
        maxEpoch,
        randomness
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
        if (existingUser.address !== zkLoginAddress) {
            await db.update(users).set({ address: zkLoginAddress }).where(eq(users.id, existingUser.id));
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
            address: zkLoginAddress,
            fullName: userName,
        }).returning();
        await authClient.createSession(newUser[0]!.id);
    }
    const privateClient = new PrivateZkLoginService(suiClient);
    const partialZkLoginSignature = await privateClient.getPartialLoginZkSignature(
        {
            jwt: idToken,
            extendedEphemeralPublicKey: extendedEphemeralPublicKey,
            maxEpoch,
            randomness
        }
    );
    return NextResponse.json({
        message: "Successful verification",
        success: true,
        role,
        onBoardingCompleted,
        partialZkLoginSignature
    });
}