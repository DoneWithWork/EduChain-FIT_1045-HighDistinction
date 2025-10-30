import { sessionManager } from "@/lib/auth";
import IssuerAccountCom from "@/ui/AccountIssuer";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function IssuerAccount() {
  const session = sessionManager;
  const user = await session.getUser();

  if (!user || user.role !== "issuer") redirect("/auth");
  return (
    <Suspense>
      <IssuerAccountCom user={user} />
    </Suspense>
  );
}
