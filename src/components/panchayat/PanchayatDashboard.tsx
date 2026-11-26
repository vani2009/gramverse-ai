import React, { useState, useEffect } from 'react';
import { Village, Complaint, PanchayatNotice } from '../../types';
import { StatCard } from '../common/StatCard';
import { VillageMap } from '../gis/VillageMap';
import { storageService } from '../../services/storageService';
import { generatePanchayatReportPDF } from '../../services/pdfReportService';
import {
  Users,
  Droplets,
  AlertCircle,
  FileCheck2,
  Wrench,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  BellRing,
  Plus,
  Trash2,
  X,
  Send,
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle
} from 'lucide-react';

const NOTICE_TEMPLATES = [
  {
    label: '📢 Gram Sabha Meeting',
    title: 'Special Gram Sabha Meeting for GPDP 2025 Planning',
    category: 'Gram Sabha' as const,
    priority: 'High' as const,
    content: 'All adult residents of the Gram Panchayat are invited to attend the Special Gram Sabha meeting on 28 Nov 2026 at 11:00 AM in Panchayat Bhavan. Agenda: GPDP 2025 infrastructure priorities, solar light installations, and drinking water tariff review.'
  },
  {
    label: '💧 Water Pipeline Shutdown',
    title: 'Drinking Water Pipeline Repair - Temporary Shutdown Notice',
    category: 'Water Supply' as const,
    priority: 'Urgent' as const,
    content: 'Drinking water pipeline in Ward 2 and Ward 4 will be turned off tomorrow between 9:00 AM to 2:00 PM for valve replacement and leak repairs. Residents are requested to store necessary water.'
  },
  {
    label: '🏥 Free Health & Vaccine Camp',
    title: 'Free Ayushman Health Check-up & Childhood Vaccine Camp',
    category: 'Health Camp' as const,
    priority: 'Normal' as const,
    content: 'A government medical team will conduct a free general health check-up, blood pressure, sugar testing, and childhood immunization camp at Sub-Health Centre on Friday from 10:00 AM to 4:00 PM.'
  },
  {
    label: '🌾 PM-KISAN e-KYC Camp',
    title: 'PM-KISAN e-KYC & Aadhaar Seeding Support Camp',
    category: 'Agriculture' as const,
    priority: 'Normal' as const,
    content: 'Farmers who have not completed biometric e-KYC or land record linking for the upcoming PM-KISAN installment should bring their Aadhaar and bank passbook to the Panchayat CSC desk this week.'
  }
];

interface PanchayatDashboardProps {
  village: Village;
  onNavigateTab: (tab: string) => void;
  onSelectComplaintForInspection?: (complaint: Complaint) => void;
  initialComplaint?: Complaint | null;
}

export const PanchayatDashboard: React.FC<PanchayatDashboardProps> = ({
  village,
  onNavigateTab,
  onSelectComplaintForInspection,
  initialComplaint
}) => {
  const allVillages = storageService.getVillages();
  const allComplaints = storageService.getComplaints();
  const allInfrastructure = storageService.getInfrastructure();

  const complaints = allComplaints.filter(c => c.villageId === village.id);
  const households = storageService.getHouseholds().filter(h => h.villageId === village.id);
  const infrastructure = allInfrastructure.filter(i => i.villageId === village.id);

  const [selectedMapComplaint, setSelectedMapComplaint] = useState<Complaint | null>(
    initialComplaint || null
  );

  // Citizen Notice Management State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [notices, setNotices] = useState<PanchayatNotice[]>(() => storageService.getNotices(village.id));
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<PanchayatNotice['category']>('Gram Sabha');
  const [noticePriority, setNoticePriority] = useState<PanchayatNotice['priority']>('High');
  const [noticeContent, setNoticeContent] = useState('');
  const [authorRole, setAuthorRole] = useState('Panchayat Secretary');
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setNotices(storageService.getNotices(village.id));
    };
    window.addEventListener('gramverse-storage-change', handleUpdate);
    return () => window.removeEventListener('gramverse-storage-change', handleUpdate);
  }, [village.id]);

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    storageService.addNotice({
      villageId: village.id,
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      category: noticeCategory,
      priority: noticePriority,
      authorName: 'Rajesh Sharma',
      authorRole
    });

    setPublishSuccess(true);
    setNoticeTitle('');
    setNoticeContent('');
    setTimeout(() => {
      setPublishSuccess(false);
      setIsNoticeModalOpen(false);
    }, 900);
  };

  const handleDeleteNotice = (id: string) => {
    storageService.deleteNotice(id);
  };

  const handleApplyTemplate = (tpl: typeof NOTICE_TEMPLATES[0]) => {
    setNoticeTitle(tpl.title);
    setNoticeCategory(tpl.category);
    setNoticePriority(tpl.priority);
    setNoticeContent(tpl.content);
  };

  React.useEffect(() => {
    if (initialComplaint) {
      setSelectedMapComplaint(initialComplaint);
    }
  }, [initialComplaint]);

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="GramVerse AI Logo" 
            className="w-36 sm:w-44 h-auto rounded-xl object-contain shadow-md border border-slate-700 bg-[#17232b] p-1.5 shrink-0 self-start sm:self-auto" 
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold mb-2 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Gram Panchayat Administration Console
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {village.name} Gram Panchayat Dashboard
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1">
              Block: <strong>{village.block}</strong> • District: <strong>{village.district}</strong> • Model Village Index: <strong>{village.developmentIndex}/100</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            title="Write and broadcast an official notice to all citizens"
          >
            <BellRing className="w-3.5 h-3.5" />
            Write Notice to Citizens
          </button>

          <button
            onClick={() => generatePanchayatReportPDF(village, complaints)}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Download official Gram Panchayat dossier in PDF format"
          >
            <Download className="w-3.5 h-3.5" />
            Download Report (PDF)
          </button>

          <button
            onClick={() => onNavigateTab('complaints')}
            className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            Review Grievances ({activeComplaints.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Village Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Village Population"
          value={village.population.toLocaleString()}
          subtitle={`${village.totalHouseholds} Enrolled Households`}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          colorTheme="emerald"
        />
        <StatCard
          title="JJM Tap Water"
          value={`${village.waterCoveragePct}%`}
          subtitle="Household FHTC piped connections"
          icon={<Droplets className="w-5 h-5 text-sky-600" />}
          colorTheme="sky"
          trend={{ value: 'Target 100% by 2027', isPositive: true }}
        />
        <StatCard
          title="Active Grievances"
          value={activeComplaints.length}
          subtitle={`${resolvedCount} resolved with AI tracking`}
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          colorTheme="amber"
        />
        <StatCard
          title="15th FC Grants"
          value={`₹${village.budgetUtilizedLakhs}L`}
          subtitle={`Allocated: ₹${village.budgetAllocatedLakhs} Lakhs`}
          icon={<FileCheck2 className="w-5 h-5 text-indigo-600" />}
          colorTheme="indigo"
          trend={{ value: `${((village.budgetUtilizedLakhs / village.budgetAllocatedLakhs) * 100).toFixed(0)}% utilized`, isPositive: true }}
        />
      </div>

      {/* GIS Village Map & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Spatial Village GIS Map</h3>
              <p className="text-xs text-slate-500">
                Interactive PostGIS layers for civic assets, handpumps, solar streetlights and citizen grievances.
              </p>
            </div>
            <span className="text-xs text-slate-400">Click any marker to inspect</span>
          </div>

          <VillageMap
            village={village}
            complaints={complaints}
            infrastructure={infrastructure}
            allVillages={[village]}
            allowBlockFilter={false}
            allowVillageFilter={false}
            selectedComplaintId={selectedMapComplaint?.id}
            onSelectComplaint={cmp => setSelectedMapComplaint(cmp)}
            height="460px"
            title={`${village.name} Gram Panchayat Spatial Map`}
          />
        </div>

        {/* Top Priority Issues & Actions Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Critical Priority Triage
              </h4>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View Planner →
              </button>
            </div>

            <div className="space-y-3">
              {complaints
                .filter(c => c.status !== 'Resolved')
                .sort((a, b) => b.priorityScore - a.priorityScore)
                .slice(0, 3)
                .map(item => {
                  const isSelected = selectedMapComplaint?.id === item.id;
                  const isCritical = item.priorityScore >= 3000;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMapComplaint(item)}
                      className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'border-rose-400 bg-rose-50/70 shadow-xs ring-1 ring-rose-300'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {isCritical ? '🔴 Critical' : '🟠 Active'}: {item.category}
                        </span>
                        <span className="font-mono font-bold text-rose-600">
                          Score: {item.priorityScore}
                        </span>
                      </div>

                      <div className="font-bold text-xs text-slate-900 leading-snug">{item.title}</div>
                      <div className="text-[11px] text-slate-500">📍 {item.location.landmark}</div>

                      <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-medium flex items-center justify-between">
                        <span>AI: {item.aiOutput.predictedCategory} ({(item.aiOutput.confidence * 100).toFixed(0)}%)</span>
                        <span className="text-slate-500 font-semibold">{isSelected ? '✓ In View on Map' : 'Click to View on Map'}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab('households')}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition"
              >
                Household Registry
              </button>
              <button
                onClick={() => onNavigateTab('complaints')}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-center transition shadow-xs"
              >
                Manage Grievances
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Broadcast Notice Board Manager Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Citizen Notice Board Broadcast Manager ({village.name})
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {notices.length} Active Broadcasts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official notices published here appear in real-time on all citizens' Jan Seva Portal notice boards
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Write Notice to Citizens
          </button>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {notices.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs italic">
              No active notices for this Panchayat. Click "Write Notice to Citizens" to publish your first announcement.
            </div>
          ) : (
            notices.map((notice) => {
              const isUrgent = notice.priority === 'Urgent';
              const isHigh = notice.priority === 'High';
              return (
                <div
                  key={notice.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                    isUrgent
                      ? 'bg-rose-50/70 border-rose-200 shadow-2xs'
                      : isHigh
                      ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {notice.priority} Alert: {notice.category}
                      </span>

                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-100/60 transition cursor-pointer"
                        title="Delete / revoke notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 leading-snug">
                      {notice.title}
                    </h5>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {notice.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Issued: {notice.date}</span>
                    <span className="font-semibold text-slate-700">{notice.authorRole}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Write Notice Modal Dialog */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center text-emerald-200">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Write Notice to Citizens</h3>
                  <p className="text-[11px] text-emerald-100/80">Broadcast announcement for {village.name} Gram Panchayat</p>
                </div>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Templates */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Preset Templates:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {NOTICE_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium text-[11px] transition shadow-2xs cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePublishNotice} className="p-5 space-y-4 text-xs">
              {publishSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Notice broadcasted live to all citizen portal dashboards!</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Special Gram Sabha Meeting on GPDP 2025"
                  value={noticeTitle}
                  onChange={e => setNoticeTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={e => setNoticeCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="Gram Sabha">Gram Sabha</option>
                    <option value="Water Supply">Water Supply (JJM)</option>
                    <option value="Health Camp">Health & Vaccination</option>
                    <option value="Agriculture">Agriculture & PM-KISAN</option>
                    <option value="Emergency">Emergency Alert</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Priority Level</label>
                  <select
                    value={noticePriority}
                    onChange={e => setNoticePriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Emergency Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notice Description / Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the agenda, date, venue, or important instructions for the citizens..."
                  value={noticeContent}
                  onChange={e => setNoticeContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Issuing Authority</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Notice to Citizens
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
