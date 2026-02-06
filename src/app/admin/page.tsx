"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2, CheckCircle, GraduationCap, Settings, Loader2, BookOpen } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="animate-fade-in mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-800">Administrace</h1>
          </div>
          <p className="text-slate-500 text-sm">Správa seznamu učitelů pro hlasování</p>
        </div>

        {/* Success message */}
        {message && (
          <div className="animate-fade-in mb-6 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2 border border-emerald-200 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {/* Add teacher form */}
        <form
          onSubmit={handleAdd}
          className="animate-slide-up bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-slate-800">Přidat učitele</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Jméno (např. Mgr. Jana Nováková)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all bg-slate-50 focus:bg-white placeholder:text-slate-300"
              />
            </div>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Předmět (např. Matematika)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all bg-slate-50 focus:bg-white placeholder:text-slate-300"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all inline-flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            Přidat učitele
          </button>
        </form>

        {/* Teacher list */}
        <div className="animate-slide-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Seznam učitelů</h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {teachers.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {teachers.map((teacher, index) => (
              <div
                key={teacher.id}
                className={`animate-fade-in stagger-${Math.min(index + 1, 8)} px-6 py-3.5 flex items-center justify-between group hover:bg-slate-50/50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary/60" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-700">
                      {teacher.name}
                    </div>
                    <div className="text-xs text-slate-400">{teacher.subject}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(teacher.id, teacher.name)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all px-3 py-1.5 rounded-lg hover:bg-red-50 inline-flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
