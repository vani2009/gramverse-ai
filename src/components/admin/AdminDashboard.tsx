import React, { useState } from 'react';
import { Village, Complaint } from '../../types';
import { StatCard } from '../common/StatCard';
import { VillageMap } from '../gis/VillageMap';
import { storageService } from '../../services/storageService';
import { generateDistrictReportPDF } from '../../services/pdfReportService';
import {
  Building2,
  Users,
  Droplets,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Globe2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminDashboardProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  villages,
  onSelectVillage
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedMapComplaint, setSelectedMapComplaint] = useState<Complaint | null>(null);
  const complaints = storageService.getComplaints();
  const infrastructure = storageService.getInfrastructure();
  const activeVillage = villages.find(v => v.id === storageService.getSelectedVillageId()) || villages[0];

  const filteredVillages = selectedBlock === 'all'
    ? villages
    : villages.filter(v => v.block.toLowerCase() === selectedBlock.toLowerCase());

  // Aggregate stats
  const totalPopulation = villages.reduce((acc, v) => acc + v.population, 0);
  const totalHouseholds = villages.reduce((acc, v) => acc + v.totalHouseholds, 0);
  const totalBudget = villages.reduce((acc, v) => acc + v.budgetAllocatedLakhs, 0);
  const totalSpent = villages.reduce((acc, v) => acc + v.budgetUtilizedLakhs, 0);
  const avgDevScore = (villages.reduce((acc, v) => acc + v.developmentIndex, 0) / villages.length).toFixed(1);

  // Chart data
  const comparisonData = villages.map(v => ({
    name: v.name,
    'Water %': v.waterCoveragePct,
    'Electricity %': v.electricityCoveragePct,
    'Sanitation %': v.sanitationCoveragePct,
    'Dev Index': v.developmentIndex,
    'Road Index': v.roadQualityIndex
  }));

  const categoryDistribution = [
    { name: 'Road', value: complaints.filter(c => c.category === 'Road').length, color: '#f97316' },
    { name: 'Water', value: complaints.filter(c => c.category === 'Water').length, color: '#0284c7' },
    { name: 'Sanitation', value: complaints.filter(c => c.category === 'Sanitation').length, color: '#10b981' },
    { name: 'Electricity', value: complaints.filter(c => c.category === 'Electricity').length, color: '#eab308' },
    { name: 'Health', value: complaints.filter(c => c.category === 'Health').length, color: '#ef4444' },
    { name: 'School', value: complaints.filter(c => c.category === 'School').length, color: '#8b5cf6' },
  ];

  const handleExportReport = () => {
    generateDistrictReportPDF(villages, complaints, {
      totalPopulation,
      totalHouseholds,
      totalBudget,
      totalSpent,
      avgDevScore
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="GramVerse AI Logo" 
            className="w-36 sm:w-44 h-auto rounded-xl object-contain shadow-md border border-slate-700 bg-[#17232b] p-1.5 shrink-0 self-start sm:self-auto" 
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-400/30">
              <Building2 className="w-3.5 h-3.5" /> District & Block Administration Portal
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Sehore District Overview (Ashta Block)
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Multi-village monitoring, comparative infrastructure metrics, AI grievance trends and development rankings across Panchayats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
            title="Download official District Analytics Dossier in PDF format"
          >
            <Download className="w-4 h-4" /> Download Report (PDF)
          </button>
        </div>
      </div>

      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rural Population"
          value={totalPopulation.toLocaleString()}
          subtitle={`Across ${villages.length} tracked Panchayats`}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          colorTheme="indigo"
          trend={{ value: '12% verified by PWA', isPositive: true }}
        />
        <StatCard
          title="District Dev Index"
          value={`${avgDevScore}/100`}
          subtitle="Composite infrastructure score"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          colorTheme="emerald"
          trend={{ value: '+4.2 pts YoY', isPositive: true }}
        />
        <StatCard
          title="Fund Utilization"
          value={`₹${totalSpent.toFixed(1)}L / ₹${totalBudget.toFixed(1)}L`}
          subtitle={`${((totalSpent / totalBudget) * 100).toFixed(0)}% 15th FC Grants deployed`}
          icon={<FileSpreadsheet className="w-5 h-5 text-sky-600" />}
          colorTheme="sky"
        />
        <StatCard
          title="Active Grievances"
          value={complaints.filter(c => c.status !== 'Resolved').length}
          subtitle={`${complaints.filter(c => c.status === 'Resolved').length} resolved this quarter`}
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          colorTheme="amber"
        />
      </div>

      {/* Multi-Village Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Gram Panchayat Infrastructure Index</h3>
              <p className="text-xs text-slate-500">Comparative coverage across core public utilities (%)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Water
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Electricity
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2"></span> Sanitation
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="Water %" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Electricity %" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sanitation %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Grievance Categorization Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">NLP Grievance Categories</h3>
            <p className="text-xs text-slate-500">Distribution of citizen reported issues</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryDistribution.map(cat => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-600">{cat.name}:</span>
                <span className="font-semibold text-slate-800">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District & Block GIS Spatial Problem Map */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              District & Block GIS Spatial Problem Map
            </h3>
            <p className="text-xs text-slate-500">
              Interactive spatial monitoring of citizen problems, road defects, water outages, and civic assets across blocks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
              {complaints.filter(c => c.status !== 'Resolved').length} Active Problems
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200">
              {infrastructure.length} Civic Assets
            </span>
          </div>
        </div>

        <VillageMap
          village={activeVillage}
          allVillages={villages}
          complaints={complaints}
          infrastructure={infrastructure}
          allowBlockFilter={true}
          initialBlock={selectedBlock}
          selectedComplaintId={selectedMapComplaint?.id}
          onSelectComplaint={cmp => setSelectedMapComplaint(cmp)}
          onSelectVillage={onSelectVillage}
          height="500px"
          title="District Administrative Spatial GIS Engine (MP)"
        />
      </div>

      {/* Village Ranking & Master Registry */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Village Performance & Development Rankings</h3>
            <p className="text-xs text-slate-500">Rule-based scoring ranking and fund deployment tracking</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBlock}
              onChange={e => setSelectedBlock(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-hidden"
            >
              <option value="all">All Panchayats (Ashta Block, Sehore)</option>
              <option value="Ashta">Ashta Block</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="px-5 py-3">Rank & Village</th>
                <th className="px-4 py-3">Block</th>
                <th className="px-4 py-3">Population / HH</th>
                <th className="px-4 py-3">Development Index</th>
                <th className="px-4 py-3">Water Coverage</th>
                <th className="px-4 py-3">Road Quality</th>
                <th className="px-4 py-3">Active Issues</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVillages
                .sort((a, b) => b.developmentIndex - a.developmentIndex)
                .map((vil, idx) => (
                  <tr key={vil.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{vil.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{vil.block}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {vil.population.toLocaleString()} ({vil.totalHouseholds} HH)
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{vil.developmentIndex}</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${vil.developmentIndex}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-semibold ${
                        vil.waterCoveragePct >= 75 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {vil.waterCoveragePct}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {vil.roadQualityIndex}/100
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                        {vil.activeComplaints} open
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onSelectVillage(vil)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Inspect GP <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
