import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword, getErrorMessage } from '../api';
import { validateChangePassword } from '../utils/validate';
import toast from 'react-hot-toast';
import { Key, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validationErrors = validateChangePassword({
    password,
    newPassword,
    confirmPassword,
  });
  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateChangePassword({
      password,
      newPassword,
      confirmPassword,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await changePassword({
        password,
        newPassword,
      });
      toast.success('Password updated successfully! Please sign in again.');
      logout();
      navigate('/auth');
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      setErrors({ api: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm transition">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              Change Password
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep your account secure by using a strong password.
            </p>
          </div>
        </div>

        {errors.api && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errors.api}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Current password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Enter current password"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${
                  errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                } rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              New password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                placeholder="Enter new password"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${
                  errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                } rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 transition`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                At least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Re-enter new password"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                } rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 transition`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
