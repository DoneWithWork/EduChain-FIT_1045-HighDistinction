"use server"
import { db } from "@/db/db";
import { certificates } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function RevokeCert(prevState: unknown, certId: number) {
    try {
        const user = await sessionManager.getUser();
        if (!user) redirect("/auth");

        const cert = await db.query.certificates.findFirst({
            where: and(
                eq(certificates.id, certId),
                eq(certificates.issuerId, user.id),
            ),
        });
        if (!cert) {
            throw new Error("Certificate not found or you do not have permission to revoke it.");
        }
        if (cert.revoked == 1) {
            throw new Error("Certificate is already revoked.");
        }

        await db.update(certificates).set({ revoked: 1 }).where(
            and(eq(certificates.id, certId), eq(certificates.issuerId, user.id)),
        )
        return { success: true };
    } catch (error) {
        console.error("Error revoking certificate:", error);
        return { success: false, error: "Failed to revoke certificate." };
    }
}