import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, signupUser, getErrorMessage } from '../api';
import { validateSignup, validateLogin, validateField } from '../utils/validate';
import Field from '../components/Field';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

export default function Auth() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    rePassword: '',
    dateOfBirth: '',
    gender: 'male',
  });

  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const errorMsg = validateField(name, formData, isLogin);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = isLogin
      ? validateLogin(formData)
      : validateSignup(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email.trim(),
          password: formData.password,
        });
        const token = res.data?.token || res.token;
        const user = res.data?.user || res.user;
        login(token, user);
        toast.success('Welcome back to Route Posts!');
        navigate('/feed');
      } else {
        // Strip leading '@' or extra spaces before sending username to the API
        const cleanUsername = formData.username.replace(/^@/, '').trim();

        const res = await signupUser({
          name: formData.name.trim(),
          username: cleanUsername,
          email: formData.email.trim(),
          password: formData.password,
          rePassword: formData.rePassword,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        });
        const token = res.data?.token || res.token;
        const user = res.data?.user || res.user;
        login(token, user);
        toast.success('Account created successfully!');
        navigate('/feed');
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      const lowerMsg = msg.toLowerCase();

      if (lowerMsg.includes('email')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (lowerMsg.includes('username')) {
        setErrors((prev) => ({ ...prev, username: msg }));
      } else if (lowerMsg.includes('password')) {
        setErrors((prev) => ({ ...prev, password: msg }));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (hasError) =>
    `w-full py-2.5 bg-slate-50 border rounded-xl text-sm transition outline-none ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    }`;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <img
          src="./route-logo.png"
          alt="Route Logo"
          className="w-11 h-11 rounded-2xl object-contain shadow-md border border-blue-900/10"
        />
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Route Posts</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 transition-all">
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrors({});
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrors({});
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isLogin ? 'Welcome back' : 'Join Route Posts today'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isLogin
              ? 'Enter your credentials to access your feed'
              : 'Connect with peers, share knowledge, and explore posts'}
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Field label="Full Name" error={errors.name}>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Mohamed Talat"
                    className={`${getInputClasses(Boolean(errors.name))} pl-10 pr-4`}
                  />
                </div>
              </Field>

              <Field label="Username" error={errors.username}>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="username"
                    className={`${getInputClasses(Boolean(errors.username))} pl-8 pr-4`}
                  />
                </div>
              </Field>
            </>
          )}

          <Field label="Email Address" error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="name@example.com"
                className={`${getInputClasses(Boolean(errors.email))} pl-10 pr-4`}
              />
            </div>
          </Field>

          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`${getInputClasses(Boolean(errors.password))} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          {!isLogin && (
            <>
              <Field label="Confirm Password" error={errors.rePassword}>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showRePassword ? 'text' : 'password'}
                    name="rePassword"
                    value={formData.rePassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`${getInputClasses(Boolean(errors.rePassword))} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showRePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Date of Birth" error={errors.dateOfBirth}>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${getInputClasses(Boolean(errors.dateOfBirth))} px-3`}
                  />
                </Field>

                <Field label="Gender" error={errors.gender}>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${getInputClasses(Boolean(errors.gender))} px-3 cursor-pointer`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-400 mt-8 text-center">
        Route Academy &bull; Linked Posts Social Playground
      </p>
    </div>
  );
}
