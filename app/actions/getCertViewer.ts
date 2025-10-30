"use server"

import { db } from "@/db/db";
import { certificates } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";

export default async function GetCertViewerAction(prevState: unknown, email: string) {

    const courses = await db.query.certificates.findMany({
        where: and(eq(certificates.studentEmail, email), not(eq(certificates.certAddress, " "))),
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
    console.log(courses)
    return { success: true, data: courses };

}
