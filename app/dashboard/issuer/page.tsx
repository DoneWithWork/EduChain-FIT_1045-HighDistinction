import LoaderCom from "@/components/LoaderCom";
import { getAllCoursesIssuer } from "@/data";
import { sessionManager } from "@/lib/auth";
import IssuerCoursePage from "@/ui/CoursesPageIssuer";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function IssuerPage() {
  const session = sessionManager;
  const user = await session.getUser();
  if (!user || user.role !== "issuer") redirect("/auth");

  const allCourses = getAllCoursesIssuer(user.id);
  return (
    <div>
      <div className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tight text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-cyan-400">
        Courses
      </div>
      <Suspense fallback={<Loader />}>
        <IssuerCoursePage courses={allCourses} />
      </Suspense>
    </div>
  );
}
function Loader() {
  return (
    <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3 justify-items-center m-0 p-0">
      {[1, 2, 3].map((item) => (
        <LoaderCom key={item} />
      ))}
    </div>
  );
}
