import Sidebar from "@/ui/sidebar";
import React, { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <div>
        <Sidebar />
      </div>
      <div className="dark:bg-blue-900 px-3 py-3 flex-1">{children}</div>
    </div>
  );
}
