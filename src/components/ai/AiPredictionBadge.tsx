import React, { useState } from 'react';
import { AiPredictionMetadata, ComplaintCategory } from '../../types';
import { Sparkles, Edit3, CheckCircle2, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface AiPredictionBadgeProps {
  aiOutput: AiPredictionMetadata;
  complaintId: string;
  allowOverride?: boolean;
  onOverridden?: () => void;
}

export const AiPredictionBadge: React.FC<AiPredictionBadgeProps> = ({
  aiOutput,
  complaintId,
  allowOverride = false,
  onOverridden
}) => {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedNewCategory, setSelectedNewCategory] = useState<ComplaintCategory>('Water');
  const [overrideReason, setOverrideReason] = useState('');

  const confidencePct = Math.round(aiOutput.confidence * 100);

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;

    storageService.overrideComplaintCategory(
      complaintId,
      selectedNewCategory,
      overrideReason,
      'Panchayat Secretary'
    );

    setShowOverrideModal(false);
    if (onOverridden) onOverridden();
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-xs font-semibold text-slate-800">AI NLP Categorization</span>
            <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({aiOutput.modelVersion})</span>
          </div>
        </div>

        {aiOutput.isOverridden ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Manually Overridden
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> AI Validated
          </span>
        )}
      </div>

      {/* Prediction & Confidence meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600">
            Predicted:{' '}
            <strong className="text-slate-900 font-semibold">
              {aiOutput.isOverridden ? aiOutput.overriddenCategory : aiOutput.predictedCategory}
            </strong>
            {aiOutput.isOverridden && (
              <span className="text-slate-400 line-through text-[11px] ml-1.5">
                (was {aiOutput.predictedCategory})
              </span>
            )}
          </span>
          <span className="font-mono font-semibold text-slate-700">{confidencePct}% confidence</span>
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              confidencePct >= 90 ? 'bg-emerald-500' : confidencePct >= 75 ? 'bg-sky-500' : 'bg-amber-500'
            }`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Explanation text */}
      <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{aiOutput.reasoning}</span>
      </p>

      {/* Override Info if already overridden */}
      {aiOutput.isOverridden && aiOutput.overrideReason && (
        <div className="text-[11px] bg-amber-50/70 border border-amber-100 text-amber-900 p-2 rounded-lg">
          <strong>Official Note:</strong> {aiOutput.overrideReason}
        </div>
      )}

      {/* Allow authorized Panchayat officials to correct incorrect complaint category */}
      {allowOverride && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => setShowOverrideModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 px-2.5 py-1 rounded-lg transition"
          >
            <Edit3 className="w-3 h-3" />
            <span>{aiOutput.isOverridden ? 'Edit Override' : 'Correct / Override Category'}</span>
          </button>
        </div>
      )}

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-600" /> Correct AI Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              As an authorized Panchayat Official, you can re-classify this grievance if the NLP model categorized it incorrectly.
            </p>

            <form onSubmit={handleSaveOverride} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Correct Category</label>
                <select
                  value={selectedNewCategory}
                  onChange={e => setSelectedNewCategory(e.target.value as ComplaintCategory)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
                >
                  <option value="Road">Road (Potholes, bridges, paving)</option>
                  <option value="Water">Water (Handpump, pipelines, quality)</option>
                  <option value="Sanitation">Sanitation (Drainage, garbage, toilets)</option>
                  <option value="Electricity">Electricity (Streetlights, wires, power)</option>
                  <option value="School">School (Classrooms, furniture, walls)</option>
                  <option value="Health">Health (Sub-center, medicines, clinic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Reclassification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="e.g. Ground inspection showed the stagnant water is due to a broken PHED water line, not road drainage."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sky-500 outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
                >
                  Confirm & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
