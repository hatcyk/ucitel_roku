"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Načítání...</div>
      </div>
    );
  }

  const maxVotes = results.length > 0 ? results[0].vote_count : 0;

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Výsledky</h1>
            <p className="text-gray-500">Průběžné výsledky hlasování</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{totalVotes}</div>
            <div className="text-sm text-gray-500">celkem hlasů</div>
          </div>
        </div>

        <div className="space-y-3">
          {results.map((teacher, index) => {
            const percentage =
              totalVotes > 0
                ? Math.round((teacher.vote_count / totalVotes) * 100)
                : 0;
            const barWidth =
              maxVotes > 0 ? (teacher.vote_count / maxVotes) * 100 : 0;

            return (
              <div
                key={teacher.id}
                className={`bg-white rounded-xl p-4 border ${
                  index === 0 && teacher.vote_count > 0
                    ? "border-yellow-300 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 && teacher.vote_count > 0
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {teacher.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {teacher.subject}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {teacher.vote_count}
                    </div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0 && teacher.vote_count > 0
                        ? "bg-yellow-400"
                        : "bg-blue-400"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Zatím nebyly odevzdány žádné hlasy.
          </div>
        )}
      </main>
    </div>
  );
}
