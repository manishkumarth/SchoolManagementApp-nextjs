import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Bell, ClipboardList, CheckCircle, Clock } from 'lucide-react';

interface ParentDashboardProps {
  schoolId: string;
  parentEmail: string;
}

export default function ParentDashboard({ schoolId, parentEmail }: ParentDashboardProps) {
  const [children, setChildren] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadParentDashboard() {
    try {
      setLoading(true);
      const [resStudents, resNotices] = await Promise.all([
        fetch(`/api/students?schoolId=${schoolId}`),
        fetch(`/api/notices?schoolId=${schoolId}`)
      ]);

      const listSt = await resStudents.json();
      // Since it is sandbox, assign top 1-2 students as children profiles for parent view simulation
      setChildren(listSt.slice(0, 2));

      const nt = await resNotices.json();
      setNotices(nt.filter((n: any) => n.targetRole === 'parents' || n.targetRole === 'all'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParentDashboard();
  }, [schoolId, parentEmail]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-405 mb-2"></div>
        <p className="text-xs text-slate-400 font-mono">Syncing Family records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      {/* Parent Welcome Banner */}
      <div className="glass-panel rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-black/20">
        <div>
          <span className="bg-amber-500/20 text-amber-450 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/30">
            Guardian Accounts
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight mt-3 font-black">Family Dashboard Access</h1>
          <p className="text-slate-300 text-xs mt-1">
            Access evaluations, coordinate transit rosters, review fee installments, and browse administrative messages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Child Evaluation summaries */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg md:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Users className="w-4 h-4 text-slate-400" /> Tracked Children Profiles
          </h3>

          {children.length === 0 ? (
            <div className="p-8 text-center text-slate-405 text-xs bg-slate-950/40 rounded-xl border border-white/5">
              No registered children found under this family profile yet. Verify enrollment with the receptionist desk.
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child, i) => (
                <div key={i} className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/5 text-lg flex items-center justify-center">
                      👦
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{child.name}</h4>
                      <p className="text-xs text-slate-400">Admission Code: {child.admissionNumber} • Roll Code: #{child.rollNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="bg-sky-500/10 text-sky-450 text-[10px] font-bold py-1 px-3 border border-sky-500/20 rounded-full">
                      Attendance Ratio: 98%
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-450 text-[10px] font-bold py-1 px-3 border border-emerald-500/20 rounded-full animate-pulse">
                      Status: Excellent standing
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices Board */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5 pb-2 border-b border-white/10">
            <Bell className="w-4 h-4 text-slate-400" /> Guardian Notice Alerts
          </h3>

          {notices.length === 0 ? (
            <div className="p-6 text-center text-slate-405 text-xs bg-slate-950/40 rounded-xl border border-white/5">
              No active guardian-specific notifications.
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((n, i) => (
                <div key={i} className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                  <h4 className="font-bold text-white text-xs">{n.title}</h4>
                  <p className="text-slate-350 text-[10.5px] mt-1 leading-relaxed">{n.content}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
