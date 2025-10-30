"use server"

import { db } from "@/db/db";
import { courses, users } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { verifyDnsRecord } from "@/lib/extra";
import { onboardingSchema } from "@/lib/validation";
import { eq, sql } from "drizzle-orm";
import z from "zod";
import { certificates } from "@/db/schema";
export async function CompleteOnboardingAction(prevState: unknown, data: z.infer<typeof onboardingSchema>) {

    try {
        const parsed = onboardingSchema.safeParse(data);
        if (!parsed.success) {
            console.error(parsed.error);
            return { success: false, error: parsed.error.flatten };
        }
        console.log(parsed);
        console.log(data);

        const { fullName, isIssuer, institutionName, domain } = parsed.data;

        const authClient = sessionManager;
        const currentUser = await authClient.getUser();

        if (!currentUser) throw new Error("Not authenticated");
        if (currentUser.onBoardingCompleted) {
            console.log("Onboarding already completed for user:", currentUser.id);
            return { success: false, error: "Onboarding already completed.", role: "issuer" };
        }
        if (isIssuer) {
            const isVerified = await verifyDnsRecord(domain!, "educhain");
            if (!isVerified) {
                return { success: false, error: "Domain verification failed.", role: "issuer" };
            }
        } else {
            // Search all courses for student email

            // The SQL query to find courses where the student's email is in the studentEmails text string
            const studentCourses = await db.select().from(courses).where(
                sql`',' || ${courses.studentEmails} || ',' LIKE '%,' || ${currentUser.email} || ',%'`
            )
            const newCerts: (typeof certificates.$inferInsert)[] = studentCourses.map((assignedCourse) => {
                return {
                    courseId: assignedCourse.id,
                    issuerId: assignedCourse.issuerId,
                    studentId: currentUser.id!,
                    studentEmail: currentUser.email,
                    certAddress: "",
                };
            });
            if (newCerts.length > 0) {
                await db.insert(certificates).values(newCerts);
            }
        }

        await db.update(users).set({
            fullName,
            role: isIssuer ? "issuer" : "student",
            institutionName: isIssuer ? institutionName! : null,
            onBoardingCompleted: 1,
        }).where(eq(users.id, currentUser.id!));

        return { success: true, role: isIssuer ? "issuer" : "student" };

    } catch (error) {
        console.error("Error completing onboarding:", error);
        return { success: false, error: "Failed to complete onboarding." };
    }

}