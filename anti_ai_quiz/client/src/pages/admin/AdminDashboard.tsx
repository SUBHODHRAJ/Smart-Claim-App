import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatsCard } from '../../components/StatsCard';
import { LoadingSpinner, ErrorAlert } from '../../components/LoadingSpinner';
import { Shield, Users, FileQuestion, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statRes, userRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      if (statRes.data.success) setStats(statRes.data.data);
      if (userRes.data.success) setUsers(userRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  if (loading && !stats) return <LoadingSpinner message="Loading platform admin metrics..." />;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>System Administration Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Platform Overview & User Control
        </h1>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.totalStudents || 0} Students, ${stats?.totalTeachers || 0} Teachers`}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Processed Materials"
          value={stats?.totalDocuments || 0}
          subtitle="Course PDFs and texts"
          icon={<FileText className="w-5 h-5" />}
          color="indigo"
        />
        <StatsCard
          title="Total Quizzes"
          value={stats?.totalQuizzes || 0}
          subtitle="In platform question bank"
          icon={<FileQuestion className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Submitted Attempts"
          value={stats?.totalAttempts || 0}
          subtitle="Evaluated test submissions"
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Users Management Directory */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-100 mb-4">User Directory & Roles</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Points</th>
                <th className="pb-3 px-3">Streak</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-100">{u.name}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : u.role === 'TEACHER'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold">{u.points || 0}</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{u.currentStreak || 0}d</td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-brand-500"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
