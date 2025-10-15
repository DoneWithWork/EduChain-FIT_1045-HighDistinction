import { verifyIdToken } from "@/lib/google";
import { suiClient } from "@/lib/sui";
import { ZkLoginService } from "@/lib/zkLogin";
import { jwtToAddress } from "@mysten/sui/zklogin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { idToken, publicKey } = await req.json();
    if (!idToken || !publicKey) return NextResponse.json({ message: "No ID token provided", success: false }, { status: 400 });

    const payload = await verifyIdToken(idToken);
    if (!payload) throw new Error("Invalid ID token");
    console.log(payload);
    console.log("Received ID Token:", idToken);

    // Check if the user is new or existing, create the zkLogin address if new and manage sessions
    const privateZkLoginClient = new ZkLoginService(suiClient);
    const userSalt = await privateZkLoginClient.getSaltFromServer(idToken);
    if (!userSalt) throw new Error("Failed to retrieve salt from server");

    console.log("Retrieved salt from server:", userSalt);

    const zkLoginUserAddress = jwtToAddress(idToken, userSalt);
    return NextResponse.json({ message: "Token received", success: true, address: zkLoginUserAddress, salt: userSalt });
}