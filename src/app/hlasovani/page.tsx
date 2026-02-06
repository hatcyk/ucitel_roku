"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckBig, BarChart3, Send, Loader2, GraduationCap } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hlasování</h1>
        <p className="text-gray-500 mb-8">
          Vyberte učitele, který si podle vás zaslouží titul Učitel roku.
          Každý student může hlasovat pouze jednou.
        </p>

        {existingVote ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <CircleCheckBig className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-green-800">
              Váš hlas byl zaznamenán
            </h2>
            <p className="text-green-600 mt-1">
              Hlasoval/a jste pro: <strong>{existingVote.teacher_name}</strong>
            </p>
            <button
              onClick={() => router.push("/vysledky")}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Zobrazit výsledky
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTeacher === teacher.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedTeacher === teacher.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {teacher.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {teacher.subject}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleVote}
                disabled={!selectedTeacher || submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.includes("úspěšně")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
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
