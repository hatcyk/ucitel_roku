"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import type { User, Teacher } from "@/lib/types";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/");
        return;
      }
      if (meData.user.role !== "admin") {
        router.push("/hlasovani");
        return;
      }
      setUser(meData.user);
      await loadTeachers();
    }
    load();
  }, [router]);

  async function loadTeachers() {
    const res = await fetch("/api/teachers");
    const data = await res.json();
    setTeachers(data.teachers || []);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newSubject.trim()) return;

    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), subject: newSubject.trim() }),
    });

    if (res.ok) {
      setNewName("");
      setNewSubject("");
      setMessage("Učitel přidán");
      await loadTeachers();
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Opravdu chcete smazat učitele "${name}"? Smažou se i všechny jeho hlasy.`)) {
      return;
    }

    const res = await fetch("/api/admin/teachers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setMessage("Učitel odstraněn");
      await loadTeachers();
      setTimeout(() => setMessage(""), 3000);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Administrace
        </h1>
        <p className="text-gray-500 mb-8">Správa seznamu učitelů</p>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Add teacher form */}
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Přidat učitele</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Jméno (např. Mgr. Jana Nováková)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Předmět (např. Matematika)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Přidat
          </button>
        </form>

        {/* Teacher list */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Seznam učitelů ({teachers.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {teacher.name}
                  </div>
                  <div className="text-sm text-gray-500">{teacher.subject}</div>
                </div>
                <button
                  onClick={() => handleDelete(teacher.id, teacher.name)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                >
                  Smazat
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
