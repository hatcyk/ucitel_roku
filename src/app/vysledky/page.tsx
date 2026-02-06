"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Inbox, BarChart3, Medal, Loader2, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { User, TeacherWithVotes } from "@/lib/types";

export default function ResultsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<TeacherWithVotes[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
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

      const resultsRes = await fetch("/api/results");
      const resultsData = await resultsRes.json();
      setResults(resultsData.results || []);
      setTotalVotes(resultsData.totalVotes || 0);
    }
    load();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const maxVotes = results.length > 0 ? results[0].vote_count : 0;

  function getMedalColor(index: number, hasVotes: boolean) {
    if (!hasVotes) return null;
    if (index === 0) return { bg: "from-amber-400 to-yellow-500", text: "text-amber-700", light: "bg-amber-50", border: "border-amber-200" };
    if (index === 1) return { bg: "from-slate-300 to-slate-400", text: "text-slate-600", light: "bg-slate-50", border: "border-slate-200" };
    if (index === 2) return { bg: "from-orange-400 to-amber-600", text: "text-orange-700", light: "bg-orange-50", border: "border-orange-200" };
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="animate-fade-in flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-slate-800">Výsledky</h1>
            </div>
            <p className="text-slate-500 text-sm">Průběžné výsledky hlasování</p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <div className="text-2xl font-bold text-slate-800 leading-none">{totalVotes}</div>
              <div className="text-[11px] text-slate-400 font-medium">hlasů celkem</div>
            </div>
          </div>
        </div>

        {/* Results list */}
        <div className="space-y-2">
          {results.map((teacher, index) => {
            const percentage = totalVotes > 0 ? Math.round((teacher.vote_count / totalVotes) * 100) : 0;
            const barWidth = maxVotes > 0 ? (teacher.vote_count / maxVotes) * 100 : 0;
            const medal = getMedalColor(index, teacher.vote_count > 0);

            return (
              <div
                key={teacher.id}
                className={`animate-fade-in stagger-${Math.min(index + 1, 8)} bg-white rounded-xl p-4 border transition-all ${
                  medal ? `${medal.border} shadow-sm` : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                        medal
                          ? `bg-gradient-to-br ${medal.bg} text-white shadow-sm`
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {index === 0 && teacher.vote_count > 0 ? (
                        <Crown className="w-4 h-4" />
                      ) : index === 1 && teacher.vote_count > 0 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-sm ${medal ? "text-slate-800" : "text-slate-600"}`}>
                        {teacher.name}
                      </div>
                      <div className="text-xs text-slate-400">{teacher.subject}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold leading-none ${medal ? medal.text : "text-slate-500"}`}>
                      {teacher.vote_count}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{percentage}%</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ease-out ${
                      index === 0 && teacher.vote_count > 0
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                        : index === 1 && teacher.vote_count > 0
                          ? "bg-gradient-to-r from-slate-300 to-slate-400"
                          : index === 2 && teacher.vote_count > 0
                            ? "bg-gradient-to-r from-orange-400 to-amber-500"
                            : "bg-primary/60"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="animate-fade-in text-center py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Inbox className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-400 font-medium">Zatím žádné hlasy</p>
          </div>
        )}
      </main>
    </div>
  );
}
