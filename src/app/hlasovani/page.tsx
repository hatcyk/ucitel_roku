"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckBig, BarChart3, Send, Loader2, GraduationCap, Check, Vote } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { User, Teacher } from "@/lib/types";

export default function VotingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [existingVote, setExistingVote] = useState<{
    teacher_id: number;
    teacher_name: string;
  } | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
      setUser(meData.user);

      const [teachersRes, voteRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/vote"),
      ]);
      const teachersData = await teachersRes.json();
      const voteData = await voteRes.json();

      setTeachers(teachersData.teachers || []);
      setExistingVote(voteData.vote || null);
    }
    load();
  }, [router]);

  async function handleVote() {
    if (!selectedTeacher) return;
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: selectedTeacher }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    const teacher = teachers.find((t) => t.id === selectedTeacher);
    setExistingVote({
      teacher_id: selectedTeacher,
      teacher_name: teacher?.name || "",
    });
    setMessage("Váš hlas byl úspěšně zaznamenán!");
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
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="animate-fade-in mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Vote className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-slate-800">Hlasování</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Vyberte učitele, který si podle vás zaslouží titul Učitel roku. Každý student může hlasovat pouze jednou.
          </p>
        </div>

        {existingVote ? (
          <div className="animate-scale-in max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-4">
                <CircleCheckBig className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-emerald-800 mb-1">
                Hlas zaznamenán
              </h2>
              <p className="text-emerald-600">
                Hlasoval/a jste pro: <strong>{existingVote.teacher_name}</strong>
              </p>
              <button
                onClick={() => router.push("/vysledky")}
                className="mt-6 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 font-medium text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Zobrazit výsledky
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
              {teachers.map((teacher, index) => {
                const isSelected = selectedTeacher === teacher.id;
                return (
                  <button
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher.id)}
                    className={`animate-fade-in stagger-${Math.min(index + 1, 8)} card-hover relative p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                        : "border-slate-200 bg-white hover:border-primary/30"
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-md shadow-primary/25"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-sm truncate ${isSelected ? "text-primary" : "text-slate-800"}`}>
                          {teacher.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {teacher.subject}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit area */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleVote}
                disabled={!selectedTeacher || submitting}
                className="px-8 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-semibold hover:from-primary-dark hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:shadow-none inline-flex items-center gap-2 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Odesílání...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Odevzdat hlas
                  </>
                )}
              </button>

              {!selectedTeacher && (
                <p className="text-xs text-slate-400">Nejdřív vyberte učitele</p>
              )}

              {message && (
                <div
                  className={`animate-fade-in p-3 rounded-xl text-sm font-medium ${
                    message.includes("úspěšně")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
