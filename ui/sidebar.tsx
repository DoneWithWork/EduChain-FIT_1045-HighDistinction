"use client";

import { cn } from "@/lib/utils"; // assuming you already have this helper
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LogoutBtn from "./LogoutBtn";

const links = [
  { name: "Courses", href: "/dashboard/student" },
  { name: "Account", href: "/dashboard/student/account" },
  { name: "CertViewer", href: "/dashboard/student/cert-viewer" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const handleClick = (href: string) => {
    setPendingPath(href);
    router.push(href);
  };

  const activePath = pendingPath || pathname;

  return (
    <aside className="h-screen w-64 bg-[#0d1117] flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <h3 className="text-xl font-semibold text-[#e6edf3]">EduChain</h3>
        <span className="bg-green-600 text-white font-semibold px-3 py-1 rounded-md text-xs uppercase">
          Student
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-4">
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleClick(link.href)}
                className={cn(
                  "w-full text-left block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors",
                  activePath === link.href && "bg-gray-800 text-white"
                )}
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <LogoutBtn />
    </aside>
  );
}
