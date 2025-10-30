import * as z from "zod";

export const courseSchema = z.object({
    courseName: z.string().min(1, { error: "Course name is required" }).max(100, { error: "Course name is too long" }),

    courseDescription: z.string().min(1, { error: "Course description is required" }).max(500, { error: "Course description is too long" }),

    courseImageUrl: z.file(),

    studentEmails: z.array(z.email()).min(1, { error: "At least one student email is required" }),
})


export const onboardingSchema = z
    .object({
        fullName: z.string().min(1, { message: "Full name is required" }),
        isIssuer: z.boolean(),
        institutionName: z.string().optional(),
        domain: z.string().optional(),
        verified: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.isIssuer) {
            if (!data.institutionName?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["institutionName"],
                    message: "Institution name is required for issuers.",
                });
            }

            if (!data.domain?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["domain"],
                    message: "Domain is required for issuers.",
                });
            }

            if (!data.verified) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["verified"],
                    message: "Domain must be verified before submitting.",
                });
            }
        }
    });