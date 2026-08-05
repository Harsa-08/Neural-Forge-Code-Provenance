import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { UserCheck, Lock, Mail, Phone, Calendar, MapPin, Building, User as UserIcon, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { PhoneInput } from './PhoneInput';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    dob: '',
    city: '',
    institution: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both Email Address and Password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to backend server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.username || !regData.email || !regData.password) {
      setErrorMsg('Username, Email and Password are required.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.register(regData);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMsg('Error creating account. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick login
  const handleQuickDemoLogin = async (email: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(email, 'password123');
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMsg('Demo account login error.');
      }
    } catch {
      setErrorMsg('Failed to sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-[#622569] via-[#4a1b50] to-[#2b0f30] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 transition-colors duration-200">
        
        {/* Auth Header */}
        <div className="bg-gradient-to-r from-[#622569] to-[#9b51e0] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 mx-auto mb-3 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-purple-200" />
          </div>
          <h2 className="text-2xl font-bold font-['Poppins'] tracking-tight">IET CONNECT PORTAL</h2>
          <p className="text-xs text-purple-100/90 mt-1">Empowering Engineers & Technology Innovators Worldwide</p>

          {/* Toggle Pills */}
          <div className="mt-6 inline-flex bg-black/20 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => { setIsLoginView(true); setErrorMsg(null); }}
              className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all ${
                isLoginView ? 'bg-white text-[#622569] shadow-md' : 'text-purple-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginView(false); setErrorMsg(null); }}
              className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all ${
                !isLoginView ? 'bg-white text-[#622569] shadow-md' : 'text-purple-100 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoginView ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#9b51e0] dark:focus:border-purple-400 focus:ring-2 focus:ring-[#9b51e0]/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-[#9b51e0] dark:focus:border-purple-400 focus:ring-2 focus:ring-[#9b51e0]/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#622569] hover:bg-[#9b51e0] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Authenticating...' : 'Access Portal'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Demo Accounts Box */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium mb-3">Quick Demo Login (Pre-configured Users)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('venkatns2008@gmail.com')}
                    className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-[#622569] text-xs font-medium rounded-xl border border-purple-200 transition-colors"
                  >
                    Login as Chapter Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('sarah.chen@iet.org')}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
                  >
                    Login as Student Member
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={regData.username}
                      onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <PhoneInput
                    value={regData.phone}
                    onChange={(fullNumber, isValid) => {
                      setRegData({ ...regData, phone: fullNumber });
                      setIsPhoneValid(isValid);
                    }}
                    required={false}
                    label="Phone Number"
                    id="reg-phone-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={regData.gender}
                    onChange={(e) => setRegData({ ...regData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      value={regData.dob}
                      onChange={(e) => setRegData({ ...regData, dob: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regData.city}
                      onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                      placeholder="Chennai"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institution / Campus</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regData.institution}
                      onChange={(e) => setRegData({ ...regData, institution: e.target.value })}
                      placeholder="SRM / RVCE / Anna Univ"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#9b51e0] outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#622569] hover:bg-[#9b51e0] text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Creating Member Record...' : 'Register Account'}
                {!loading && <UserCheck className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
