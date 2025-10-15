import { suiClient } from "@/lib/sui";
import { ZkLoginService } from "@/lib/zkLogin";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const { zkLoginAddress, transactionKindBytes } = await req.json();

        const privateZkLoginClass = new ZkLoginService(suiClient);
        const { bytes, signature } = await privateZkLoginClass.createSponsoredTransaction({
            sender: zkLoginAddress,
            transactionKindBytes
        });
        return NextResponse.json({ message: "Sponsored transaction created", success: true, bytes, signature });
    } catch (err) {
        console.error("Error in /api/google/sponsor:", err);
        return NextResponse.json(
            {
                message: err instanceof Error ? err.message : "Internal server error",
                success: false,
            },
            { status: 500 }
        );
    }
}
