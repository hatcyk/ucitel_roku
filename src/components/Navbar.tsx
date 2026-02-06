"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Vote, BarChart3, Settings, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "@/lib/types";

export default function Navbar({ user }: { user: User }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/hlasovani" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Učitel roku
          </Link>
          <div className="flex gap-4">
            <Link
              href="/hlasovani"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Vote className="w-4 h-4" />
              Hlasování
            </Link>
            <Link
              href="/vysledky"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Výsledky
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <UserIcon className="w-4 h-4" />
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit
          </button>
        </div>
      </div>
    </nav>
  );
}
