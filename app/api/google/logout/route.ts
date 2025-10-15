import { sessionManager } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    try {
        const sessionClient = sessionManager;
        await sessionClient.destroySession();
        return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error logging out" }, { status: 500 });
    }

}