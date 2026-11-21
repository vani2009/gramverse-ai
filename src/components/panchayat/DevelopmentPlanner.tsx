import React, { useState } from 'react';
import { Village, Complaint } from '../../types';
import { storageService } from '../../services/storageService';
import { AiService } from '../../services/aiService';
import {
  Calculator,
  TrendingUp,
  AlertOctagon,
  ArrowUpDown,
  CheckCircle,
  Sparkles,
  Sliders,
  DollarSign,
  Users
} from 'lucide-react';

interface DevelopmentPlannerProps {
  village: Village;
}

export const DevelopmentPlanner: React.FC<DevelopmentPlannerProps> = ({ village }) => {
  const complaints = storageService.getComplaints().filter(c => c.status !== 'Resolved');

  // Interactive sandbox state
  const [sandboxSeverity, setSandboxSeverity] = useState<number>(4);
  const [sandboxPopulation, setSandboxPopulation] = useState<number>(650);
  const [sandboxCost, setSandboxCost] = useState<number>(1.5);

  const sandboxResult = AiService.calculatePriorityScore(
    sandboxSeverity,
    sandboxPopulation,
    sandboxCost
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" /> Explainable Rule-Based Logic
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Village Development Priority Planner
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Ranks infrastructure and civic interventions transparently based on severity of hazard, total beneficiaries affected, and capital expenditure required.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div className="font-semibold text-slate-900 mb-0.5">Scoring Formula</div>
          <code className="text-[11px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200 block">
            Score = (Severity [1-5] × Population) ÷ Cost (Lakhs)
          </code>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Interactive Priority Score Calculator</h3>
          </div>
          <span className="text-[11px] text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
            Live Scenario Simulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Severity slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Hazard Severity:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{sandboxSeverity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={sandboxSeverity}
              onChange={e => setSandboxSeverity(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Minor (1)</span>
              <span>Moderate (3)</span>
              <span>Critical Emergency (5)</span>
            </div>
          </div>

          {/* Population input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Affected Population:</span>
              <span className="font-bold text-sky-400 font-mono text-sm">{sandboxPopulation} people</span>
            </div>
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={sandboxPopulation}
              onChange={e => setSandboxPopulation(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50 Ward Res.</span>
              <span>1,500 Multi-Ward</span>
              <span>3,000 Entire GP</span>
            </div>
          </div>

          {/* Cost input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Estimated Cost (Lakhs):</span>
              <span className="font-bold text-amber-400 font-mono text-sm">₹{sandboxCost.toFixed(2)} Lakhs</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10.0}
              step={0.1}
              value={sandboxCost}
              onChange={e => setSandboxCost(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹10,000</span>
              <span>₹5 Lakhs</span>
              <span>₹10 Lakhs</span>
            </div>
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px]">Computed Prioritization Result:</span>
            <div className="font-mono text-emerald-300 font-bold">{sandboxResult.formulaBreakdown}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Priority Tier</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                sandboxResult.tier === 'Critical'
                  ? 'bg-rose-500 text-white'
                  : sandboxResult.tier === 'High'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}>
                {sandboxResult.tier} Intervention
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {sandboxResult.score}
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Village Priority Interventions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Ranked Action Register (Shivpura GP)</h3>
            <p className="text-xs text-slate-500">Auto-sorted by priority score for Gram Sabha allocation</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {complaints.length} Actionable Items
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {complaints
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .map((item, index) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                    index === 0
                      ? 'bg-rose-600 text-white shadow-rose-500/20'
                      : index === 1
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    #{index + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">📍 {item.location.landmark}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 max-w-xl">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 self-end md:self-center">
                  <div className="text-right space-y-0.5 text-xs">
                    <div className="text-slate-500">
                      Severity: <strong className="text-slate-800">{item.severity}/5</strong>
                    </div>
                    <div className="text-slate-500">
                      Population: <strong className="text-slate-800">{item.affectedPopulation}</strong>
                    </div>
                    <div className="text-slate-500">
                      Est. Cost: <strong className="text-slate-800">₹{item.estimatedCostLakhs}L</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Score</div>
                    <div className="text-2xl font-black font-mono text-emerald-700">
                      {item.priorityScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
