"use server"

import { db } from "@/db/db";
import { certificates, courses, subscription, users } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { pinata } from "@/lib/pinata";
import { plans } from "@/lib/stripe";
import { courseSchema } from "@/lib/validation";
import { count, eq, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import * as z from "zod";
export async function NewCourseAction(prevState: unknown, data: z.infer<typeof courseSchema>) {

    try {
        const sessionClient = sessionManager;
        const user = await sessionClient.getUser();
        if (!user) throw new Error("Not authenticated");

        if (user.role !== "issuer") throw new Error("Not authorized");
        const sub = await db.query.subscription.findFirst({
            where: eq(subscription?.userId, user.id)
        })
        if (!sub) {
            throw new Error("No active subscription");
        }
        const userCoursesCount = await db.select({ count: count() }).from(courses).where(eq(courses.issuerId, user.id));
        const courseCount = userCoursesCount[0].count;
        const plan = plans.find(p => p.plan === sub.plan);
        if (!plan) throw new Error("Invalid plan");
        if (plan?.maxCourses <= courseCount) {
            throw new Error("Course limit reached for your plan. Please upgrade your plan to create more courses.");
        }

        const parsed = courseSchema.safeParse(data);
        if (!parsed.success) {
            console.error(parsed.error);
            return { success: false, error: parsed.error.flatten };
        }
        const { courseName, courseDescription, studentEmails } = parsed.data;
        if (studentEmails.length > plan.maxCertsPerCourse) {
            throw new Error(`You can issue up to ${plan.maxCertsPerCourse} certificates per course on your current plan. Please upgrade your plan to issue more certificates.`);
        }


        const certImage = parsed.data.courseImageUrl;

        const { cid } = await pinata.upload.public.file(certImage);
        const url = await pinata.gateways.public.convert(cid);

        console.log("File uploaded to IPFS:", url);

        const newCourse = await db.insert(courses).values({
            courseName,
            courseDescription,
            studentEmails: studentEmails.join(","),
            courseImageUrl: url,
            issuerId: user.id!,
        })

        const emailList = studentEmails;
        const existingStudents = await db.select().from(users).where(
            inArray(users.email, emailList)
        );
        const newCerts: (typeof certificates.$inferInsert)[] = existingStudents.map((student) => {
            return {
                courseId: Number(newCourse.lastInsertRowid),
                issuerId: user.id!,
                studentId: student.id!,
                studentEmail: student.email,

            };
        });

        if (newCerts.length > 0) {
            await db.insert(certificates).values(newCerts);
        }

        console.log("New course created:", newCourse);
        updateTag("issuer-courses");
        return { success: true };
    } catch (err) {
        console.error(err);
        console.log("Error creating course");
        return { success: false };
    }
}