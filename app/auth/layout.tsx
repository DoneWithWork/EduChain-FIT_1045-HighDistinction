import Header from "@/components/Header";
import React, { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#07163a] via-[#07224a] to-[#042b57] text-slate-100 antialiased">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20  h-screen">
        <Header />
        {children}
      </div>
    </div>
  );
}
