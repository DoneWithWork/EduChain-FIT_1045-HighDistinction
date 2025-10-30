import { verifyIdToken } from "@/lib/google";
import { suiClient } from "@/lib/sui";
import { PrivateZkLoginService } from "@/lib/zkLogin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { idToken, publicKey } = await req.json();
    if (!idToken || !publicKey) return NextResponse.json({ message: "No ID token provided", success: false }, { status: 400 });

    const payload = await verifyIdToken(idToken);
    if (!payload) throw new Error("Invalid ID token");
    console.log(payload);
    console.log("Received ID Token:", idToken);

    // Check if the user is new or existing, create the zkLogin address if new and manage sessions
    const privateZkLoginClient = new PrivateZkLoginService(suiClient);
    const userSalt = await privateZkLoginClient.getSaltFromServer(idToken);
    if (!userSalt) throw new Error("Failed to retrieve salt from server");

    console.log("Retrieved salt from server:", userSalt);

    return NextResponse.json({ success: true, salt: userSalt });
}