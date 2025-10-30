import { db } from "@/db/db";
import { certificates } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import StudentCoursePage from "@/ui/CoursesPageStudent";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function StudentPage() {
  const session = sessionManager;
  const user = await session.getUser();

  if (!user || user.role !== "student") redirect("/auth");

  const allCertsWithCourses = await db.query.certificates.findMany({
    where: eq(certificates.studentId, user.id),
    with: {
      courses: true,
    },
  });
  console.log(allCertsWithCourses);
  return <StudentCoursePage allCerts={allCertsWithCourses} />;
}
