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
      <div className="dark:bg-blue-900  flex-1 max-h-screen  p-5">
        {children}
      </div>
    </div>
  );
}
