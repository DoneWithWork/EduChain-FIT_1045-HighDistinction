import { sessionManager } from "@/lib/auth";

export async function GET() {

    const authClient = sessionManager;
    const user = await authClient.getUser();
    if (!user) {
        return new Response(JSON.stringify({ loggedIn: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ loggedIn: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}