"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, Vote, BarChart3, Settings, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import type { User } from "@/lib/types";

const navLinks = [
  { href: "/hlasovani", label: "Hlasování", icon: Vote },
  { href: "/vysledky", label: "Výsledky", icon: BarChart3 },
];

export default function Navbar({ user }: { user: User }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/hlasovani" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 hidden sm:block">Učitel roku</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive("/admin")
                    ? "bg-red-50 text-red-600"
                    : "text-red-400 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User info + logout (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-slate-600 max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Odhlásit se"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive("/admin")
                    ? "bg-red-50 text-red-600"
                    : "text-red-400 hover:bg-red-50"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
            <div className="border-t border-slate-100 pt-2 mt-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Odhlásit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
