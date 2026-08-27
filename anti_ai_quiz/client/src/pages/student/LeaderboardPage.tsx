import React, { useState, useEffect } from 'react';
import { gamificationService } from '../../services';
import { LeaderboardEntry, AchievementItem } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Trophy, Flame, Award, Medal, Crown, Shield, Sparkles } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [boardRes, achRes] = await Promise.all([
          gamificationService.getLeaderboard(),
          gamificationService.getMyAchievements(),
        ]);

        if (boardRes.success) setLeaderboard(boardRes.data);
        if (achRes.success) setAchievements(achRes.data);
      } catch (err) {
        console.error('Failed to load leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating weekly rankings and achievement badges..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Learning Leaderboard & Achievements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Earn points by completing quizzes, maintaining daily streaks, and mastering weak areas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard Table (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-base">Weekly Class Rankings</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Resets every Sunday</span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((student, idx) => {
              const isTop3 = idx < 3;

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : idx === 1
                      ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                      : idx === 2
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 flex items-center justify-center font-black text-sm">
                      {idx === 0 ? (
                        <Crown className="w-5 h-5 text-amber-400" />
                      ) : idx === 1 ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : idx === 2 ? (
                        <Medal className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-slate-500">#{student.rank}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{student.name}</h4>
                      <p className="text-[11px] text-slate-400">{student.classGroup}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      <span>{student.streak}d</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-100">{student.points}</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Unlocked Badges (1 Col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-base">My Badges & Milestones</h3>
            </div>

            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <div
                    key={ach._id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center space-x-3.5"
                  >
                    <div className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                      {ach.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{ach.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                Complete your first quiz attempt to unlock learning badges!
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Unlocked: {achievements.length} Achievement Badges
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
