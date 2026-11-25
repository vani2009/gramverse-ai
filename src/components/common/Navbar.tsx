import React, { useState, useEffect } from 'react';
import { UserRole, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { MOCK_USERS } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../services/translationService';
import { 
  Building2, 
  Landmark, 
  User, 
  ClipboardList, 
  MapPin, 
  Wifi, 
  WifiOff, 
  RotateCcw,
  Bell, 
  Layers, 
  ShieldCheck,
  ChevronDown,
  Globe
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedVillage: Village;
  onVillageChange: (village: Village) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  selectedVillage,
  onVillageChange,
  activeTab,
  onTabChange
}) => {
  const [isOnline, setIsOnline] = useState(storageService.isOnline());
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const { language, setLanguage, languageOptions, t } = useLanguage();
  const villages = storageService.getVillages();
  const currentUser = MOCK_USERS[currentRole];

  const updateCounts = () => {
    setIsOnline(storageService.isOnline());
    const queue = storageService.getOfflineQueue();
    setOfflinePendingCount(queue.filter(q => !q.synced).length);
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('gramverse-storage-change', updateCounts);
    return () => window.removeEventListener('gramverse-storage-change', updateCounts);
  }, []);

  const toggleOnline = () => {
    const next = !isOnline;
    storageService.setOnline(next);
    setIsOnline(next);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all local storage records (complaints, surveys, overrides) back to default mock data?")) {
      storageService.resetAllToDefault();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-[1100] bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Top Demo Bar / Role Switcher Header */}
      <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <img src="/emblem.png" alt="GramVerse AI Logo" className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-400/80 shadow-xs" />
          <span className="font-extrabold text-slate-100 tracking-wide text-xs">GRAMVERSE AI</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">{t('Role-Based Village Governance & AI Platform')}</span>
        </div>

        {/* 4 Role Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-300">Database & API:</span>
            <span className={isOnline ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
              {isOnline ? 'FastAPI + PostGIS Ready' : 'Local Queue Mode'}
            </span>
          </div>

          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                onRoleChange('admin');
                onTabChange('dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
                currentRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('role.admin', 'Admin')}</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('panchayat');
                onTabChange('dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
                currentRole === 'panchayat'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{t('role.panchayat', 'Panchayat')}</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('citizen');
                onTabChange('home');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
                currentRole === 'citizen'
                  ? 'bg-sky-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('role.citizen', 'Citizen')}</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('survey');
                onTabChange('home');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition relative ${
                currentRole === 'survey'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{t('role.survey', 'Survey PWA')}</span>
              {offlinePendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {offlinePendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Indian Language Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer text-xs"
              title="Translate Application to Indian Languages (भारतीय भाषा चुनें)"
            >
              {languageOptions.map(opt => (
                <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
                  {opt.nativeName} ({opt.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Network Toggle and Reset button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/90'
            }`}
            title="Toggle network simulation for PWA offline testing"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Network Online' : 'Network Offline (PWA)'}</span>
          </button>

          <button
            onClick={handleResetData}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange(currentRole === 'citizen' ? 'home' : 'dashboard')}>
            <img 
              src="/logo.jpg" 
              alt="GramVerse AI Logo" 
              className="h-12 sm:h-14 md:h-16 w-auto rounded-xl object-contain shadow-md border border-slate-700/80 bg-[#17232b] px-2 py-1 group-hover:scale-105 transition duration-150 shrink-0"
            />
            <div className="hidden sm:block">
              <div className="font-black text-lg text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span>GramVerse</span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  AI
                </span>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{t('Village Governance Cloud')}</span>
            </div>
          </div>

          {/* Village Selector Dropdown */}
          <div className="relative ml-4 pl-4 border-l border-slate-200 hidden md:flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <select
              value={selectedVillage.id}
              onChange={e => {
                const found = villages.find(v => v.id === e.target.value);
                if (found) onVillageChange(found);
              }}
              className="text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} GP ({v.block} Block)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Persona Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500">{currentUser.designation}</div>
          </div>

          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-2xs">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
