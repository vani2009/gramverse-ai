import React from 'react';
import { Village, Complaint } from '../../types';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import {
  FilePlus,
  Compass,
  Clock,
  Bot,
  AlertCircle,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CitizenHomeProps {
  village: Village;
  onNavigateTab: (tab: string) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ village, onNavigateTab }) => {
  const { t } = useLanguage();
  const complaints = storageService.getComplaints().filter(c => c.villageId === village.id);
  const activeCount = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-emerald-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <img 
            src="/logo.jpg" 
            alt="GramVerse AI Logo" 
            className="w-40 sm:w-52 md:w-60 h-auto rounded-2xl object-contain shadow-lg border-2 border-slate-700 bg-[#17232b] p-2 shrink-0 self-start sm:self-auto hover:scale-105 transition" 
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {t("Citizen Jan Seva Portal")}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Namaste, Rameshwar Lal Gurjar
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Ward 3, {village.name} Gram Panchayat • Direct access to village schemes, complaint tracking & GramBot AI.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('submit')}
          className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-50 transition shadow-xs flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <FilePlus className="w-4 h-4 text-emerald-600" /> {t("Lodge Grievance")}
        </button>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('submit')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-emerald-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
              {t("Lodge Grievance")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit photo & GPS location. AI instantly tags category & priority.
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            {t("Submit Now")} <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('schemes')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-sky-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition">
              {t("Scheme Explorer")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Match PM-KISAN, PMAY-G & Ayushman Bharat to your family profile.
            </p>
          </div>
          <div className="text-xs font-semibold text-sky-600 flex items-center gap-1">
            {t("Check Eligibility")} <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('tracking')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition">
              {t("Track Status")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              View stage-by-stage work order updates and official remarks.
            </p>
          </div>
          <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
            {complaints.length} {t("Filed Records")} <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('chatbot')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-indigo-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
              {t("GramBot AI")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask questions on village budget, water supply & documents.
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
            {t("Chat with Citations")} <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Village Notice Board & Recent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice Board */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">{t("Gram Panchayat Notice Board")}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Special Gram Sabha Meeting</span>
              </div>
              <p className="text-emerald-800 leading-snug">
                Date: 25 Nov 2026, 11:00 AM at Panchayat Bhavan. Agenda: GPDP 2025 development works and drinking water tariff.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                <span>JJM Tap Water Field Testing Camp</span>
              </div>
              <p className="text-sky-800 leading-snug">
                VWSC members are testing drinking water samples from all 9 wards. Bring water samples for free chlorine/fluoride check.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Grievances in Village */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t("Community Grievance Feed")} ({village.name})</h3>
              <p className="text-xs text-slate-500">Live village issues processed by AI classification</p>
            </div>
            <button
              onClick={() => onNavigateTab('tracking')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              {t("View All")} →
            </button>
          </div>

          <div className="space-y-2.5">
            {complaints.slice(0, 3).map(cmp => (
              <div
                key={cmp.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs hover:bg-slate-100/70 transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                      {t(cmp.category)}
                    </span>
                    <span className="font-semibold text-slate-900">{cmp.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">📍 {cmp.location.landmark}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    {t(cmp.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
