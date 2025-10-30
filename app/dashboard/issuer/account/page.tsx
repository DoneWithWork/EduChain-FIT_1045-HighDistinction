import { getUserAccountCached } from "@/data";
import { sessionManager } from "@/lib/auth";
import IssuerAccountCom from "@/ui/AccountIssuer";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function IssuerAccount() {
  const session = sessionManager;
  const user = await session.getUser();

  if (!user) redirect("/auth");
  if (user.role !== "issuer") redirect("/auth");

  const { sub, courseCount } = await getUserAccountCached(user.id)();
  if (!sub) redirect("/auth");
  return (
    <Suspense>
      <IssuerAccountCom user={user} sub={sub} courseCount={courseCount} />
    </Suspense>
  );
}
