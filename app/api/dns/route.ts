import { verifyDnsRecord } from "@/lib/extra";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const domain = await req.json();
    console.log("Verifying domain:", domain);
    try {
        const verified = await verifyDnsRecord(domain, "123");
        if (!verified) {
            return NextResponse.json({ verified: false });
        }
        return NextResponse.json({ verified: true });

    } catch {
        return NextResponse.json({ verified: false });
    }

}