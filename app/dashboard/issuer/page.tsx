import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { sessionManager } from "@/lib/auth";
import IssuerCoursePage from "@/ui/CoursesPageIssuer";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function IssuerPage() {
  const session = sessionManager;
  const user = await session.getUser();

  if (!user || user.role !== "issuer") redirect("/auth");

  const allCourses = await db.query.courses.findMany({
    where: eq(courses.issuerId, user.id),
  });
  return (
    <div>
      <IssuerCoursePage allCourses={allCourses} />
    </div>
  );
}
