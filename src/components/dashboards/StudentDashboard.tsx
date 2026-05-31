import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, ClipboardList, PenTool, CheckCircle, HelpCircle, Landmark, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { Student, Assignment, Invoice, Result, Exam } from '../../types';

interface StudentDashboardProps {
  schoolId: string;
  studentEmail: string;
}

export default function StudentDashboard({ schoolId, studentEmail }: StudentDashboardProps) {
  const [profile, setProfile] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStudentDashboard() {
    try {
      setLoading(true);
      const [resStudents, resAssignments, resInvoices, resResults, resExams] = await Promise.all([
        fetch(`/api/students?schoolId=${schoolId}`),
        fetch(`/api/assignments?schoolId=${schoolId}`),
        fetch(`/api/invoices?schoolId=${schoolId}`),
        fetch(`/api/results?schoolId=${schoolId}`),
        fetch(`/api/exams?schoolId=${schoolId}`),
      ]);

      const listSt = await resStudents.json();
      const st = listSt.find((s: any) => s.email.toLowerCase() === studentEmail.toLowerCase()) || listSt[0];
      setProfile(st);

      // Filter other dependencies
      const hws = await resAssignments.json();
      const invs = await resInvoices.json();
      const rsts = await resResults.json();

      if (st) {
        setAssignments(hws.filter((hw: any) => hw.classId === st.classId));
        setInvoices(invs.filter((inv: any) => inv.studentId === st.id));
        setResults(rsts.filter((r: any) => r.studentId === st.id));
      }
      setExams(await resExams.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudentDashboard();
  }, [schoolId, studentEmail]);

  const handlePaySim = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, paymentMethod: 'SaaS Client Card Gateway' })
      });
      if (res.ok) {
        await loadStudentDashboard();
        alert('Stripe Transaction Approved successfully! Account details synchronized.');
      }
    } catch (err: any) {
      alert(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-405 mb-2"></div>
        <p className="text-xs text-slate-400 font-mono font-bold">Booting Student Command deck...</p>
      </div>
    );
  }

  // Calculate Average GPA
  const averageGpa = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.gpa, 0) / results.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6 text-slate-200">
      {/* Student Banner */}
      <div className="glass-panel rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-black/20">
        <div className="relative z-10">
          <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-400/30">
            Admitted Scholar
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight mt-3">Welcome, Scholar {profile?.name || 'Student'}!</h1>
          <p className="text-slate-300 text-xs mt-1">Admission Index: {profile?.admissionNumber} • Roll Code: #{profile?.rollNumber}</p>
        </div>
        <div className="absolute right-6 top-6 opacity-5 select-none pointer-events-none">
          <Sparkles className="w-24 h-24 text-sky-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Homework lists */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg md:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/10 pb-2">
            <ClipboardList className="w-4 h-4 text-slate-400" /> Issued Homework & Exercises
          </h3>

          {assignments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-white/5">
              Excellent! No pending homework tasks for your cohort class division today.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(as => (
                <div key={as.id} className="p-4 bg-slate-950/40 hover:bg-white/5 rounded-xl border border-white/5 flex justify-between items-start transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-xs">{as.title}</h4>
                    <p className="text-slate-350 text-[11px] mt-1.5 leading-relaxed">{as.description}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-[10px] text-slate-450 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {as.dueDate}
                    </span>
                    <span className="bg-amber-500/10 text-amber-305 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grades card sidebar */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400" /> Semester Grade Card
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-1 rounded font-mono">
              GPA: {averageGpa}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-white/5">
              Grade card remarks has not been synchronized on database yet.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(r => {
                const examObj = exams.find(e => e.id === r.examId);
                return (
                  <div key={r.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-205 text-xs capitalize">{examObj?.name || 'Class midterm test'}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Remarks: {r.remarks || 'Excellent work.'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-white block font-mono">{r.marksObtained}%</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">{r.grade}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tuition fee invoices checking */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg md:col-span-3 space-y-4">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5 pb-2 border-b border-white/10">
            <Landmark className="w-4 h-4 text-slate-400" /> Personal Billing & Stripe Invoices
          </h3>

          <div className="overflow-x-auto text-xs text-slate-300">
            <table className="w-full text-left bg-transparent">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/5 font-bold uppercase">
                  <th className="p-3">Fee Concept Class</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Debit amount</th>
                  <th className="p-3 text-right">Stripe Checkout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-white">{inv.category}</td>
                    <td className="p-3 font-mono font-medium text-slate-400">{inv.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">${inv.amount}</td>
                    <td className="p-3 text-right">
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => handlePaySim(inv.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] select-none transition-colors shadow-lg shadow-indigo-600/10"
                        >
                          Simulate Stripe Payment
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center justify-end gap-1 select-none">
                          <CheckCircle className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
