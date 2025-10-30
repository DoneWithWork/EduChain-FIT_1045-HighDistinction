import IssuerSidebar from "@/ui/sidebarIssuer";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex">
      <div>
        <IssuerSidebar />
      </div>
      <div className="dark:bg-blue-900 px-3 py-3 flex-1">{children}</div>
    </div>
  );
}
