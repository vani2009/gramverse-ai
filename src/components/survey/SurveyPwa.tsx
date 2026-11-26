import React, { useState } from 'react';
import { Village } from '../../types';
import { HouseholdSurveyForm } from './HouseholdSurveyForm';
import { AssetSurveyForm } from './AssetSurveyForm';
import { OfflineQueue } from './OfflineQueue';
import { storageService } from '../../services/storageService';
import {
  Smartphone,
  ClipboardList,
  Building,
  CloudUpload,
  Wifi,
  WifiOff,
  UserCheck,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface SurveyPwaProps {
  village: Village;
  onVillageChange?: (village: Village) => void;
}

export const SurveyPwa: React.FC<SurveyPwaProps> = ({ village, onVillageChange }) => {
  const [activeTab, setActiveTab] = useState<'household' | 'asset' | 'queue'>('household');
  const [mobileFrameMode, setMobileFrameMode] = useState(false);
  const isOnline = storageService.isOnline();
  const queue = storageService.getOfflineQueue();
  const pendingCount = queue.filter(q => !q.synced).length;
  const allVillages = storageService.getVillages();
  const authSession = storageService.getAuthSession();

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header and Mobile View Toggle */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="GramVerse AI Logo" 
            className="w-32 sm:w-40 h-auto rounded-xl object-contain shadow-md border border-slate-700 bg-[#17232b] p-1.5 shrink-0 self-start sm:self-auto" 
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold mb-2 border border-amber-400/30">
              <Smartphone className="w-3.5 h-3.5" /> Mobile-First Field Worker PWA
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Gram Mitra Field Data Collection
            </h2>
            <p className="text-xs text-amber-100/80 mt-1">
              Field Officer: <strong>{authSession?.user?.name || 'Pooja Verma'}</strong> • Emp ID: <strong>{authSession?.user?.employeeId || 'SURV-MP-8821'}</strong> • GPS Geotagging Active
            </p>
          </div>
        </div>

        <button
          onClick={() => setMobileFrameMode(!mobileFrameMode)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition self-start sm:self-auto"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{mobileFrameMode ? 'Switch to Desktop Full-Width' : 'Preview in Mobile Frame'}</span>
        </button>
      </div>

      {/* Village Location Switcher Bar for Field Surveyor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Survey Field Target Location
            </div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>{village.name} Gram Panchayat</span>
              <span className="text-xs text-slate-500 font-medium">({village.block} Block)</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Switch Village:</label>
          <select
            value={village.id}
            onChange={e => {
              const selected = allVillages.find(v => v.id === e.target.value);
              if (selected && onVillageChange) {
                onVillageChange(selected);
              }
            }}
            className="text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 outline-none cursor-pointer shadow-2xs transition"
          >
            {allVillages.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} GP ({v.totalHouseholds} Households, {v.block})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main PWA Container */}
      <div className={`mx-auto transition-all duration-300 ${mobileFrameMode ? 'max-w-md border-[8px] border-slate-800 rounded-3xl p-3 shadow-2xl bg-slate-100' : ''}`}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* PWA Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-center">
            <button
              onClick={() => setActiveTab('household')}
              className={`py-3 flex items-center justify-center gap-1.5 transition ${
                activeTab === 'household'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Household</span>
            </button>

            <button
              onClick={() => setActiveTab('asset')}
              className={`py-3 flex items-center justify-center gap-1.5 transition ${
                activeTab === 'asset'
                  ? 'bg-white text-sky-700 border-b-2 border-sky-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Asset</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`py-3 flex items-center justify-center gap-1.5 transition relative ${
                activeTab === 'queue'
                  ? 'bg-white text-amber-700 border-b-2 border-amber-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Sync Queue</span>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5">
            {activeTab === 'household' && (
              <HouseholdSurveyForm village={village} onSuccess={() => {}} />
            )}
            {activeTab === 'asset' && (
              <AssetSurveyForm village={village} onSuccess={() => {}} />
            )}
            {activeTab === 'queue' && (
              <OfflineQueue onSyncComplete={() => {}} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
