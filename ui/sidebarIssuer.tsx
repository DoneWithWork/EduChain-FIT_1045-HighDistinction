"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LogoutBtn from "./LogoutBtn";

const links = [
  { name: "Courses", href: "/dashboard/issuer" },
  { name: "Account", href: "/dashboard/issuer/account" },
  { name: "CertViewer", href: "/dashboard/issuer/cert-viewer" },
];

export default function IssuerSidebar() {
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
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <h3 className="text-xl font-semibold text-[#e6edf3]">EduChain</h3>
        <span className="bg-purple-600 text-white font-semibold px-3 py-1 rounded-md text-xs uppercase">
          Issuer
        </span>
      </div>

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
          <li>
            <Button
              className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-all"
              onClick={() =>
                (window.location.href = "/dashboard/issuer/courses/new")
              }
            >
              Create Course +
            </Button>
          </li>
        </ul>
      </nav>

      <LogoutBtn />
    </aside>
  );
}
