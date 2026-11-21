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
  UserCheck
} from 'lucide-react';

interface SurveyPwaProps {
  village: Village;
}

export const SurveyPwa: React.FC<SurveyPwaProps> = ({ village }) => {
  const [activeTab, setActiveTab] = useState<'household' | 'asset' | 'queue'>('household');
  const [mobileFrameMode, setMobileFrameMode] = useState(false);
  const isOnline = storageService.isOnline();
  const queue = storageService.getOfflineQueue();
  const pendingCount = queue.filter(q => !q.synced).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Mobile View Toggle */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold mb-2 border border-amber-400/30">
            <Smartphone className="w-3.5 h-3.5" /> Mobile-First Field Worker PWA
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Gram Mitra Field Data Collection
          </h2>
          <p className="text-xs text-amber-100/80 mt-1">
            Volunteer: <strong>Pooja Verma</strong> • Offline IndexedDB Queue • GPS Geotagging Enabled
          </p>
        </div>

        <button
          onClick={() => setMobileFrameMode(!mobileFrameMode)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition self-start sm:self-auto"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{mobileFrameMode ? 'Switch to Desktop Full-Width' : 'Preview in Mobile Device Frame'}</span>
        </button>
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
