// components/Sidebar.tsx
"use client";

import Link from "next/link";

export default function IssuerSidebar() {
  return (
    <aside className="h-screen w-64 bg-[#0d1117] flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <h3 className="text-xl font-semibold text-[#e6edf3]">EduChain</h3>
        <span className="bg-purple-600 text-white font-semibold px-3 py-1 rounded-md text-xs uppercase">
          Issuer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-4">
        <ul className="space-y-3">
          <li>
            <Link
              href="/dashboard/issuer"
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
            >
              Courses
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
            >
              Account
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout Button */}
      <form
        action="/api/google/logout"
        method="POST"
        className="p-4 border-t border-gray-800"
      >
        <button
          type="submit"
          className="w-full text-left cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition-colors"
        >
          Logout
        </button>
      </form>
    </aside>
  );
}
