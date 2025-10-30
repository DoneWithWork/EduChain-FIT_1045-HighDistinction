"use server"

import { db } from "@/db/db";
import { certificates } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import z from "zod";

const mintCertSchema = z.object({
    digest: z.string(),
    certId: z.number(),
})
export async function MintCertAction(prevState: unknown, data: z.infer<typeof mintCertSchema>) {
    try {
        const parsed = mintCertSchema.safeParse(data);
        if (!parsed.success) {
            console.error("Invalid data for MintCertAction:", parsed.error);
            return { success: false, error: "Invalid data" };
        }
        const sessionClient = sessionManager;
        const user = await sessionClient.getUser();

        if (!user) throw new Error("Not authenticated");
        const { digest, certId } = parsed.data;
        const certificate = await db.query.certificates.findFirst({
            where: and(eq(certificates.id, certId), eq(certificates.studentId, user.id!))
        })
        if (!certificate) throw new Error("Certificate not found or not authorized");

        await db.update(certificates).set({
            certAddress: digest,
        }).where(eq(certificates.id, certId));


        return { success: true };
    } catch (err) {
        console.error("Error in MintCertAction:", err);
        return { success: false, error: "Internal server error" };
    }
}