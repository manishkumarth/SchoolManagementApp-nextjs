import React, { useState, useEffect } from 'react';
import { 
  School, Users, ShieldAlert, Sparkles, LogIn, ChevronDown, 
  Layers, Settings, GraduationCap, UserCheck, ShieldCheck, Plus, ExternalLink
} from 'lucide-react';

// Import Dashboards
import SuperAdminDashboard from './components/dashboards/SuperAdminDashboard';
import SchoolAdminDashboard from './components/dashboards/SchoolAdminDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';

// Import Onboarding Wizard
import OnboardingWizard from './components/OnboardingWizard';

import { UserRole } from './types';

export default function App() {
  const [schools, setSchools] = useState<any[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState('sc_1');
  const [currentUser, setCurrentUser] = useState({
    name: 'Sarah Jenkins',
    email: 'admin@aero.edu.us',
    role: 'school_admin' as UserRole
  });

  const [activeThemeColor, setActiveThemeColor] = useState('#0ea5e9'); // Dynamic brand accent color
  const [showEnrollSchool, setShowEnrollSchool] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync schools directory
  async function fetchSchoolsList() {
    try {
      const res = await fetch('/api/super/analytics');
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schoolsList || []);
        
        // Match Theme color of active school
        const activeSchoolObj = data.schoolsList?.find((s: any) => s.id === activeSchoolId);
        if (activeSchoolObj?.branding?.primaryColor) {
          setActiveThemeColor(activeSchoolObj.branding.primaryColor);
        }
      }
    } catch (e) {
      console.error('Failed to sync schools list:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchoolsList();
  }, [activeSchoolId]);

  const activeSchool = schools.find(s => s.id === activeSchoolId);

  // Adapt preset credentials on school or role changes to simplify testing
  const handleRoleSimulation = (role: UserRole) => {
    let email = 'admin@aero.edu.us';
    let name = 'Sarah Jenkins';

    if (role === 'super_admin') {
      email = 'manish12099@gmail.com';
      name = 'Manish Kumar (SaaS Admin)';
    } else if (role === 'teacher') {
      email = 'robert.math@aero.edu.us';
      name = 'Robert Downey';
    } else if (role === 'student') {
      email = 'leo.parker@aero.edu.us';
      name = 'Leo Parker';
    } else if (role === 'parent') {
      email = 'marcus.parker@gmail.com';
      name = 'Marcus Parker';
    }

    setCurrentUser({ name, email, role });
  };

  const handleOnboardSuccess = (newSchoolObj: any, ownerUserObj: any) => {
    setSchools(prev => [...prev, newSchoolObj]);
    setActiveSchoolId(newSchoolObj.id);
    setCurrentUser({
      name: ownerUserObj.name,
      email: ownerUserObj.email,
      role: 'school_admin'
    });
    if (newSchoolObj.branding?.primaryColor) {
      setActiveThemeColor(newSchoolObj.branding.primaryColor);
    }
    setShowEnrollSchool(false);
  };

  return (
    <div className="min-h-screen bg-transparent pb-12 flex flex-col font-sans select-none antialiased text-slate-150">
      {/* SaaS Global top control deck */}
      <div className="bg-slate-950/40 backdrop-blur-md border-b border-white/5 text-slate-300 text-xs px-4 py-2.5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-sky-500/15 text-sky-400 font-extrabold text-[10px] tracking-wide uppercase px-2.5 py-0.5 rounded border border-sky-400/20 flex items-center gap-1.5 animate-pulse">
            <span className="inline-block w-1.5 h-1.5 bg-sky-400 rounded-full"></span> SANDBOX SIMULATOR CONTROLS
          </span>
          <p className="text-slate-400 text-[11px] font-sans">
            Use the simulation deck to instantly swap tenant identities, test roles, or enroll real schools on the fly.
          </p>
        </div>

        {/* Roles Simulation controller */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-wide">Select Test Persona:</span>
          {[
            { id: 'super_admin', label: 'Super Admin', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
            { id: 'school_admin', label: 'School Admin', color: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
            { id: 'teacher', label: 'Faculty Coach', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
            { id: 'student', label: 'Student', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
            { id: 'parent', label: 'Guardian', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' }
          ].map(persona => {
            const isSelected = currentUser.role === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => handleRoleSimulation(persona.id as UserRole)}
                className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                  isSelected 
                    ? `${persona.color} scale-102 ring-1 ring-white/10` 
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                {persona.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main SaaS Platform Application Header */}
      <header className="glass-panel border-b border-white/10 px-6 py-4 sticky top-0 z-30 shadow-lg shadow-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Main Logo icon */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-950/60 border border-white/15 flex items-center justify-center font-display font-black text-lg text-white shadow-lg">
              ES
            </div>
            <div>
              <h2 className="font-display font-black text-white text-sm tracking-tight">EduSphere SaaS</h2>
              <span className="text-[10px] bg-white/10 border border-white/5 text-slate-350 px-1.5 py-0.2 rounded font-mono">v1.1</span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/10 hidden md:block"></div>

          {/* ACTIVE TENANT DROPDOWN */}
          {currentUser.role !== 'super_admin' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Tenant Node:</span>
              <div className="relative">
                <select
                  value={activeSchoolId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setActiveSchoolId(id);
                    // Update credentials matching selected school
                    if (id === 'sc_2') {
                      setCurrentUser({ name: 'Horizon Principal', email: 'contact@horizon.edu.org', role: currentUser.role });
                    } else if (id === 'sc_1') {
                      setCurrentUser({ name: 'Sarah Jenkins', email: 'admin@aero.edu.us', role: currentUser.role });
                    }
                  }}
                  className="bg-slate-950/45 hover:bg-slate-900/50 border border-white/10 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-200 outline-none cursor-pointer transition-all appearance-none"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.name} ({s.subdomain})</option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {currentUser.role === 'super_admin' && (
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold py-1 px-2.5 border border-emerald-500/20 rounded-lg select-none">
              🌐 CROSS-TENANT OVERVIEW STATE
            </div>
          )}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEnrollSchool(true)}
            className="flex items-center gap-2 p-2 px-3 border border-white/10 text-slate-200 hover:bg-white/5 rounded-lg text-xs font-bold select-none transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Register My School
          </button>

          <div className="h-5 w-px bg-white/10"></div>

          {/* Connected User identity badge */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-200 block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono lowercase leading-none">{currentUser.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-950/60 border border-white/15 flex items-center justify-center font-bold text-xs text-white">
              {currentUser.name[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Primary Dashboard Area */}
      <main className="max-w-7xl w-full mx-auto px-6 mt-8 flex-1">
        
        {currentUser.role === 'super_admin' && (
          <SuperAdminDashboard 
            onAddSchoolClick={() => setShowEnrollSchool(true)} 
          />
        )}

        {currentUser.role === 'school_admin' && (
          <SchoolAdminDashboard 
            schoolId={activeSchoolId} 
            onBrandingChange={(col) => setActiveThemeColor(col)}
          />
        )}

        {currentUser.role === 'teacher' && (
          <TeacherDashboard 
            schoolId={activeSchoolId}
            teacherEmail={currentUser.email}
          />
        )}

        {currentUser.role === 'student' && (
          <StudentDashboard 
            schoolId={activeSchoolId}
            studentEmail={currentUser.email}
          />
        )}

        {currentUser.role === 'parent' && (
          <ParentDashboard 
            schoolId={activeSchoolId}
            parentEmail={currentUser.email}
          />
        )}

      </main>

      {/* POPUP ONBOARDING REGISTRATION WIZARD */}
      {showEnrollSchool && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <OnboardingWizard
            onSuccess={handleOnboardSuccess}
            onCancel={() => setShowEnrollSchool(false)}
          />
        </div>
      )}

      {/* Footer information bar */}
      <footer className="mt-16 border-t border-white/5 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full px-6 flex justify-between items-center leading-none select-none">
        <div>
          EduSphere school Management SaaS • Isolation Architecture Activated
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-600">
          <span>MAPPED MONGODB: ATLAS_REPLICA_HIGH</span>
          <span>INGRESS_PORT: 3000</span>
        </div>
      </footer>
    </div>
  );
}
