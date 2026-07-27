import React, { useState } from 'react';
import { getUserPassword, setUserPassword } from './LoginPage';
import { KeyRound, X, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

interface ChangePasswordModalProps {
  currentUser: { id: string; name: string; role: string };
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const actualCurrentPass = getUserPassword(currentUser.id);

    if (currentPassword !== actualCurrentPass) {
      setErrorMsg('Current password is incorrect.');
      return;
    }

    if (!newPassword || newPassword.trim().length < 3) {
      setErrorMsg('New password must be at least 3 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    // Save password
    setUserPassword(currentUser.id, newPassword.trim());
    setSuccessMsg('Password updated successfully!');

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Change Account Password
            </h3>
            <p className="text-xs text-slate-400">
              User: <strong className="text-slate-700 dark:text-slate-200">{currentUser.name}</strong> ({currentUser.role})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password..."
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600"
              id="change-pass-current"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600"
              id="change-pass-new"
              required
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600"
              id="change-pass-confirm"
              required
            />
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </p>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md"
              id="change-pass-submit"
            >
              Save New Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
