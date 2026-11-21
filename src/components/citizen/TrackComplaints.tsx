import React from 'react';
import { Complaint, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { Clock, Eye, Wrench, CheckCircle2, AlertCircle, MapPin, Sparkles } from 'lucide-react';

interface TrackComplaintsProps {
  village: Village;
}

export const TrackComplaints: React.FC<TrackComplaintsProps> = ({ village }) => {
  const allComplaints = storageService.getComplaints();
  // Filter for Rameshwar Lal or all village complaints for demo
  const complaints = allComplaints.filter(c => c.villageId === village.id);

  const getStatusStep = (status: Complaint['status']) => {
    switch (status) {
      case 'Submitted': return 1;
      case 'In Review': return 2;
      case 'Work Order': return 3;
      case 'Resolved': return 4;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Track My Grievance Status</h2>
          <p className="text-xs text-slate-500">
            Real-time status tracking, inspection notes, and work order progress for submitted complaints.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {complaints.length} Records
        </span>
      </div>

      <div className="space-y-4">
        {complaints.map(cmp => {
          const step = getStatusStep(cmp.status);

          return (
            <div key={cmp.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">#{cmp.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {cmp.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(cmp.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cmp.location.landmark}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{cmp.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{cmp.description}</p>
              </div>

              {/* Progress Steps Timeline */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-slate-600 relative">
                  {/* Step 1: Submitted */}
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                    step >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>1. Lodged</span>
                  </div>

                  {/* Step 2: In Review */}
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                    step >= 2 ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span>2. In Review</span>
                  </div>

                  {/* Step 3: Work Order */}
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                    step >= 3 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <span>3. Work Order</span>
                  </div>

                  {/* Step 4: Resolved */}
                  <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                    step >= 4 ? 'bg-emerald-600 border-emerald-600 text-white font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 ${step >= 4 ? 'text-white' : 'text-slate-400'}`} />
                    <span>4. Resolved</span>
                  </div>
                </div>
              </div>

              {/* AI Categorization Details & Remarks */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Classification:
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {cmp.aiOutput.predictedCategory} ({(cmp.aiOutput.confidence * 100).toFixed(0)}%)
                  </span>
                </div>

                {cmp.panchayatRemarks && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                    <strong className="text-slate-900">Panchayat Update:</strong> {cmp.panchayatRemarks}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
