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
  EyeOff,
  X,
  Layers,
  Bot,
  FileText
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
  const [showAboutModal, setShowAboutModal] = useState(false);
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

  // 1-Click demo autofill helpers
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

  // Form submission handler
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-4 px-3 sm:px-6 text-slate-800">
      {/* Top Header Bar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-3 border-b border-slate-200">
        <div
          onClick={() => setShowAboutModal(true)}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to view interactive GramVerse AI Guide & System Architecture"
        >
          <img
            src="/logo.jpg"
            alt="GramVerse AI Logo"
            className="h-12 sm:h-14 w-auto rounded-xl object-contain shadow-xs border border-slate-300 bg-[#17232b] p-1.5 shrink-0 group-hover:scale-105 group-hover:border-emerald-500 group-hover:shadow-md transition-all duration-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-emerald-700 transition">
                GRAMVERSE AI
              </span>
              <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                GOV CLOUD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-1">
              <span>Digital Gram Swaraj & Rural Governance</span>
              <span className="text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5 ml-1">
                • Explore AI ↗
              </span>
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent text-slate-700 text-xs font-semibold outline-hidden cursor-pointer"
            title="Choose Indian Language (भाषा चुनें)"
          >
            {languageOptions.map(opt => (
              <option key={opt.code} value={opt.code}>
                {opt.nativeName} ({opt.name})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Interactive Hero Brand Badge with Big Logo */}
      <div className="max-w-2xl w-full mx-auto my-2.5 sm:my-3 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAboutModal(true)}
          className="group relative inline-flex items-center gap-3 sm:gap-4 bg-white hover:bg-emerald-50/40 border-2 border-emerald-400/90 hover:border-emerald-500 rounded-2xl p-2.5 sm:p-3 shadow-md hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-left w-full"
          title="Click to open interactive GramVerse AI system architecture & demo features"
        >
          {/* Shimmering Aura on Hover */}
          <span className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 rounded-2xl blur-xs opacity-20 group-hover:opacity-60 transition duration-300 pointer-events-none" />

          {/* Big Interactive Logo */}
          <div className="relative shrink-0">
            <img
              src="/logo.jpg"
              alt="GramVerse AI Logo"
              className="h-16 sm:h-20 w-auto rounded-xl object-contain shadow-xs border border-slate-700 bg-[#17232b] p-1.5 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-xs">
              AI v1.0
            </span>
          </div>

          <div className="relative pr-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-base sm:text-xl tracking-tight leading-none group-hover:text-emerald-700 transition">
                GRAMVERSE AI
              </span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Official Gateway
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Role-Based Village Governance & Indian Language Voice AI
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
              <span className="group-hover:underline">Interactive System Guide • Click to Explore Modules & Architecture ↗</span>
            </div>
          </div>
        </button>
      </div>

      {/* Main Login Card - Compact & Light */}
      <main className="max-w-2xl w-full mx-auto my-auto bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/70 overflow-hidden">
        {/* Compact Card Header */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Authentication Gateway</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
              Select Your Access Portal
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* 4-Role Segmented Selector Tabs */}
        <div className="p-2.5 bg-slate-100/70 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition text-xs ${
                activeRole === 'admin'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>District Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('panchayat');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition text-xs ${
                activeRole === 'panchayat'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Gram Panchayat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('citizen');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition text-xs ${
                activeRole === 'citizen'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Seva</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('survey');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition text-xs ${
                activeRole === 'survey'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Field Surveyor</span>
            </button>
          </div>
        </div>

        {/* Dynamic Form Body - Compact & Light */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* 1. ADMIN FORM */}
            {activeRole === 'admin' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">
                    District & Block Administration Credentials
                  </span>
                  <button
                    type="button"
                    onClick={fillAdminDemo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md transition"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" /> 1-Click Demo Fill
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="e.g. admin.district@gramverse.gov.in"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Demo: <code className="text-indigo-700 font-semibold">admin.district@gramverse.gov.in</code></span>
                  <span>Pass: <code className="text-indigo-700 font-semibold">admin123</code></span>
                </div>
              </div>
            )}

            {/* 2. PANCHAYAT FORM */}
            {activeRole === 'panchayat' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                    Gram Panchayat Official Credentials
                  </span>
                  <button
                    type="button"
                    onClick={fillPanchayatDemo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" /> 1-Click Demo Fill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unique Panch ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={panchId}
                        onChange={e => setPanchId(e.target.value)}
                        placeholder="e.g. PANCH-MP-001"
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Village Gram Panchayat <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={panchayatVillageId}
                        onChange={e => setPanchayatVillageId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition cursor-pointer"
                      >
                        {villages.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} GP ({v.block} Block)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Panchayat Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={panchayatPassword}
                      onChange={e => setPanchayatPassword(e.target.value)}
                      placeholder="Enter Panchayat portal password"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Panch ID: <code className="text-emerald-700 font-semibold">PANCH-MP-001</code></span>
                  <span>Pass: <code className="text-emerald-700 font-semibold">panchayat123</code></span>
                </div>
              </div>
            )}

            {/* 3. CITIZEN FORM */}
            {activeRole === 'citizen' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wide">
                    Citizen Jan Seva Login Credentials
                  </span>
                  <button
                    type="button"
                    onClick={fillCitizenDemo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-md transition"
                  >
                    <Sparkles className="w-3 h-3 text-sky-600" /> 1-Click Demo Fill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Village Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={citizenVillage}
                        onChange={e => setCitizenVillage(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition cursor-pointer"
                      >
                        {villages.map(v => (
                          <option key={v.id} value={v.name}>
                            {v.name} ({v.block} Block)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Name of Citizen <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={citizenName}
                        onChange={e => setCitizenName(e.target.value)}
                        placeholder="e.g. Rameshwar Lal Gurjar"
                        className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aadhaar Number of Citizen (12 Digits) <span className="text-slate-400 font-normal">(Optional for Demo)</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      maxLength={14}
                      value={citizenAadhaar}
                      onChange={e => {
                        const val = e.target.value.replace(/[^\d-]/g, '');
                        setCitizenAadhaar(val);
                      }}
                      placeholder="e.g. 9823-4512-7890"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600 tracking-wider transition"
                    />
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Village: <strong className="text-slate-800">{citizenVillage}</strong></span>
                  <span>Direct Citizen Seva & Grievance Lodging</span>
                </div>
              </div>
            )}

            {/* 4. SURVEYOR FORM */}
            {activeRole === 'survey' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                    Field Data Collector Credentials
                  </span>
                  <button
                    type="button"
                    onClick={fillSurveyDemo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" /> 1-Click Demo Fill
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ClipboardList className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={surveyEmpId}
                      onChange={e => setSurveyEmpId(e.target.value)}
                      placeholder="e.g. SURV-MP-8821"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Surveyor Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={surveyPassword}
                      onChange={e => setSurveyPassword(e.target.value)}
                      placeholder="Enter field surveyor password"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Emp ID: <code className="text-amber-700 font-semibold">SURV-MP-8821</code></span>
                  <span>Pass: <code className="text-amber-700 font-semibold">survey123</code></span>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    : activeRole === 'panchayat'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    : activeRole === 'citizen'
                    ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                }`}
              >
                <span>
                  {activeRole === 'admin' && 'Sign In to District Administration Portal'}
                  {activeRole === 'panchayat' && 'Sign In to Gram Panchayat Portal'}
                  {activeRole === 'citizen' && 'Access Citizen Jan Seva Portal'}
                  {activeRole === 'survey' && 'Sign In to Field Surveyor PWA'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Compact Trust Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium text-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> NIC Verified
            </span>
            <span className="flex items-center gap-1 font-medium text-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aadhaar Vault Ready
            </span>
          </div>
          <div>GramVerse AI • Sehore District Implementation</div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-2">
        GramVerse AI • Digital Gram Swaraj & Rural Governance Platform
      </footer>

      {/* Interactive GramVerse AI System Guide & Architecture Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header with Big Brand Logo */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-start justify-between gap-4 relative">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src="/logo.jpg"
                    alt="GramVerse AI Logo"
                    className="h-20 sm:h-24 w-auto rounded-2xl object-contain shadow-lg border-2 border-emerald-400/80 bg-[#17232b] p-2"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    LIVE
                  </span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 mb-1.5">
                    <Sparkles className="w-3 h-3" /> System Architecture Guide
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">
                    GramVerse AI Platform
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Role-Based Village Governance & AI Cloud for Rural India
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
              {/* Core Mission */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-emerald-950">
                <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-900 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  National Digital Gram Swaraj Vision
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900/90">
                  GramVerse AI bridges the gap between citizens, elected Panchayat representatives, and district administration using spatial PostGIS intelligence, multilingual AI voice guidance, and automated GPDP development planning.
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Four Interconnected Governance Portals
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-indigo-700">
                      <Building2 className="w-4 h-4" /> District Admin Portal
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Multi-village comparison charts, block telemetry, 15th Finance Commission fund utilization, and official PDF Dossier downloads.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-emerald-700">
                      <Landmark className="w-4 h-4" /> Gram Panchayat Portal
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Village GIS problem map, official Notice Board broadcasting to citizens, household registry, and GPDP development planner.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-sky-700">
                      <User className="w-4 h-4" /> Citizen Jan Seva
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Multilingual grievance lodging, voice AI assistance, real-time complaint status tracking, and central welfare scheme matcher.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-amber-700">
                      <ClipboardList className="w-4 h-4" /> Field Surveyor PWA
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Mobile-first offline data collection with GPS asset geotagging, tap water telemetry, and automatic sync queue.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1-Click Launch Directly from Modal */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ⚡ Quick Demo Launch (Supervisor Presentation)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAboutModal(false);
                      const session = storageService.loginAdmin('admin.district@gramverse.gov.in');
                      onLoginSuccess(session);
                    }}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-[11px] flex flex-col items-center gap-1 transition"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAboutModal(false);
                      const session = storageService.loginPanchayat('PANCH-MP-001', 'vil_kothri');
                      onLoginSuccess(session);
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex flex-col items-center gap-1 transition"
                  >
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <span>Panchayat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAboutModal(false);
                      const session = storageService.loginCitizen('Kothri Kalan', 'Rameshwar Lal Gurjar', '9823-4512-7890');
                      onLoginSuccess(session);
                    }}
                    className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-[11px] flex flex-col items-center gap-1 transition"
                  >
                    <User className="w-4 h-4 text-sky-600" />
                    <span>Citizen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAboutModal(false);
                      const session = storageService.loginSurvey('SURV-MP-8821');
                      onLoginSuccess(session);
                    }}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[11px] flex flex-col items-center gap-1 transition"
                  >
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>Surveyor</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Certified for NIC Rural Cloud Evaluation
              </span>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
