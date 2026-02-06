"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, User, Shield, AlertCircle, LogIn, Loader2 } from "lucide-react";

interface MockUser {
  email: string;
  name: string;
  role: string;
}

export default function LoginPage() {
  const [mockUsers, setMockUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          router.push("/hlasovani");
        }
      });

    setMockUsers([
      { email: "student@skola.cz", name: "Jan Novák", role: "student" },
      { email: "studentka@skola.cz", name: "Marie Svobodová", role: "student" },
      { email: "student3@skola.cz", name: "Tomáš Dvořák", role: "student" },
      { email: "admin@skola.cz", name: "Administrátor", role: "admin" },
    ]);
  }, [router]);

  async function handleLogin(email: string) {
    setLoading(email);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(null);
      return;
    }

    router.push("/hlasovani");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/3" />
      </div>

      <div className="animate-scale-in relative z-10 bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">Učitel roku</h1>
          <p className="text-slate-400 mt-2 text-sm">Přihlaste se školním účtem a hlasujte</p>
        </div>

        {/* Mock users */}
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-4 mb-6">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide text-center mb-3">
            Demo přihlášení
          </p>
          <div className="space-y-2">
            {mockUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleLogin(user.email)}
                disabled={loading !== null}
                className="card-hover w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:bg-blue-50/50 transition-all disabled:opacity-50 disabled:pointer-events-none group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  user.role === "admin"
                    ? "bg-red-50 text-red-500 group-hover:bg-red-100"
                    : "bg-blue-50 text-primary group-hover:bg-blue-100"
                }`}>
                  {loading === user.email ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : user.role === "admin" ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-slate-700 text-sm">{user.name}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </div>
                {user.role === "admin" ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                ) : (
                  <LogIn className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Microsoft button placeholder */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 21 21" fill="currentColor">
            <rect x="1" y="1" width="9" height="9" />
            <rect x="11" y="1" width="9" height="9" />
            <rect x="1" y="11" width="9" height="9" />
            <rect x="11" y="11" width="9" height="9" />
          </svg>
          Microsoft login (připravuje se)
        </button>

        {error && (
          <div className="animate-fade-in mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
