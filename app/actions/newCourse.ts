"use server"

import { db } from "@/db/db";
import { certificates, courses, users } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import { pinata } from "@/lib/pinata";
import { courseSchema } from "@/lib/validation";
import { inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import * as z from "zod";
export async function NewCourseAction(prevState: unknown, data: z.infer<typeof courseSchema>) {

    try {
        const sessionClient = sessionManager;
        const user = await sessionClient.getUser();
        if (!user) throw new Error("Not authenticated");

        if (user.role !== "issuer") throw new Error("Not authorized");
        const parsed = courseSchema.safeParse(data);
        if (!parsed.success) {
            console.error(parsed.error);
            return { success: false, error: parsed.error.flatten };
        }
        console.log(parsed);
        console.log(data);

        const certImage = parsed.data.courseImageUrl;

        const { cid } = await pinata.upload.public.file(certImage);
        const url = await pinata.gateways.public.convert(cid);

        console.log("File uploaded to IPFS:", url);

        const { courseName, courseDescription, studentEmails } = parsed.data;
        const newCourse = await db.insert(courses).values({
            courseName,
            courseDescription,
            studentEmails: studentEmails.join(","),
            courseImageUrl: url,
            issuerId: user.id!,
        })

        // Check if any existing users match the student emails and create certificates for them in advance
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