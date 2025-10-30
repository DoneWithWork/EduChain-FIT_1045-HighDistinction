"use client";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <Link href={"/"} className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur p-2 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L20 7v10l-8 5-8-5V7l8-5z"
              stroke="#9be7ff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2" stroke="#dff9ff" strokeWidth="1.2" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight">EduChain</h3>
          <p className="text-xs text-slate-300">
            Decentralised Certificate Verification
          </p>
        </div>
      </Link>

      <nav className="hidden md:flex gap-6 items-center text-sm text-slate-200">
        <Link className="hover:underline" href="/pricing">
          Pricing
        </Link>
        <Link className="hover:underline" href="/cert-viewer">
          Cert Viewer
        </Link>

        <Button
          onClick={() => (window.location.href = "/auth")}
          className="ml-2 rounded-md cursor-pointer bg-white/6 px-4 py-2 text-slate-100 text-sm backdrop-blur hover:bg-white/10"
        >
          Get Started
        </Button>
      </nav>
    </div>
  );
}
