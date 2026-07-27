import React, { useState } from 'react';
import { Staff, CompanyDetails } from '../types';
import { 
  Sparkles, 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  staff: Staff[];
  company: CompanyDetails;
  onLogin: (user: { id: string; name: string; role: string }) => void;
}

export function getUserPassword(userId: string): string {
  try {
    const saved = localStorage.getItem('spaflow_user_passwords_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[userId]) {
        return parsed[userId];
      }
    }
  } catch (e) {
    console.error('Failed to load user password', e);
  }
  return '12345'; // Default password requested by user
}

export function setUserPassword(userId: string, newPass: string): void {
  try {
    const saved = localStorage.getItem('spaflow_user_passwords_v1');
    const passwords = saved ? JSON.parse(saved) : {};
    passwords[userId] = newPass;
    localStorage.setItem('spaflow_user_passwords_v1', JSON.stringify(passwords));
  } catch (e) {
    console.error('Failed to save user password', e);
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({
  staff,
  company,
  onLogin,
}) => {
  // Build user options: Admin + Staff
  const adminUser = {
    id: 'admin-owner',
    name: 'System Admin / Owner',
    role: 'Administrator',
  };

  const staffUsers = staff.map((st) => ({
    id: st.id,
    name: st.name,
    role: st.role || 'Therapist & Staff',
  }));

  const allUsers = [adminUser, ...staffUsers];

  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0].id);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedUser = allUsers.find((u) => u.id === selectedUserId) || allUsers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const currentPass = getUserPassword(selectedUser.id);

    if (password === currentPass) {
      onLogin({
        id: selectedUser.id,
        name: selectedUser.name,
        role: selectedUser.role,
      });
    } else {
      setErrorMsg(`Incorrect password for ${selectedUser.name}. (Default password is 12345)`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Soft Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-md shadow-teal-600/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {company.businessName || 'Kyla Barber Shop'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Point of Sale & Management Portal
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Select Username / Staff */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Select Account Username</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
              id="login-username-select"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Password</span>
              </label>
              <span className="text-[10px] text-teal-700 font-bold font-mono bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                Default: 12345
              </span>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                id="login-password-input"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center space-x-2 mt-2"
            id="login-submit-btn"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to System</span>
          </button>

        </form>

        {/* Security Note */}
        <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Default password is <strong className="text-slate-800">12345</strong>. You can change your password anytime after login.</span>
        </div>

      </div>
    </div>
  );
};
