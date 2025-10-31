import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "./lib/auth";

export async function proxy(request: NextRequest) {
    const user = await sessionManager.getUser();
    if (!user) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (user?.role === "student") {
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
    } else if (user.role === "issuer") {
        return NextResponse.redirect(new URL('/dashboard/issuer', request.url))
    }
}

export const config = {
    matcher: '/dashboard',
}
