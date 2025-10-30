import { db } from "@/db/db";
import { certificates, courses, subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import 'server-only';

const getAllCoursesIssuerUncached = async (userId: number) => {
    return db.query.courses.findMany({
        where: eq(courses.issuerId, userId),
    });
};
const getAllCertsWithCourse = async (email: string) => {
    return db.query.certificates.findMany({
        where: eq(certificates.studentEmail, email),
        with: {
            courses: {
                columns: {
                    courseName: true,
                    courseDescription: true,
                }
            },
            issuer: {
                columns: {
                    institutionName: true
                }
            }
        }
    })
}
export const getAllCertsWithCourseCached = unstable_cache(
    getAllCertsWithCourse,
    ["student-certificates-viewer"],

    {
        tags: ["student-certificates-viewer"],
    }
);
export const getAllCoursesIssuer = unstable_cache(
    getAllCoursesIssuerUncached,
    ["issuer-courses"],
    {
        tags: ["issuer-courses"],
    }
);
export const getUserAccountCached = (userId: number) => {
    return unstable_cache(
        async () => {
            return await getUserAccountData(userId);
        },
        ["user-account"],
        {
            tags: [`user-account-${userId}`],

        }
    );
}

export const getUserAccountData = cache(async (userId: number) => {
    console.log("Fetching subscription and course count for user:", userId);
    const sub = await db.query.subscription.findFirst({
        where: eq(subscription.userId, userId),
    });
    const courseCount = (
        await db.query.courses.findMany({
            where: eq(courses.issuerId, userId),
            columns: { id: true },
        })
    ).length;
    return { sub, courseCount };
});


export const getSingleCourseIssuer = cache(async (courseId: number) => {
    return db.query.courses.findFirst({
        where: eq(courses.id, courseId),

        with: {
            certificates: {
                columns: {
                    id: true,
                    revoked: true,
                    certAddress: true,
                    studentEmail: true
                }
            },

        }
    });
});

export const getSingleCourseIssuerCached = (courseId: number) => {
    return unstable_cache(
        async () => {
            return await getSingleCourseIssuer(courseId);
        },
        ["issuer-single-course"],
        {
            tags: [`issuer-single-course-${courseId}`],
        }
    );
}