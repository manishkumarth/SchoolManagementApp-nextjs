import React, { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, PenTool, CheckCircle, Clock, Plus, Sparkles } from 'lucide-react';
import { Student, Class, Subject, Assignment } from '../../types';

interface TeacherDashboardProps {
  schoolId: string;
  teacherEmail: string;
}

export default function TeacherDashboard({ schoolId, teacherEmail }: TeacherDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAs, setNewAs] = useState({
    title: '', description: '', dueDate: '', classId: '', subjectId: ''
  });

  const [loading, setLoading] = useState(true);

  async function loadTeacherDashboard() {
    try {
      setLoading(true);
      const [resTeachers, resStudents, resClasses, resSubjects, resAssignments] = await Promise.all([
        fetch(`/api/teachers?schoolId=${schoolId}`),
        fetch(`/api/students?schoolId=${schoolId}`),
        fetch(`/api/classes?schoolId=${schoolId}`),
        fetch(`/api/subjects?schoolId=${schoolId}`),
        fetch(`/api/assignments?schoolId=${schoolId}`),
      ]);

      const listTeachers = await resTeachers.json();
      const me = listTeachers.find((t: any) => t.email.toLowerCase() === teacherEmail.toLowerCase()) || listTeachers[0];
      setTeacherProfile(me);

      setStudents(await resStudents.json());
      setClasses(await resClasses.json());
      setSubjects(await resSubjects.json());
      setAssignments(await resAssignments.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeacherDashboard();
  }, [schoolId, teacherEmail]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherProfile) return;
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAs,
          schoolId,
          teacherId: teacherProfile.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAssignments(prev => [...prev, data]);
        setShowAddAssignment(false);
        setNewAs({ title: '', description: '', dueDate: '', classId: '', subjectId: '' });
      }
    } catch (err) {
      alert(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-405 mb-2"></div>
        <p className="text-xs text-slate-400 font-mono">Syncing Classrooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      {/* Teacher Welcome Header */}
      <div className="glass-panel p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-black/20">
        <div className="relative z-10">
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/30">
            Faculty Member
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight mt-3">Welcome Back, Coach {teacherProfile?.name || 'Educator'}!</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-lg">
            Keep track of class syllabuses, update homework briefs, post grades, and audit student rosters.
          </p>
        </div>
        <div className="absolute right-6 top-6 opacity-5 select-none pointer-events-none">
          <Sparkles className="w-24 h-24 text-emerald-450" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Homework lists */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div>
              <h3 className="font-display font-bold text-white text-sm">Classroom Assignments Board</h3>
              <p className="text-slate-400 text-[11px]">Define exercises and due dates for students.</p>
            </div>

            <button
              onClick={() => setShowAddAssignment(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Issue Homework
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-lg text-slate-405 text-xs bg-slate-950/40">
              No assignments has been posted yet. Get started by clicking "Issue Homework".
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(as => (
                <div key={as.id} className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-sky-550/15 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-505/20 font-mono animate-pulse">
                      Class: {classes.find(c => c.id === as.classId)?.name || 'General Grade'}
                    </span>
                    <span className="text-[10px] text-slate-450 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {as.dueDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{as.title}</h4>
                  <p className="text-slate-350 text-[11.5px] leading-relaxed">{as.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Student Roster List */}
        <div className="glass-panel border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="border-b border-white/10 pb-2">
            <h3 className="font-display font-bold text-white text-sm">Classroom Students</h3>
            <p className="text-slate-400 text-[11px]">Student body enrolled in your campus division.</p>
          </div>

          <div className="space-y-2.5">
            {students.map(st => (
              <div key={st.id} className="p-3 border border-white/5 bg-slate-955/40 hover:bg-white/5 rounded-lg flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/15 border border-white/5 rounded-full font-bold text-xs text-slate-200 flex items-center justify-center">
                    {st.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">{st.name}</h4>
                    <span className="text-[10px] text-slate-405 font-mono">{st.admissionNumber}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-450">
                  {classes.find(c => c.id === st.classId)?.name || 'Grade 10'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE HW MODAL */}
      {showAddAssignment && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-xl max-w-sm w-full p-5 border border-white/15 shadow-2xl text-slate-200">
            <h4 className="font-bold text-white text-xs mb-3">Issue Class Assignment</h4>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Homework Heading*</label>
                <input
                  type="text"
                  placeholder="Polynomial Graphing Workout"
                  className="w-full p-2 bg-slate-950/50 text-white border border-white/10 rounded outline-none placeholder:text-slate-600 focus:border-indigo-550"
                  value={newAs.title}
                  onChange={e => setNewAs({...newAs, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detailed Description Exercises*</label>
                <textarea
                  rows={3}
                  placeholder="Solve questions 1 through 15 on Chapter 4..."
                  className="w-full p-2 bg-slate-950/50 text-white border border-white/10 rounded outline-none placeholder:text-slate-600 focus:border-indigo-550"
                  value={newAs.description}
                  onChange={e => setNewAs({...newAs, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-305 mb-1">Assigned Grade Class*</label>
                  <select
                    className="w-full p-2 bg-slate-950 border border-white/10 text-slate-200 rounded outline-none focus:border-indigo-550"
                    value={newAs.classId}
                    onChange={e => setNewAs({...newAs, classId: e.target.value})}
                    required
                  >
                    <option value="" className="bg-slate-900">Select option</option>
                    {classes.map(cl => (
                      <option key={cl.id} value={cl.id} className="bg-slate-900 text-white">{cl.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-305 mb-1 font-mono">Target Subject*</label>
                  <select
                    className="w-full p-2 bg-slate-950 border border-white/10 text-slate-200 rounded outline-none focus:border-indigo-550"
                    value={newAs.subjectId}
                    onChange={e => setNewAs({...newAs, subjectId: e.target.value})}
                    required
                  >
                    <option value="" className="bg-slate-900">Select option</option>
                    {subjects.map(su => (
                      <option key={su.id} value={su.id} className="bg-slate-900 text-white">{su.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Submission Due Date*</label>
                <input
                  type="date"
                  className="w-full p-2 bg-slate-950/50 text-white border border-white/10 rounded outline-none focus:border-indigo-550"
                  value={newAs.dueDate}
                  onChange={e => setNewAs({...newAs, dueDate: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddAssignment(false)} className="px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded text-slate-300">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded shadow-lg shadow-indigo-600/20">Broadcast Homework</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
