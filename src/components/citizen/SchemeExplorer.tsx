import React, { useState } from 'react';
import { Household, Scheme, Village } from '../../types';
import { AiService } from '../../services/aiService';
import { MOCK_SCHEMES } from '../../data/mockData';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  SlidersHorizontal,
  Gift,
  HelpCircle
} from 'lucide-react';

interface SchemeExplorerProps {
  village: Village;
}

export const SchemeExplorer: React.FC<SchemeExplorerProps> = ({ village }) => {
  // Household simulation profile
  const [profile, setProfile] = useState<Partial<Household>>({
    annualIncome: 95000,
    landHoldingAcres: 1.8,
    rationCardType: 'BPL',
    casteCategory: 'OBC',
    drinkingWaterSource: 'Public Handpump',
    hasSanitationToilet: true,
    isKisanRegistered: true
  });

  const { eligible, ineligible } = AiService.matchSchemes(profile);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-400/30">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Transparent Rule-Based Scheme Matcher
        </div>
        <h2 className="text-xl font-black tracking-tight">Government Welfare Scheme Explorer</h2>
        <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
          Enter household socioeconomic parameters to instantly discover verified Central & State welfare entitlements with transparent eligibility rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Inputs Column */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Household Profile Parameters</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Annual Income */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Annual Family Income:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  ₹{(profile.annualIncome || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={20000}
                max={500000}
                step={10000}
                value={profile.annualIncome}
                onChange={e => setProfile(prev => ({ ...prev, annualIncome: parseInt(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹20k (BPL)</span>
                <span>₹2.5 Lakhs</span>
                <span>₹5 Lakhs</span>
              </div>
            </div>

            {/* Land Holding */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Agricultural Land (Acres):</span>
                <span className="font-bold text-emerald-700 font-mono">{profile.landHoldingAcres} ac</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={profile.landHoldingAcres}
                onChange={e => setProfile(prev => ({ ...prev, landHoldingAcres: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (Landless)</span>
                <span>5 Acres (Marginal)</span>
                <span>10 Acres</span>
              </div>
            </div>

            {/* Ration card */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ration Card Category</label>
              <select
                value={profile.rationCardType}
                onChange={e => setProfile(prev => ({ ...prev, rationCardType: e.target.value as any }))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden"
              >
                <option value="BPL">BPL (Below Poverty Line)</option>
                <option value="AAY">AAY (Antyodaya Anna Yojana - Ultra Poor)</option>
                <option value="APL">APL (Above Poverty Line)</option>
                <option value="None">None / Unregistered</option>
              </select>
            </div>

            {/* Caste category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Social Group / Caste</label>
              <select
                value={profile.casteCategory}
                onChange={e => setProfile(prev => ({ ...prev, casteCategory: e.target.value as any }))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.isKisanRegistered}
                  onChange={e => setProfile(prev => ({ ...prev, isKisanRegistered: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-medium text-slate-700">Active Farmer / Jamabandi Record</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.hasSanitationToilet}
                  onChange={e => setProfile(prev => ({ ...prev, hasSanitationToilet: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-medium text-slate-700">Already Has Pucca Toilet (IHHL)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.drinkingWaterSource === 'Tap Connection'}
                  onChange={e => setProfile(prev => ({
                    ...prev,
                    drinkingWaterSource: e.target.checked ? 'Tap Connection' : 'Public Handpump'
                  }))}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-medium text-slate-700">Has JJM Piped Tap Connection</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligible Schemes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Directly Eligible Schemes ({eligible.length})
              </h3>
              <span className="text-xs text-emerald-700 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Rule Match
              </span>
            </div>

            <div className="space-y-3">
              {eligible.map(({ scheme, reasons }) => (
                <div
                  key={scheme.id}
                  className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-2xs space-y-3 hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {scheme.shortCode}
                        </span>
                        <span className="text-xs text-slate-500">{scheme.ministry}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{scheme.name}</h4>
                    </div>

                    <a
                      href={scheme.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-xl transition shrink-0"
                    >
                      Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Financial Benefit Callout */}
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-950 font-semibold">
                    <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct Benefit: {scheme.financialBenefit}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{scheme.description}</p>

                  {/* Why eligible list */}
                  <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                    <div className="font-semibold text-slate-700 text-[11px]">Rule-Based Match Criteria Met:</div>
                    <ul className="space-y-1">
                      {reasons.map((r, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Documents required */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" /> Required Verification Documents:
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scheme.documentsRequired.map((doc, dIdx) => (
                        <span
                          key={dIdx}
                          className="bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ineligible Schemes Section */}
          {ineligible.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-slate-400" />
                Other Schemes ({ineligible.length} Not Currently Applicable)
              </h3>

              <div className="space-y-2.5">
                {ineligible.map(({ scheme, missingCriteria }) => (
                  <div
                    key={scheme.id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1.5 opacity-80 hover:opacity-100 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{scheme.name}</span>
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Criteria Not Met
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      {missingCriteria.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-1 text-rose-700">
                          <span>•</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
