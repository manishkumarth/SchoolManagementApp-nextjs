import React, { useState } from 'react';

interface OnboardingWizardProps {
  onSuccess: (school: any, user: any) => void;
  onCancel: () => void;
}

export default function OnboardingWizard({ onSuccess, onCancel }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1 && (!schoolName || !subdomain)) {
      setError('Please fill in the School Name and Subdomain.');
      return;
    }
    if (step === 2 && (!email || !name)) {
      setError('Please provide your name and owner administrator email.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !schoolName || !subdomain) {
      setError('All metadata fields are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          subdomain: subdomain.trim().toLowerCase(),
          email: email.trim(),
          name,
          address,
          phone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      onSuccess(data.school, data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during register process.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden transition-all duration-300">
      {/* Wizard Header Progress Bar */}
      <div className="bg-slate-900 px-6 py-5 text-white">
        <h2 className="font-display text-xl font-bold">Register Your Educational Hub</h2>
        <p className="text-xs text-slate-300 mt-1">Setup your dedicated multi-tenant EduSphere node in moments</p>
        <div className="flex items-center gap-2 mt-4">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-sky-400' : 'bg-slate-700'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-sky-400' : 'bg-slate-700'}`}></div>
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-sky-400' : 'bg-slate-700'}`}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* STEP 1: SCHOOL BRAND AND DOMAIN */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm uppercase tracking-wider">Step 1: School Profile</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School / Academy Name*</label>
              <input
                type="text"
                placeholder="e.g. St. Xavier International Academy"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Workspace Subdomain*</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="xavier-academy"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  className="flex-1 text-sm border border-slate-200 border-r-0 rounded-l-lg p-2.5 outline-none focus:border-sky-500 transition-colors"
                  required
                />
                <span className="bg-slate-50 text-slate-500 text-xs font-mono font-medium px-3 border border-slate-200 rounded-r-lg flex items-center">
                  .edusphere.net
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Only alphanumeric values and hyphens allowed.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 902-1249"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academy Physical Address</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ASSIGN ADMINISTRATOR OWNER ACCOUNT */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm uppercase tracking-wider">Step 2: Admin Security</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name of School Admin*</label>
              <input
                type="text"
                placeholder="e.g. Dean Sarah Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Administrator Email*</label>
              <input
                type="email"
                placeholder="sarah.vance@xavier.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 outline-none focus:border-sky-500 transition-colors"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">This email address will serve as your tenant administrator login credentials.</p>
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SAAS PLAN PREFERENCE AND SELECTION */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm uppercase tracking-wider">Step 3: SaaS Tier Selection</h3>

            <div className="border border-sky-100 bg-sky-50/50 rounded-xl p-4 flex gap-3 items-start">
              <div className="bg-sky-500 text-white text-xs font-bold leading-none py-1 px-2.5 rounded-full mt-0.5">Trial</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-xs">30-Days Free Sandbox Sandbox</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Enjoy full isolated multi-tenant capabilities, up to 150 student profiles, exam boards, attendance rosters, and notices entirely free. No card requested.</p>
                <div className="text-slate-900 text-xs font-bold font-mono mt-1">$0.00 / Month</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 select-none">By processing registration, you acknowledge that EduSphere will generate a dedicated isolation container on MongoDB database rules configured for tenant isolation security guidelines.</p>

            <div className="flex justify-between gap-2 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 text-white hover:bg-sky-500 rounded-lg text-xs font-semibold transition-all disabled:bg-slate-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Provisioning Container...' : 'Register and Launch Applet'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
