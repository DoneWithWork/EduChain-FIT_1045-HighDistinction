import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json(
                { error: "ID token is required" },
                { status: 400 }
            );
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return NextResponse.json(
                { error: "Invalid token payload" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            payload: {
                aud: payload.aud,
                sub: payload.sub,
                email: payload.email,
                name: payload.name,
                // Add other fields you need
            }
        });
    } catch (error) {
        console.error("Token verification error:", error);
        return NextResponse.json(
            { error: "Failed to verify token" },
            { status: 401 }
        );
    }
}