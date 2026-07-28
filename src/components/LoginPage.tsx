import React, { useState } from 'react';
import { Staff, CompanyDetails } from '../types';
import { 
  Sparkles, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck,
  Check,
  Search
} from 'lucide-react';

import { getUserPasswords, saveUserPassword } from '../lib/storage';

interface LoginPageProps {
  staff: Staff[];
  company: CompanyDetails;
  onLogin: (user: { id: string; name: string; role: string }) => void;
}

export function getUserPassword(userId: string): string {
  const passwords = getUserPasswords();
  return passwords[userId] || '12345'; // Default password requested by user
}

export function setUserPassword(userId: string, newPass: string): void {
  saveUserPassword(userId, newPass);
}

export const LoginPage: React.FC<LoginPageProps> = ({
  staff,
  company,
  onLogin,
}) => {
  // Build user options: Admin + Staff with deduplication
  const adminUser = {
    id: 'admin-owner',
    name: 'System Admin / Owner',
    role: 'Administrator',
  };

  const staffUsers = staff.map((st) => {
    const isStAdmin = Boolean(st.isAdmin || st.role?.toLowerCase().includes('admin'));
    return {
      id: st.id,
      name: st.name,
      role: isStAdmin 
        ? (st.role?.toLowerCase().includes('admin') ? st.role : `Administrator (${st.role})`) 
        : (st.role || 'Therapist & Staff'),
    };
  });

  const rawUsers = [adminUser, ...staffUsers];
  const seenUserKeys = new Set<string>();
  const allUsers: Array<{ id: string; name: string; role: string }> = [];

  for (const user of rawUsers) {
    if (!user || !user.name) continue;
    const norm = user.name.trim().toLowerCase();
    const isAdminVariant = norm === 'system admin' || norm === 'system admin / owner' || norm === 'admin' || norm === 'administrator';
    const key = isAdminVariant ? 'system admin' : norm;

    if (!seenUserKeys.has(key)) {
      seenUserKeys.add(key);
      allUsers.push(user);
    }
  }

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0].id);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(userSearchQuery.trim().toLowerCase()) ||
    u.role.toLowerCase().includes(userSearchQuery.trim().toLowerCase())
  );

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white relative overflow-y-auto">
      
      {/* Background Decorative Soft Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full my-auto bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xl relative z-10 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-600/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {company.businessName || 'Kyla Barber Shop'}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Point of Sale & Management Portal
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Scrollable Compact User Selection List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Account</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {filteredUsers.length} account{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Type to search username..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
                id="login-username-search-input"
              />
              {userSearchQuery && (
                <button
                  type="button"
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5"
                >
                  ×
                </button>
              )}
            </div>

            <div 
              className="max-h-64 sm:max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-1.5 space-y-1 shadow-inner"
              id="login-username-scroll-list"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setErrorMsg('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 bg-white border border-slate-100'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate font-bold text-xs">{u.name}</span>
                        <span className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {u.role}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-3 text-center text-xs text-slate-400 font-medium">
                  No accounts found matching "{userSearchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Password</span>
              </label>
              <span className="text-[10px] text-blue-700 font-bold font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
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
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
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
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center space-x-2 mt-1"
            id="login-submit-btn"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to System</span>
          </button>

        </form>

        {/* Security Note */}
        <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Default password is <strong className="text-slate-800">12345</strong>.</span>
        </div>

      </div>
    </div>
  );
};
