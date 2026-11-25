import React, { useState } from 'react';
import { Village, Complaint } from '../../types';
import { StatCard } from '../common/StatCard';
import { VillageMap } from '../gis/VillageMap';
import { storageService } from '../../services/storageService';
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
  CheckCircle2
} from 'lucide-react';

interface PanchayatDashboardProps {
  village: Village;
  onNavigateTab: (tab: string) => void;
  onSelectComplaintForInspection?: (complaint: Complaint) => void;
}

export const PanchayatDashboard: React.FC<PanchayatDashboardProps> = ({
  village,
  onNavigateTab,
  onSelectComplaintForInspection
}) => {
  const allVillages = storageService.getVillages();
  const allComplaints = storageService.getComplaints();
  const allInfrastructure = storageService.getInfrastructure();

  const complaints = allComplaints.filter(c => c.villageId === village.id);
  const households = storageService.getHouseholds().filter(h => h.villageId === village.id);
  const infrastructure = allInfrastructure.filter(i => i.villageId === village.id);

  const [selectedMapComplaint, setSelectedMapComplaint] = useState<Complaint | null>(null);

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved');
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('complaints')}
            className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition shadow-xs flex items-center gap-1.5"
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
            complaints={allComplaints}
            infrastructure={allInfrastructure}
            allVillages={allVillages}
            allowBlockFilter={true}
            initialBlock={village.block}
            selectedComplaintId={selectedMapComplaint?.id}
            onSelectComplaint={cmp => setSelectedMapComplaint(cmp)}
            height="460px"
            title={`${village.name} GP & ${village.block} Block Map`}
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
                .map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedMapComplaint(item);
                      if (onSelectComplaintForInspection) onSelectComplaintForInspection(item);
                    }}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                      <span className="font-mono font-bold text-rose-600">
                        Score: {item.priorityScore}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 leading-snug">{item.title}</div>
                    <div className="text-[11px] text-slate-500">📍 {item.location.landmark}</div>

                    <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-medium">
                      AI Categorized: {item.aiOutput.predictedCategory} ({(item.aiOutput.confidence * 100).toFixed(0)}%)
                    </div>
                  </div>
                ))}
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
    </div>
  );
};
