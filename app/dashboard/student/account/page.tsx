import { sessionManager } from "@/lib/auth";
import StudentAccountCom from "@/ui/AccountStudent";
import { redirect } from "next/navigation";

export default async function StudentAccountPage() {
  const session = sessionManager;
  const user = await session.getUser();

  if (!user || user.role !== "student") redirect("/auth");
  return <StudentAccountCom user={user} />;
}
