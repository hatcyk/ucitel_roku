"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
          <Link href="/hlasovani" className="text-xl font-bold text-gray-900">
            🏆 Učitel roku
          </Link>
          <div className="flex gap-4">
            <Link
              href="/hlasovani"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Hlasování
            </Link>
            <Link
              href="/vysledky"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Výsledky
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-600 transition-colors"
          >
            Odhlásit
          </button>
        </div>
      </div>
    </nav>
  );
}
