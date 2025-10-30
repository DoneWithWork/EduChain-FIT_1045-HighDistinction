import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET
});

export async function verifyIdToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
}
