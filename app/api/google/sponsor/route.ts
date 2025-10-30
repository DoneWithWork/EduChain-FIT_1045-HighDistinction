import { suiClient } from "@/lib/sui";
import { PrivateZkLoginService } from "@/lib/zkLogin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { zkLoginAddress, transactionKindBytes } = await req.json();

        console.log('Received sponsorship request:', {
            zkLoginAddress,
            transactionKindBytesLength: transactionKindBytes?.length
        });

        if (!zkLoginAddress || !transactionKindBytes) {
            return NextResponse.json(
                {
                    message: "Missing required fields",
                    success: false,
                },
                { status: 400 }
            );
        }

        const privateZkLoginClass = new PrivateZkLoginService(suiClient);

        const { sponsoredBytes, sponsorSignature } = await privateZkLoginClass.returnSponsoredTransaction(
            zkLoginAddress,
            transactionKindBytes
        );

        console.log('Transaction sponsored successfully:',);

        return NextResponse.json({
            message: "Sponsored transaction created",
            success: true,
            sponsoredBytes,
            sponsorSignature,
        });
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


