import React, { useState, useEffect } from 'react';
import { 
  Users, School, BookOpen, Calendar, GraduationCap, 
  Settings, Award, Trash2, Plus, Sparkles, Receipt, CheckCircle, 
  MapPin, Bell, Landmark, UserCheck, Book, ClipboardList, PenTool, Bus, Bed, Package
} from 'lucide-react';
import { Student, Teacher, Class, Section, Subject, Invoice } from '../../types';

interface SchoolAdminDashboardProps {
  schoolId: string;
  onBrandingChange?: (primaryColor: string) => void;
}

export default function SchoolAdminDashboard({ schoolId, onBrandingChange }: SchoolAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'students' | 'teachers' | 'academics' | 'billing' | 'operations'>('overview');
  
  // States
  const [schoolData, setSchoolData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Operational state fields
  const [notices, setNotices] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // Modals / Creators
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', admissionNumber: '', rollNumber: '1', classId: '', sectionId: '', address: '', medicalRecords: ''
  });

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '', email: '', phone: '', qualification: '', department: '', experienceYears: '3', salary: '4500'
  });

  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', teacherId: '' });

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', type: 'theory' as 'theory' | 'practical' | 'both' });

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', targetRole: 'all' });

  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ studentId: '', amount: '', dueDate: '', category: 'Tuition Fee (Q2)' });

  // Branding Customization States
  const [brandName, setBrandName] = useState('');
  const [brandPhone, setBrandPhone] = useState('');
  const [brandAddress, setBrandAddress] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0ea5e9');

  // Selected Student for ID card inspection
  const [selectedIdCard, setSelectedIdCard] = useState<Student | null>(null);

  const [loading, setLoading] = useState(true);

  // Load Data
  async function loadTenantData() {
    try {
      setLoading(true);
      const [
        resSchool, resStudents, resTeachers, resClasses, 
        resSections, resSubjects, resInvoices, resNotices,
        resBooks, resBuses, resRooms, resAssets
      ] = await Promise.all([
        fetch(`/api/schools/${schoolId}`),
        fetch(`/api/students?schoolId=${schoolId}`),
        fetch(`/api/teachers?schoolId=${schoolId}`),
        fetch(`/api/classes?schoolId=${schoolId}`),
        fetch(`/api/sections?schoolId=${schoolId}`),
        fetch(`/api/subjects?schoolId=${schoolId}`),
        fetch(`/api/invoices?schoolId=${schoolId}`),
        fetch(`/api/notices?schoolId=${schoolId}`),
        fetch(`/api/library?schoolId=${schoolId}`),
        fetch(`/api/transport?schoolId=${schoolId}`),
        fetch(`/api/hostel?schoolId=${schoolId}`),
        fetch(`/api/inventory?schoolId=${schoolId}`),
      ]);

      const sc = await resSchool.json();
      setSchoolData(sc);
      setBrandName(sc.name);
      setBrandPhone(sc.phone || '');
      setBrandAddress(sc.address || '');
      setSelectedColor(sc.branding?.primaryColor || '#0ea5e9');

      setStudents(await resStudents.json());
      setTeachers(await resTeachers.json());
      setClasses(await resClasses.json());
      setSections(await resSections.json());
      setSubjects(await resSubjects.json());
      setInvoices(await resInvoices.json());
      setNotices(await resNotices.json());
      setBooks(await resBooks.json());
      setBuses(await resBuses.json());
      setRooms(await resRooms.json());
      setAssets(await resAssets.json());

    } catch (e) {
      console.error('Failed to sync tenant assets:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenantData();
  }, [schoolId]);

  // Handlers
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/schools/${schoolId}/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandName,
          phone: brandPhone,
          address: brandAddress,
          primaryColor: selectedColor,
          secondaryColor: '#0f172a'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSchoolData(updated);
        if (onBrandingChange) onBrandingChange(selectedColor);
        alert('Branding updated successfully! Adaptive layouts activated.');
      }
    } catch (err) {
      alert('Failed saving config: ' + err);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStudent, schoolId })
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(prev => [...prev, data]);
        setShowAddStudent(false);
        setNewStudent({
          name: '', email: '', admissionNumber: '', rollNumber: '1', classId: '', sectionId: '', address: '', medicalRecords: ''
        });
      }
    } catch (err) {
      alert('Insertion failed: ' + err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you certain about removing this student registry? Associated tenant authorization token will be invalidated.')) return;
    try {
      const res = await fetch(`/api/students/${id}?schoolId=${schoolId}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTeacher, schoolId })
      });
      if (res.ok) {
        const data = await res.json();
        setTeachers(prev => [...prev, data]);
        setShowAddTeacher(false);
        setNewTeacher({ name: '', email: '', phone: '', qualification: '', department: '', experienceYears: '3', salary: '4500' });
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClass, schoolId })
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(prev => [...prev, data]);
        setShowAddClass(false);
        setNewClass({ name: '', teacherId: '' });
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSubject, schoolId })
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(prev => [...prev, data]);
        setShowAddSubject(false);
        setNewSubject({ name: '', code: '', type: 'theory' });
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newNotice, schoolId })
      });
      if (res.ok) {
        const data = await res.json();
        setNotices(prev => [...prev, data]);
        setShowAddNotice(false);
        setNewNotice({ title: '', content: '', targetRole: 'all' });
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          studentId: newInvoice.studentId,
          amount: Number(newInvoice.amount),
          dueDate: newInvoice.dueDate,
          status: 'unpaid',
          category: newInvoice.category
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(prev => [...prev, data]);
        setShowAddInvoice(false);
        setNewInvoice({ studentId: '', amount: '', dueDate: '', category: 'Tuition Fee (Q2)' });
      }
    } catch (err) {
      alert(err);
    }
  };

  const handleSettlementPayment = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, paymentMethod: 'SaaS Client Card Gateway' })
      });
      if (res.ok) {
        await loadTenantData();
        alert('Stripe billing simulation completed. Receipt published under Accounting statements.');
      }
    } catch (err) {
      alert(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 bg-transparent border-indigo-400 mb-2"></div>
        <p className="text-xs text-slate-400 font-mono">Syncing tenant data parameters...</p>
      </div>
    );
  }

  // Active styles helpers
  const primaryStyle = { color: selectedColor };
  const bgPrimaryStyle = { backgroundColor: selectedColor };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Brand Customized Hub Banner */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-sky-500/15 text-sky-400 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-sky-500/20">
              {schoolData?.subscription?.plan?.replace('_', ' ')} tier
            </span>
            <span className="font-mono text-[10px] text-slate-405 uppercase">Subdomain: {schoolData?.subdomain}</span>
          </div>
          <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
            {schoolData?.logoUrl && (
              <img src={schoolData.logoUrl} className="w-8 h-8 rounded-lg object-cover border border-white/10" />
            )}
            {schoolData?.name}
          </h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            {schoolData?.address || '77 Summit Ridge Boulevard, Tech Hills'} • {schoolData?.phone || '+1 (555) 349-2041'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Preset Branding Color Switches */}
          <div className="flex items-center gap-1.5 p-2 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-400 mr-1 select-none">Branding:</span>
            {['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#a855f7'].map(col => (
              <button 
                key={col}
                onClick={async () => {
                  setSelectedColor(col);
                  await fetch(`/api/schools/${schoolId}/branding`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ primaryColor: col, secondaryColor: '#0f172a' })
                  });
                  if (onBrandingChange) onBrandingChange(col);
                }}
                className={`w-4 h-4 rounded-full border-2 transition-all ${selectedColor === col ? 'border-white scale-125' : 'border-transparent'}`}
                style={{ backgroundColor: col }}
                title="Shift Accent Brand"
              />
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="border-b border-white/10 flex gap-2 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Console Hub', icon: School },
          { id: 'students', label: 'Students Roster', icon: Users },
          { id: 'teachers', label: 'Faculty Directory', icon: BookOpen },
          { id: 'academics', label: 'Academics Planner', icon: Calendar },
          { id: 'billing', label: 'Stripe Accounting', icon: Receipt },
          { id: 'operations', label: 'Support Operations', icon: Settings },
          { id: 'config', label: 'Setup Branding', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black select-none border-b-2 tracking-tight transition-all uppercase ${
                isActive 
                  ? 'border-white text-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-250'
              }`}
            >
              <Icon className="w-4 h-4" style={isActive ? primaryStyle : undefined} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW CONSOLE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel border border-white/5 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Student Body</span>
              <span className="text-2xl font-black text-white font-display">{students.length} Active</span>
              <p className="text-[10px] text-slate-400 mt-2">Registries completely isolated</p>
            </div>
            
            <div className="glass-panel border border-white/5 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Active Faculty</span>
              <span className="text-2xl font-black text-white font-display">{teachers.length} Faculty</span>
              <p className="text-[10px] text-slate-400 mt-2">Average Ph.D/M.Sc mix</p>
            </div>

            <div className="glass-panel border border-white/5 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Academic Courses</span>
              <span className="text-2xl font-black text-white font-display">{classes.length} Semesters</span>
              <p className="text-[10px] text-slate-400 mt-2">{subjects.length} Specializations configured</p>
            </div>

            <div className="glass-panel border border-white/5 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-1">Total Receivables</span>
              <span className="text-2xl font-black text-white font-display font-mono">
                ${invoices.filter(i => i.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0)}
              </span>
              <p className="text-[10px] text-red-400 mt-2">🚨 Arrears awaiting collection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Notices feed */}
            <div className="glass-panel border border-white/5 rounded-xl p-5 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white text-sm">Recent Official Notices</h3>
                <button 
                  onClick={() => setActiveTab('operations')}
                  className="text-xs font-semibold hover:underline"
                  style={primaryStyle}
                >
                  Configure Notices
                </button>
              </div>

              {notices.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-lg text-slate-400 text-xs text-slate-400">
                  No active notifications/announcements on bulletin boards.
                </div>
              ) : (
                <div className="space-y-4">
                  {notices.map((n, i) => (
                    <div key={i} className="p-4 bg-slate-950/40 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-xs">{n.title}</h4>
                        <span className="bg-white/10 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          Target: {n.targetRole}
                        </span>
                      </div>
                      <p className="text-slate-350 text-[11px] mt-1.5 leading-relaxed">{n.content}</p>
                      <span className="text-[9px] text-slate-400 mt-3 block font-mono">Published: {new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats sidebar widget */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-800 text-sm">Operational State Metrics</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5"><Book className="w-3.5 h-3.5 text-slate-400" /> Library Copies</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{books.length} publications</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5"><Bus className="w-3.5 h-3.5 text-slate-400" /> Bus Fleets</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{buses.length} vehicles</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-slate-400" /> Hostel Dorms</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{rooms.length} room allocations</span>
                </div>

                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-slate-400" /> Inventory Lots</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{assets.length} items audited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-display font-bold text-slate-900 text-[15px]">Enrolled Student Body</h2>
              <p className="text-slate-500 text-xs">Provision, promote, delete, and inspect generated student ID badges.</p>
            </div>

            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-2 px-4 py-2 text-white hover:opacity-90 rounded-lg text-xs font-bold transition-opacity"
              style={bgPrimaryStyle}
            >
              <Plus className="w-4 h-4" /> Register New Student Candidate
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50 font-bold uppercase">
                  <th className="p-3">Admit Code</th>
                  <th className="p-3">Candidate Name</th>
                  <th className="p-3">Academic Grade</th>
                  <th className="p-3">Contact Email</th>
                  <th className="p-3">ID badge</th>
                  <th className="p-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{st.admissionNumber}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 font-mono font-bold text-[9px] flex items-center justify-center text-slate-600">
                          {st.name[0]}
                        </div>
                        {st.name}
                      </div>
                    </td>
                    <td className="p-3">
                      {classes.find(c => c.id === st.classId)?.name || 'General Grade'}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{st.email}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedIdCard(st)}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 select-none hover:bg-slate-50 text-slate-700 rounded"
                      >
                        Visual ID Card
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1 px-2 border hover:bg-red-50 text-red-500 border-slate-200 hover:border-red-200 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD STUDENT MODAL */}
          {showAddStudent && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-slate-800 text-sm">Register Student Candidate</h3>
                  <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold select-none">Close</button>
                </div>

                <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Candidate Name*</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                      required
                      value={newStudent.name}
                      onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admission Code*</label>
                      <input
                        type="text"
                        placeholder="ADM-2026-04"
                        className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                        required
                        value={newStudent.admissionNumber}
                        onChange={e => setNewStudent({...newStudent, admissionNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                        value={newStudent.rollNumber}
                        onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Student Email*</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                      required
                      value={newStudent.email}
                      onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Academic Class*</label>
                      <select
                        className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                        required
                        value={newStudent.classId}
                        onChange={e => setNewStudent({...newStudent, classId: e.target.value})}
                      >
                        <option value="">Select option</option>
                        {classes.map(cl => (
                          <option key={cl.id} value={cl.id}>{cl.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Class Section</label>
                      <select
                        className="w-full p-2 border border-slate-200 rounded outline-none"
                        value={newStudent.sectionId}
                        onChange={e => setNewStudent({...newStudent, sectionId: e.target.value})}
                      >
                        <option value="">Select option</option>
                        {sections.map(sc => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newStudent.address}
                      onChange={e => setNewStudent({...newStudent, address: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddStudent(false)}
                      className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-white rounded font-bold"
                      style={bgPrimaryStyle}
                    >
                      Provision Candidate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VISUAL PRINTABLE STUDENT ID CARD VIEW */}
          {selectedIdCard && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl overflow-hidden">
                {/* ID Card Inner Container */}
                <div className="p-6 bg-slate-900 text-white text-center relative">
                  <div className="absolute top-0 right-0 left-0 h-1.5" style={bgPrimaryStyle}></div>
                  <h4 className="font-display font-black tracking-tight text-base mt-2">{schoolData?.name}</h4>
                  <span className="text-[10px] text-slate-300 font-mono tracking-wider">OFFICIAL STUDENT PASSED</span>

                  <div className="my-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700 flex items-center justify-center text-4xl overflow-hidden shadow-lg">
                      🎓
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg">{selectedIdCard.name}</h3>
                    <p className="text-xs text-sky-400 font-bold tracking-tight">
                      {classes.find(c => c.id === selectedIdCard.classId)?.name || 'Intermediate Level'}
                    </p>
                  </div>
                </div>

                <div className="p-5 text-slate-600 text-xs space-y-3 bg-slate-50">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-slate-400">ID CODE:</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedIdCard.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-slate-400">ROLL NO:</span>
                    <span className="font-mono text-slate-800 font-semibold">#{selectedIdCard.rollNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="font-bold text-slate-400">EMAIL:</span>
                    <span className="text-slate-800 font-semibold">{selectedIdCard.email}</span>
                  </div>
                  <div className="text-[10px] text-center text-slate-400 py-2">
                    Mongoose Tenant Isolation Node Verified.
                  </div>
                </div>

                <div className="bg-slate-100 border-t p-3 flex justify-end">
                  <button
                    onClick={() => setSelectedIdCard(null)}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 font-semibold text-white rounded text-xs"
                  >
                    Close Badge
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FACULTY DIRECTORY TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-slate-900 text-[15px]">Active Faculty Members</h2>
              <p className="text-slate-500 text-xs">Maintain personal records, qualification metadata, and payroll metrics.</p>
            </div>

            <button
              onClick={() => setShowAddTeacher(true)}
              className="flex items-center gap-2 px-4 py-2 text-white hover:opacity-90 rounded-lg text-xs font-bold transition-opacity"
              style={bgPrimaryStyle}
            >
              <Plus className="w-4 h-4" /> Enlist Faculty Teacher
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50 font-bold uppercase">
                  <th className="p-3">Faculty Name</th>
                  <th className="p-3">Primary Department</th>
                  <th className="p-3">Credential / Qualification</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3 text-right">Base Salary (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map(tc => (
                  <tr key={tc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 font-mono font-bold text-[9px] flex items-center justify-center text-slate-600">
                        {tc.name[0]}
                      </div>
                      {tc.name}
                    </td>
                    <td className="p-3">{tc.department}</td>
                    <td className="p-3 font-medium text-slate-700">{tc.qualification}</td>
                    <td className="p-3 font-semibold">{tc.experienceYears} Years</td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-bold">${tc.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADD TEACHER MODAL */}
          {showAddTeacher && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-slate-800 text-sm">Enlist Faculty Teacher</h3>
                  <button onClick={() => setShowAddTeacher(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold select-none">Close</button>
                </div>

                <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Teacher Name*</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                      required
                      value={newTeacher.name}
                      onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Credentials Email*</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-slate-200 rounded outline-none focus:border-sky-500"
                      required
                      value={newTeacher.email}
                      onChange={e => setNewTeacher({...newTeacher, email: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Department</label>
                      <input
                        type="text"
                        placeholder="Science & Maths"
                        className="w-full p-2 border border-slate-200 rounded outline-none"
                        value={newTeacher.department}
                        onChange={e => setNewTeacher({...newTeacher, department: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-slate-200 rounded outline-none"
                        value={newTeacher.experienceYears}
                        onChange={e => setNewTeacher({...newTeacher, experienceYears: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Degree/Qualification</label>
                      <input
                        type="text"
                        placeholder="Ph.D Physics"
                        className="w-full p-2 border border-slate-200 rounded outline-none"
                        value={newTeacher.qualification}
                        onChange={e => setNewTeacher({...newTeacher, qualification: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Assigned Salary (USD)</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-slate-200 rounded outline-none"
                        value={newTeacher.salary}
                        onChange={e => setNewTeacher({...newTeacher, salary: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddTeacher(false)}
                      className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-white rounded font-bold"
                      style={bgPrimaryStyle}
                    >
                      Enlist Faculty
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACADEMICS & TIMETABLES TAB */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Classes & Sections config */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Course Classes Planning</h3>
                <p className="text-slate-500 text-[11px]">Define core cohorts for semester routing.</p>
              </div>

              <button
                onClick={() => setShowAddClass(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:opacity-90 rounded text-[11px] font-bold transition-opacity"
                style={bgPrimaryStyle}
              >
                <Plus className="w-3.5 h-3.5" /> Class Setup
              </button>
            </div>

            <div className="space-y-2">
              {classes.map(cl => (
                <div key={cl.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded border font-bold text-xs" style={primaryStyle}>{cl.name}</div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">
                        Class Sponsor: {teachers.find(t => t.id === cl.teacherId)?.name || 'Not appointed'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {cl.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Directory */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Course Subjects Syllabus</h3>
                <p className="text-slate-500 text-[11px]">Add theoretical papers, practical fields, or hybrid syllabus courses.</p>
              </div>

              <button
                onClick={() => setShowAddSubject(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:opacity-90 rounded text-[11px] font-bold transition-opacity"
                style={bgPrimaryStyle}
              >
                <Plus className="w-3.5 h-3.5" /> Subject Setup
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map(sub => (
                <div key={sub.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Code: {sub.code} • Type: <span className="uppercase">{sub.type}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CLASS SETUP MODALS */}
          {showAddClass && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-xs w-full p-5 border border-slate-100 shadow-xl">
                <h4 className="font-bold text-slate-800 text-xs mb-3">Add Academic cohort Class</h4>
                <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Class Label / Name*</label>
                    <input
                      type="text"
                      placeholder="e.g. Sophomore 10-D"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newClass.name}
                      onChange={e => setNewClass({...newClass, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Sponsor Faculty Teacher</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newClass.teacherId}
                      onChange={e => setNewClass({...newClass, teacherId: e.target.value})}
                    >
                      <option value="">Choose teacher</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowAddClass(false)} className="px-3 py-1 border border-slate-200 rounded">Cancel</button>
                    <button type="submit" className="px-3 py-1 text-white rounded" style={bgPrimaryStyle}>Commit Class</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAddSubject && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-xs w-full p-5 border border-slate-100 shadow-xl">
                <h4 className="font-bold text-slate-800 text-xs mb-3">Add Syllabus course Subject</h4>
                <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Subject Title*</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic Biochemistry"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newSubject.name}
                      onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Course Code*</label>
                    <input
                      type="text"
                      placeholder="chem-202"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newSubject.code}
                      onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Curriculum Class Type</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newSubject.type}
                      onChange={e => setNewSubject({...newSubject, type: e.target.value as any})}
                    >
                      <option value="theory">Theory-Only</option>
                      <option value="practical">Practical / Labs</option>
                      <option value="both">Theoretical & Labs</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowAddSubject(false)} className="px-3 py-1 border border-slate-200 rounded">Cancel</button>
                    <button type="submit" className="px-3 py-1 text-white rounded" style={bgPrimaryStyle}>Commit Course</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BILLING AND INVOICES */}
      {activeTab === 'billing' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-slate-900 text-[15px]">Stripe Billing & Invoices</h2>
              <p className="text-slate-500 text-xs">Post student fees due dates and monitor collected funds status.</p>
            </div>

            <button
              onClick={() => setShowAddInvoice(true)}
              className="flex items-center gap-2 px-4 py-2 text-white hover:opacity-90 rounded-lg text-xs font-bold transition-opacity"
              style={bgPrimaryStyle}
            >
              <Plus className="w-4 h-4" /> Issue Fee Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50 font-bold uppercase">
                  <th className="p-3">Fee Concept / Category</th>
                  <th className="p-3">Target Student</th>
                  <th className="p-3">Payment Due Date</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Collected Amount</th>
                  <th className="p-3 text-right">Instant Stripe Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => {
                  const student = students.find(s => s.id === inv.studentId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{inv.category}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {student ? student.name : 'Unknown Candidate'}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{inv.dueDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">${inv.amount}</td>
                      <td className="p-3 text-right">
                        {inv.status !== 'paid' ? (
                          <button
                            onClick={() => handleSettlementPayment(inv.id)}
                            className="px-2.5 py-1 text-white text-[10px] uppercase font-bold hover:opacity-95 rounded select-none shadow-sm"
                            style={bgPrimaryStyle}
                          >
                            Simulate Card Checkout
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-xs font-bold flex items-center justify-end gap-1 select-none">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ADD INVOICE MODAL */}
          {showAddInvoice && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-slate-800 text-sm">Issue Tuition Fee Invoice</h3>
                  <button onClick={() => setShowAddInvoice(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold select-none">Close</button>
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Enrolled Student*</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newInvoice.studentId}
                      onChange={e => setNewInvoice({...newInvoice, studentId: e.target.value})}
                      required
                    >
                      <option value="">Choose candidate</option>
                      {students.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.admissionNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Debit Amount (USD)*</label>
                    <input
                      type="number"
                      placeholder="1200"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      required
                      value={newInvoice.amount}
                      onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Due Date*</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      required
                      value={newInvoice.dueDate}
                      onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fee Classification</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newInvoice.category}
                      onChange={e => setNewInvoice({...newInvoice, category: e.target.value})}
                    >
                      <option value="Tuition Fee (Q2)">Tuition Fee (Q2)</option>
                      <option value="Hostel Maintenance">Hostel Maintenance</option>
                      <option value="School Bus Commuting">School Bus Commuting</option>
                      <option value="Laboratory Access Kit">Laboratory Access Kit</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddInvoice(false)}
                      className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-white rounded font-bold"
                      style={bgPrimaryStyle}
                    >
                      Issue Invoice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* OPERATIONS MODAL TABS */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Post Notices Announcement Board</h3>
                <p className="text-slate-500 text-[11px]">Deploy direct announcements targeting parents, students or faculties.</p>
              </div>

              <button
                onClick={() => setShowAddNotice(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:opacity-90 rounded text-[11px] font-bold transition-opacity"
                style={bgPrimaryStyle}
              >
                <Plus className="w-3.5 h-3.5" /> Announcement Setup
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((nt, ix) => (
                <div key={ix} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs">{nt.title}</h4>
                    <span className="bg-white border border-slate-200 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded">
                      Roles: {nt.targetRole}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11.5px] leading-relaxed">{nt.content}</p>
                </div>
              ))}
            </div>
          </div>

          {showAddNotice && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-slate-100 shadow-xl">
                <h4 className="font-bold text-slate-800 text-xs mb-3">Add notice announcement</h4>
                <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Notice Heading*</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newNotice.title}
                      onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Announcements Content Text*</label>
                    <textarea
                      rows={3}
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newNotice.content}
                      onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Audience Audience Filter</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded outline-none"
                      value={newNotice.targetRole}
                      onChange={e => setNewNotice({...newNotice, targetRole: e.target.value})}
                    >
                      <option value="all">Publish to All Members</option>
                      <option value="teachers">Faculty Only</option>
                      <option value="students">Students Only</option>
                      <option value="parents">Guardians / Parents</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowAddNotice(false)} className="px-3 py-1 border border-slate-200 rounded">Cancel</button>
                    <button type="submit" className="px-3 py-1 text-white rounded" style={bgPrimaryStyle}>Broadcast Notice</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SETUP BRANDING CONFIGS */}
      {activeTab === 'config' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-xl">
          <h2 className="font-display font-bold text-slate-900 text-base mb-1">Configure School Metadata Branding</h2>
          <p className="text-slate-500 text-xs mb-6">Modify subdomain profiles and primary accent design tokens safely.</p>
          
          <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academy Showcase Name*</label>
              <input
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
                required
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Phone Contact</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
                  value={brandPhone}
                  onChange={e => setBrandPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Color Preset</label>
                <input
                  type="color"
                  className="w-full h-10 p-1 border border-slate-200 rounded-lg cursor-pointer"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Physical Campus Address</label>
              <input
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none"
                value={brandAddress}
                onChange={e => setBrandAddress(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-white font-bold rounded-lg hover:opacity-95 transition-opacity"
                style={bgPrimaryStyle}
              >
                Apply Custom Branding Config
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
