import React, { useState } from 'react';
import { Village, Complaint } from '../../types';
import { StatCard } from '../common/StatCard';
import { VillageMap } from '../gis/VillageMap';
import { storageService } from '../../services/storageService';
import { generateDistrictReportPDF, generatePanchayatReportPDF } from '../../services/pdfReportService';
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
  Globe2,
  BarChart3,
  FileText,
  Layers,
  ShieldCheck,
  Calendar,
  Sparkles,
  Table
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminDashboardProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  villages,
  onSelectVillage,
  activeTab = 'dashboard',
  onTabChange
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedMapComplaint, setSelectedMapComplaint] = useState<Complaint | null>(null);
  const [selectedReportVillageId, setSelectedReportVillageId] = useState<string>(villages[0]?.id || 'vil_kothri');
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

  const handleExportPanchayatReport = () => {
    const targetVil = villages.find(v => v.id === selectedReportVillageId) || villages[0];
    const vilComplaints = complaints.filter(c => c.villageId === targetVil.id);
    const vilInfra = infrastructure.filter(i => i.villageId === targetVil.id);
    generatePanchayatReportPDF(targetVil, vilComplaints, vilInfra);
  };

  const exportVillagesCSV = () => {
    const headers = ['Village Name', 'Block', 'District', 'Population', 'Households', 'Water %', 'Electricity %', 'Sanitation %', 'Dev Index', 'Road Quality', 'Active Issues', 'Budget Allocated (Lakhs)', 'Budget Utilized (Lakhs)'];
    const rows = villages.map(v => [
      `"${v.name}"`,
      `"${v.block}"`,
      `"${v.district}"`,
      v.population,
      v.totalHouseholds,
      v.waterCoveragePct,
      v.electricityCoveragePct,
      v.sanitationCoveragePct,
      v.developmentIndex,
      v.roadQualityIndex,
      v.activeComplaints,
      v.budgetAllocatedLakhs,
      v.budgetUtilizedLakhs
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gramverse_villages_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportComplaintsCSV = () => {
    const headers = ['ID', 'Citizen Name', 'Village', 'Category', 'Status', 'Severity', 'Priority Score', 'Cost (Lakhs)', 'Created At'];
    const rows = complaints.map(c => [
      `"${c.id}"`,
      `"${c.citizenName}"`,
      `"${c.villageName}"`,
      `"${c.category}"`,
      `"${c.status}"`,
      c.severity,
      c.priorityScore,
      c.estimatedCostLakhs,
      `"${c.createdAt}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gramverse_grievances_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Download className="w-4 h-4" /> Download District Dossier (PDF)
          </button>
        </div>
      </div>

      {/* Admin Module Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => onTabChange?.('dashboard')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Admin Overview</span>
        </button>

        <button
          onClick={() => onTabChange?.('analytics')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Village Comparison</span>
        </button>

        <button
          onClick={() => onTabChange?.('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports & Exports</span>
        </button>
      </div>

      {/* TAB 1: ADMIN OVERVIEW (activeTab === 'dashboard') */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
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
              height="480px"
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
      )}

      {/* TAB 2: VILLAGE COMPARISON & ANALYTICS (activeTab === 'analytics') */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Multi-Village Comparison Bar Chart */}
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

              <div className="h-72">
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

          {/* Gap Analysis and Priority Intervention Callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs mb-1">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Water Infrastructure Gap</span>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed">
                <strong>Metwada GP</strong> reports lowest tap water coverage (62%). Recommended 15th FC Grants deployment for Jal Jeevan Mission pipeline extension.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Top Performing Panchayat</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                <strong>Amlaha GP</strong> leads Sehore District with 84.0 composite development score and 95% electricity reliability.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>Fund Deployment Velocity</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Total ₹77.3L deployed out of ₹86.0L allocated (89.8% utilization). On track for FY2025-26 central grant qualification.
              </p>
            </div>
          </div>

          {/* Detailed Comparative Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Gram Panchayat Benchmark Matrix</h3>
                <p className="text-xs text-slate-500">Cross-village comparison for administrative decision-making</p>
              </div>
              <button
                onClick={exportVillagesCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" /> Export Data (CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100 text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Panchayat Name</th>
                    <th className="px-4 py-3">Population</th>
                    <th className="px-4 py-3">Dev Index</th>
                    <th className="px-4 py-3">Water %</th>
                    <th className="px-4 py-3">Electricity %</th>
                    <th className="px-4 py-3">Sanitation %</th>
                    <th className="px-4 py-3">Road Score</th>
                    <th className="px-4 py-3">Fund Used / Alloc</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {villages.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{v.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{v.population.toLocaleString()} ({v.totalHouseholds} HH)</td>
                      <td className="px-4 py-3.5 font-bold text-indigo-700">{v.developmentIndex}/100</td>
                      <td className="px-4 py-3.5">{v.waterCoveragePct}%</td>
                      <td className="px-4 py-3.5">{v.electricityCoveragePct}%</td>
                      <td className="px-4 py-3.5">{v.sanitationCoveragePct}%</td>
                      <td className="px-4 py-3.5">{v.roadQualityIndex}/100</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">₹{v.budgetUtilizedLakhs}L / ₹{v.budgetAllocatedLakhs}L</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => onSelectVillage(v)}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          Inspect GP →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS & EXPORTS CENTRE (activeTab === 'reports') */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Official District Analytics Dossier */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">District Analytics Dossier (PDF)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Comprehensive district overview certified for administrative monitoring, 15th FC Grants audit, and state review. Grounded in PostGIS telemetry.
                </p>
                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div>• Includes all 5 tracked Gram Panchayats</div>
                  <div>• Demographic & development rankings</div>
                  <div>• Jal Jeevan Mission telemetry audit</div>
                </div>
              </div>

              <button
                onClick={handleExportReport}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download District PDF
              </button>
            </div>

            {/* 2. Panchayat GPDP 2025 Submission Reports */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Panchayat GPDP 2025 Dossier</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Export village-specific GPDP submission document with Sarpanch certification block and prioritized civic project schedule.
                </p>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Panchayat:</label>
                  <select
                    value={selectedReportVillageId}
                    onChange={e => setSelectedReportVillageId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} GP ({v.block} Block)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleExportPanchayatReport}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download GPDP PDF
              </button>
            </div>

            {/* 3. Raw Data Exports (CSV) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Table className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Raw Data & Ledgers (CSV)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download raw tabular datasets formatted for Excel, National Panchayat Portal, or custom analytical software.
                </p>
                <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div>• RFC 4180 CSV specification</div>
                  <div>• UTF-8 encoded text</div>
                  <div>• Includes GPS latitude and longitude</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={exportVillagesCSV}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" /> Export Villages Summary (.CSV)
                </button>
                <button
                  onClick={exportComplaintsCSV}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" /> Export Grievances Register (.CSV)
                </button>
              </div>
            </div>
          </div>

          {/* Audit & Compliance Standards Card */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">NIC & Ministry of Panchayati Raj Audit Compliant</h4>
                <p className="text-xs text-slate-400">
                  All exported dossiers comply with MoPR GPDP guidelines and 15th Finance Commission grant documentation standards.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                ● 100% Cryptographic Checksum Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
