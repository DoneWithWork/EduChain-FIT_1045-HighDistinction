import { db } from "@/db/db";
import { sessions, users } from "@/db/schema";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
class Auth {

    private readonly SESSION_COOKIE_NAME = "educhain_session_cookie";

    // 7 days for session expiry    
    private readonly SESSION_TTL = 1000 * 60 * 60 * 24 * 7;


    constructor() {
        console.log("Auth class init")
    }

    async createSession(userId: number): Promise<string> {
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + this.SESSION_TTL);

        await db.insert(sessions).values({
            id: randomBytes(16).toString('hex'),
            token,
            userId,
            expiresAt: expiresAt
        });

        (await cookies()).set(this.SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            path: "/",
            expires: expiresAt
        })
        return token;
    }

    async getUser(): Promise<typeof users.$inferSelect | null> {
        console.log("hi")
        const token = (await cookies()).get(this.SESSION_COOKIE_NAME)?.value;
        if (!token) return null;

        const session = await db.query.sessions.findFirst({
            where: eq(sessions.token, token),
            with: { user: true }
        })
        console.log(session);
        if (!session || new Date(session.expiresAt) < new Date()) {


            return null;
        }

        console.log("Getting user from session:", session);
        return session.user;
    };

    async destroySession(token?: string): Promise<void> {
        const cookieToken = (await cookies()).get(this.SESSION_COOKIE_NAME)?.value;
        const sessionToken = token || cookieToken;
        if (!sessionToken) return;

        (await cookies()).delete(this.SESSION_COOKIE_NAME);
        await db.delete(sessions).where(eq(sessions.token, sessionToken));

    }



}

export const sessionManager = new Auth();