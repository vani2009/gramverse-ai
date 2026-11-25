import React, { useState } from 'react';
import { Household, Scheme, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { MOCK_SCHEMES } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Search, Filter, CheckCircle2, XCircle, Droplets, Home, Sparkles } from 'lucide-react';

interface HouseholdRegistryProps {
  village: Village;
}

export const HouseholdRegistry: React.FC<HouseholdRegistryProps> = ({ village }) => {
  const { t } = useLanguage();
  const [households] = useState<Household[]>(storageService.getHouseholds());
  const [search, setSearch] = useState('');
  const [rationFilter, setRationFilter] = useState('all');
  const [waterFilter, setWaterFilter] = useState('all');
  const [casteFilter, setCasteFilter] = useState('all');

  const filtered = households.filter(h => {
    if (rationFilter !== 'all' && h.rationCardType !== rationFilter) return false;
    if (waterFilter !== 'all' && h.drinkingWaterSource !== waterFilter) return false;
    if (casteFilter !== 'all' && h.casteCategory !== casteFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        h.headName.toLowerCase().includes(q) ||
        h.aadhaarLastFour.includes(q) ||
        h.casteCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSchemeName = (id: string) => {
    return MOCK_SCHEMES.find(s => s.id === id)?.shortCode || id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gram Panchayat Household Registry</h2>
          <p className="text-xs text-slate-500">
            Socioeconomic demographic data, SECC parameters, and rule-based scheme entitlement status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Total Enrolled:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {households.length} Households
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Head of Family or last 4 digits of Aadhaar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={rationFilter}
              onChange={e => setRationFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 outline-hidden"
            >
              <option value="all">All Ration Cards</option>
              <option value="BPL">BPL (Below Poverty Line)</option>
              <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
              <option value="APL">APL (Above Poverty Line)</option>
            </select>
          </div>

          <select
            value={waterFilter}
            onChange={e => setWaterFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 outline-hidden"
          >
            <option value="all">All Water Sources</option>
            <option value="Tap Connection">Tap Connection (JJM)</option>
            <option value="Public Handpump">Public Handpump</option>
            <option value="Open Well">Open Well</option>
          </select>

          <select
            value={casteFilter}
            onChange={e => setCasteFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 outline-hidden"
          >
            <option value="all">{t('caste.all', 'All Castes')}</option>
            <option value="General">{t('caste.general', 'General')}</option>
            <option value="General (EWS)">{t('caste.general_ews', 'General (EWS)')}</option>
            <option value="OBC">{t('caste.obc', 'OBC')}</option>
            <option value="SC">{t('caste.sc', 'SC')}</option>
            <option value="ST">{t('caste.st', 'ST')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="px-5 py-3">Head of Family</th>
                <th className="px-4 py-3">Aadhaar (Last 4)</th>
                <th className="px-4 py-3">Family Size / Caste</th>
                <th className="px-4 py-3">Annual Income</th>
                <th className="px-4 py-3">Landholding</th>
                <th className="px-4 py-3">Drinking Water</th>
                <th className="px-4 py-3">Toilet / SBM</th>
                <th className="px-4 py-3">Matched Schemes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(hh => (
                <tr key={hh.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <div>{hh.headName}</div>
                    <span className="text-[10px] font-normal text-slate-400">ID: {hh.id}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">
                    XXXX-XXXX-{hh.aadhaarLastFour}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {hh.familySize} Members • <span className="font-semibold text-slate-800">{hh.casteCategory}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    ₹{hh.annualIncome.toLocaleString('en-IN')}/yr
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{hh.rationCardType} Card</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {hh.landHoldingAcres > 0 ? `${hh.landHoldingAcres} Acres` : 'Landless'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      hh.drinkingWaterSource === 'Tap Connection' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      <Droplets className="w-3 h-3" /> {hh.drinkingWaterSource}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {hh.hasSanitationToilet ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pucca Toilet
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Needs SBM
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {hh.matchedSchemeIds.map(sid => (
                        <span
                          key={sid}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200"
                        >
                          {getSchemeName(sid)}
                        </span>
                      ))}
                    </div>
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
