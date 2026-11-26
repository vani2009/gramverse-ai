import React, { useState } from 'react';
import { UserRole, AuthSession } from '../../types';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../services/translationService';
import {
  Building2,
  Landmark,
  User,
  ClipboardList,
  Lock,
  Mail,
  Key,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: AuthSession) => void;
  defaultRole?: UserRole;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  defaultRole = 'panchayat'
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { language, setLanguage, languageOptions, t } = useLanguage();
  const villages = storageService.getVillages();

  // 1. Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // 2. Panchayat Form State
  const [panchId, setPanchId] = useState('');
  const [panchayatVillageId, setPanchayatVillageId] = useState(villages[0]?.id || 'vil_kothri');
  const [panchayatPassword, setPanchayatPassword] = useState('');

  // 3. Citizen Form State
  const [citizenVillage, setCitizenVillage] = useState(villages[0]?.name || 'Kothri Kalan');
  const [citizenName, setCitizenName] = useState('');
  const [citizenAadhaar, setCitizenAadhaar] = useState('');

  // 4. Survey Form State
  const [surveyEmpId, setSurveyEmpId] = useState('');
  const [surveyPassword, setSurveyPassword] = useState('');

  // Auto demo autofills
  const fillAdminDemo = () => {
    setAdminEmail('admin.district@gramverse.gov.in');
    setAdminPassword('admin123');
    setErrorMessage(null);
  };

  const fillPanchayatDemo = () => {
    setPanchId('PANCH-MP-001');
    setPanchayatVillageId('vil_kothri');
    setPanchayatPassword('panchayat123');
    setErrorMessage(null);
  };

  const fillCitizenDemo = () => {
    setCitizenVillage('Kothri Kalan');
    setCitizenName('Rameshwar Lal Gurjar');
    setCitizenAadhaar('9823-4512-7890');
    setErrorMessage(null);
  };

  const fillSurveyDemo = () => {
    setSurveyEmpId('SURV-MP-8821');
    setSurveyPassword('survey123');
    setErrorMessage(null);
  };

  // Handle Form Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (activeRole === 'admin') {
        if (!adminEmail.trim()) {
          setErrorMessage('Please enter your District / Block Admin Email ID.');
          return;
        }
        if (!adminPassword.trim()) {
          setErrorMessage('Please enter your administrator password.');
          return;
        }
        const session = storageService.loginAdmin(adminEmail);
        onLoginSuccess(session);
      } else if (activeRole === 'panchayat') {
        if (!panchId.trim()) {
          setErrorMessage('Please enter your Unique Panch ID (e.g. PANCH-MP-001).');
          return;
        }
        if (!panchayatPassword.trim()) {
          setErrorMessage('Please enter your Panchayat portal password.');
          return;
        }
        const session = storageService.loginPanchayat(panchId, panchayatVillageId);
        onLoginSuccess(session);
      } else if (activeRole === 'citizen') {
        if (!citizenName.trim()) {
          setErrorMessage('Please enter the citizen full name.');
          return;
        }
        const cleanAadhaar = citizenAadhaar.replace(/\D/g, '');
        if (cleanAadhaar.length > 0 && cleanAadhaar.length !== 12) {
          setErrorMessage('Aadhaar number must contain exactly 12 digits (e.g. 9823-4512-7890).');
          return;
        }
        const session = storageService.loginCitizen(citizenVillage, citizenName, citizenAadhaar);
        onLoginSuccess(session);
      } else if (activeRole === 'survey') {
        if (!surveyEmpId.trim()) {
          setErrorMessage('Please enter your Surveyor Employee ID (e.g. SURV-MP-8821).');
          return;
        }
        if (!surveyPassword.trim()) {
          setErrorMessage('Please enter your field surveyor password.');
          return;
        }
        const session = storageService.loginSurvey(surveyEmpId);
        onLoginSuccess(session);
      }
    } catch {
      setErrorMessage('Authentication failed. Please verify your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header Row with Logo & Language Switcher */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="GramVerse AI Logo"
            className="h-12 sm:h-14 w-auto rounded-xl object-contain shadow-lg border border-slate-700 bg-[#17232b] p-1.5"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                GRAMVERSE AI
              </span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gov Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Digital Gram Swaraj & Role-Based Rural Governance Platform
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 shadow-md">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent text-slate-200 text-xs font-semibold outline-none cursor-pointer"
            title="Choose Indian Language (भाषा चुनें)"
          >
            {languageOptions.map(opt => (
              <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
                {opt.nativeName} ({opt.name})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="max-w-4xl w-full mx-auto my-6 sm:my-8 bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Portal Greeting Banner */}
        <div className="bg-gradient-to-r from-emerald-900/80 via-slate-800/90 to-indigo-900/80 p-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Authentication Gateway
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Select Your Access Portal
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Secure role-based login for District Administration, Gram Panchayats, Citizens, and Field Surveyors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>256-Bit Encrypted Session</span>
          </div>
        </div>

        {/* 4 Role Switcher Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl transition ${
              activeRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>District Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('panchayat');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl transition ${
              activeRole === 'panchayat'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Gram Panchayat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('citizen');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl transition ${
              activeRole === 'citizen'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen Jan Seva</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('survey');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl transition ${
              activeRole === 'survey'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Field Surveyor</span>
          </button>
        </div>

        {/* Dynamic Role Form Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* 1. ADMIN FORM */}
            {activeRole === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    District & Block Administration Credentials
                  </div>
                  <button
                    type="button"
                    onClick={fillAdminDemo}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Fill
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Official Email ID <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="e.g. admin.district@gramverse.gov.in"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Admin Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Default Demo: <code className="text-indigo-300">admin.district@gramverse.gov.in</code> / Password: <code className="text-indigo-300">admin123</code>
                </div>
              </div>
            )}

            {/* 2. PANCHAYAT FORM */}
            {activeRole === 'panchayat' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Gram Panchayat Official Credentials
                  </div>
                  <button
                    type="button"
                    onClick={fillPanchayatDemo}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Fill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Unique Panch ID <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={panchId}
                        onChange={e => setPanchId(e.target.value)}
                        placeholder="e.g. PANCH-MP-001"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Village Gram Panchayat <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <select
                        value={panchayatVillageId}
                        onChange={e => setPanchayatVillageId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                      >
                        {villages.map(v => (
                          <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                            {v.name} GP ({v.block} Block)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Panchayat Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={panchayatPassword}
                      onChange={e => setPanchayatPassword(e.target.value)}
                      placeholder="Enter Panchayat portal password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Default Demo: Panch ID: <code className="text-emerald-300">PANCH-MP-001</code> / Village: <code className="text-emerald-300">Kothri Kalan</code> / Password: <code className="text-emerald-300">panchayat123</code>
                </div>
              </div>
            )}

            {/* 3. CITIZEN FORM */}
            {activeRole === 'citizen' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Citizen Jan Seva Login Credentials
                  </div>
                  <button
                    type="button"
                    onClick={fillCitizenDemo}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Fill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Village Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <select
                        value={citizenVillage}
                        onChange={e => setCitizenVillage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 transition cursor-pointer"
                      >
                        {villages.map(v => (
                          <option key={v.id} value={v.name} className="bg-slate-900 text-white">
                            {v.name} ({v.block} Block)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Name of Citizen <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={e => setCitizenName(e.target.value)}
                        placeholder="e.g. Rameshwar Lal Gurjar"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Aadhaar Number of Citizen (12 Digits) <span className="text-slate-400">(Optional for Demo)</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      maxLength={14}
                      value={citizenAadhaar}
                      onChange={e => {
                        const val = e.target.value.replace(/[^\d-]/g, '');
                        setCitizenAadhaar(val);
                      }}
                      placeholder="e.g. 9823-4512-7890"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 tracking-wider transition"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Direct Citizen Seva access for lodging complaints, checking grievance status, tracking JJM water pipeline, and GramBot AI assistance.
                </div>
              </div>
            )}

            {/* 4. SURVEYOR FORM */}
            {activeRole === 'survey' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Field Data Collector Credentials
                  </div>
                  <button
                    type="button"
                    onClick={fillSurveyDemo}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Fill
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Employee ID <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <ClipboardList className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={surveyEmpId}
                      onChange={e => setSurveyEmpId(e.target.value)}
                      placeholder="e.g. SURV-MP-8821"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Surveyor Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={surveyPassword}
                      onChange={e => setSurveyPassword(e.target.value)}
                      placeholder="Enter field surveyor password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <span className="text-amber-300 font-semibold">Note:</span> Once logged in, surveyors can select and switch between assigned villages right inside the Survey Dashboard!
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50'
                    : activeRole === 'panchayat'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                    : activeRole === 'citizen'
                    ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/50'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/50'
                }`}
              >
                <span>
                  {activeRole === 'admin' && 'Sign In to District Administration Portal'}
                  {activeRole === 'panchayat' && 'Sign In to Gram Panchayat Portal'}
                  {activeRole === 'citizen' && 'Access Citizen Jan Seva Portal'}
                  {activeRole === 'survey' && 'Sign In to Field Surveyor PWA'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Card Footer Security Trust Badges */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> NIC Standard Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Aadhaar Data Vault Ready
            </span>
          </div>

          <div className="text-slate-500">
            GramVerse AI • Sehore District Implementation
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center text-xs text-slate-500 py-2">
        GramVerse AI Rural Governance Platform • Designed for Panchayat Raj & District Administration
      </footer>
    </div>
  );
};
