import * as z from "zod";

export const courseSchema = z.object({
    courseName: z.string().min(1, { error: "Course name is required" }).max(100, { error: "Course name is too long" }),

    courseDescription: z.string().min(1, { error: "Course description is required" }).max(500, { error: "Course description is too long" }),

    courseImageUrl: z.file(),

    studentEmails: z.array(z.email()).min(1, { error: "At least one student email is required" }),
})


