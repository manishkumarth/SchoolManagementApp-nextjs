import React, { useState, useEffect } from 'react';
import { School as SchoolIcon, Users, DollarSign, Calendar, ShieldCheck, CreditCard, Sparkles, Plus, Check } from 'lucide-react';
import { School } from '../../types';

interface SuperAdminDashboardProps {
  onAddSchoolClick?: () => void;
}

export default function SuperAdminDashboard({ onAddSchoolClick }: SuperAdminDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);

  async function fetchSuperAnalytics() {
    try {
      setLoading(true);
      const res = await fetch('/api/super/analytics');
      if (!res.ok) throw new Error('Failed to retrieve system SaaS analytics.');
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSuperAnalytics();
  }, []);

  const handleUpdateSubscription = async (schoolId: string, plan: 'free_trial' | 'growth' | 'enterprise') => {
    try {
      setUpgrading(true);
      const res = await fetch('/api/super/invoice-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, plan })
      });
      if (!res.ok) throw new Error('Stripe transaction flow rejected.');
      await fetchSuperAnalytics();
      setSelectedSchool(null);
    } catch (err: any) {
      alert('Subscription upgrade failed: ' + err.message);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2"></div>
        <p className="text-xs text-slate-400 font-mono">Syncing SaaS Core Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-black/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-white/10 text-sky-400 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full w-max mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> SYSADM ROOT HIGH ACCESS
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">EduSphere Global Control Panel</h1>
          <p className="text-slate-300 text-xs max-w-xl mt-1.5 leading-relaxed">
            Monitor educational assets, subscription payments, tenant database isolation states, and provision new schools instantly.
          </p>
        </div>
        <div className="absolute right-6 top-6 opacity-5 select-none pointer-events-none">
          <Sparkles className="w-32 h-32 text-indigo-400" />
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Registered Tenants</span>
            <div className="bg-sky-500/10 text-sky-450 p-2.5 rounded-lg border border-sky-500/20">
              <SchoolIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{analytics?.totalSchools || 0}</span>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              Isolated Mongoose Schema
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Subscriptions</span>
            <div className="bg-indigo-500/10 text-indigo-450 p-2.5 rounded-lg border border-indigo-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{analytics?.activeSubscriptions || 0}</span>
            <p className="text-[10px] text-slate-400 mt-1">Stripe-Engine Ready</p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Monthly SaaS Revenue</span>
            <div className="bg-emerald-500/10 text-emerald-450 p-2.5 rounded-lg border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display font-mono">${analytics?.monthlyRevenue || 0}</span>
            <p className="text-[10px] text-emerald-400 mt-1">+$149 USD Growth rate</p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Estimated User Scope</span>
            <div className="bg-amber-500/10 text-amber-450 p-2.5 rounded-lg border border-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-display">{analytics?.usersCount || 0}</span>
            <p className="text-[10px] text-slate-400 mt-1">Fully cross-referenced</p>
          </div>
        </div>
      </div>

      {/* PLAN DISTRIBUTIONS & ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-5 shadow-lg md:col-span-1">
          <h3 className="font-display font-bold text-slate-100 text-sm mb-4">Subscription Plan Mix</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Free Trial (30-day)</span>
                <span className="font-mono font-bold text-slate-100">{analytics?.plansDistribution?.free_trial || 0}</span>
              </div>
              <div className="h-2 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-sky-550" 
                  style={{ width: `${((analytics?.plansDistribution?.free_trial || 0) / (analytics?.totalSchools || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Growth Tier ($149)</span>
                <span className="font-mono font-bold text-slate-100">{analytics?.plansDistribution?.growth || 0}</span>
              </div>
              <div className="h-2 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-indigo-550" 
                  style={{ width: `${((analytics?.plansDistribution?.growth || 0) / (analytics?.totalSchools || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Enterprise SLA ($399)</span>
                <span className="font-mono font-bold text-slate-100">{analytics?.plansDistribution?.enterprise || 0}</span>
              </div>
              <div className="h-2 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-amber-550" 
                  style={{ width: `${((analytics?.plansDistribution?.enterprise || 0) / (analytics?.totalSchools || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <button
              type="button"
              onClick={onAddSchoolClick}
              className="mt-6 w-full flex items-center justify-center gap-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" /> Provision Multi-Tenant Node
            </button>
          </div>
        </div>

        {/* TENANT TABLE LIST LISTING */}
        <div className="glass-panel rounded-xl p-5 shadow-lg md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-slate-100 text-sm">Provisioned Tenant School Nodes</h3>
            <span className="text-[10px] bg-white/10 border border-white/5 text-slate-300 font-semibold px-2 py-0.5 rounded-full font-mono uppercase">
              Isolated Mongo Engine
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-transparent">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider bg-white/5">
                  <th className="p-3">School Name</th>
                  <th className="p-3">Workspace URI</th>
                  <th className="p-3">SaaS Tier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Adjust Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics?.schoolsList?.map((s: School) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                      {s.logoUrl ? (
                        <img src={s.logoUrl} className="w-6 h-6 rounded-md object-cover border border-white/10" />
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-slate-950/40 border border-white/10 flex items-center justify-center font-bold text-[10px] text-slate-300">
                          {s.name[0]}
                        </div>
                      )}
                      <span>{s.name}</span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono font-medium">
                      {s.subdomain}.edusphere.net
                    </td>
                    <td className="p-3 uppercase text-xs">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        s.subscription.plan === 'enterprise' ? 'bg-amber-500/15 text-amber-305 border border-amber-500/20' :
                        s.subscription.plan === 'growth' ? 'bg-indigo-500/15 text-indigo-305 border border-indigo-500/20' :
                        'bg-slate-550/15 text-slate-305 border border-white/10'
                      }`}>
                        {s.subscription?.plan?.replace('_', ' ') || 'Free'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                        s.subscription?.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                      }`}></span>
                      <span className="font-medium text-slate-300">{s.subscription?.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedSchool(s)}
                        className="px-2.5 py-1 border border-white/15 hover:border-white/25 text-slate-200 hover:bg-white/5 rounded font-semibold text-[10px] transition-colors"
                      >
                        Upgrade Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PLAN BILLING UPGRADE MODAL DRAWER */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full border border-white/15 shadow-2xl p-6 relative text-slate-200">
            <h3 className="font-display font-bold text-white text-base mb-1">Upgrade SaaS Subscription Plan</h3>
            <p className="text-slate-400 text-xs mb-4">You are mutating billing state metrics for <span className="font-semibold text-slate-200">{selectedSchool.name}</span>.</p>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleUpdateSubscription(selectedSchool.id, 'free_trial')}
                className={`w-full p-3.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
                  selectedSchool.subscription.plan === 'free_trial' ? 'border-sky-500 bg-sky-500/10' : 'border-white/5 hover:bg-white/5 bg-slate-950/20'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-white">Free Trial Plan</h4>
                  <p className="text-[10px] text-slate-400">Up to 150 students, default modules. $0.00 / month.</p>
                </div>
                {selectedSchool.subscription.plan === 'free_trial' && <Check className="w-4 h-4 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleUpdateSubscription(selectedSchool.id, 'growth')}
                className={`w-full p-3.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
                  selectedSchool.subscription.plan === 'growth' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:bg-white/5 bg-slate-950/20'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-white">Growth Plan</h4>
                  <p className="text-[10px] text-slate-400">Up to 800 students, detailed exams. $149.00 / month.</p>
                </div>
                {selectedSchool.subscription.plan === 'growth' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleUpdateSubscription(selectedSchool.id, 'enterprise')}
                className={`w-full p-3.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
                  selectedSchool.subscription.plan === 'enterprise' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 hover:bg-white/5 bg-slate-950/20'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs text-white">Enterprise SLA</h4>
                  <p className="text-[10px] text-slate-400">Unlimited students and storage, SLA support. $399.00 / month.</p>
                </div>
                {selectedSchool.subscription.plan === 'enterprise' && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-1.5 border border-white/10 text-slate-300 text-xs font-semibold rounded hover:bg-white/5"
                disabled={upgrading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white text-xs font-semibold rounded shadow-lg shadow-indigo-600/20"
                disabled={upgrading}
              >
                {upgrading ? 'Processing with Stripe...' : 'Simulate Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
