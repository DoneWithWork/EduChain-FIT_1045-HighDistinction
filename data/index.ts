import { db } from "@/db/db";
import { certificates, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
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