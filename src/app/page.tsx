"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MockUser {
  email: string;
  name: string;
  role: string;
}

export default function LoginPage() {
  const [mockUsers, setMockUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          router.push("/hlasovani");
        }
      });

    // Load mock users
    setMockUsers([
      { email: "student@skola.cz", name: "Jan Novák", role: "student" },
      { email: "studentka@skola.cz", name: "Marie Svobodová", role: "student" },
      { email: "student3@skola.cz", name: "Tomáš Dvořák", role: "student" },
      { email: "admin@skola.cz", name: "Administrátor", role: "admin" },
    ]);
  }, [router]);

  async function handleLogin(email: string) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/hlasovani");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-900">Učitel roku</h1>
          <p className="text-gray-500 mt-2">Přihlaste se školním účtem</p>
        </div>

        {/* Mock Microsoft Login */}
        <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 mb-6 bg-amber-50">
          <p className="text-sm text-amber-700 font-medium text-center mb-3">
            Mock přihlášení (bude nahrazeno Microsoft loginem)
          </p>
          <div className="space-y-2">
            {mockUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleLogin(user.email)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                {user.role === "admin" && (
                  <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    admin
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Future: Real Microsoft login button */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          Přihlásit se pomocí Microsoft (brzy)
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
