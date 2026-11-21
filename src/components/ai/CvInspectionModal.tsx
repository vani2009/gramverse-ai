import React from 'react';
import { CvDetection } from '../../types';
import { X, Eye, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

interface CvInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  detections: CvDetection[];
  summary?: string;
  title: string;
}

export const CvInspectionModal: React.FC<CvInspectionModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  detections,
  summary,
  title
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Cpu className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Computer Vision Image Defect Analysis</h3>
              <p className="text-[11px] text-slate-500">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Important Regulatory Disclaimer banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold">AI Assistant Advisory:</strong> Detected defect labels and confidence scores are probabilistic outputs derived from computer vision inference models. They assist field officers in preliminary triaging and are <em>not presented as confirmed legal or engineering facts</em> until certified by physical site inspection.
            </div>
          </div>

          {/* Image + Detection Box Overlay */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Complaint site evidence"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-xs">No image evidence uploaded</div>
            )}

            {/* Simulated bounding box tag overlay */}
            {imageUrl && detections.length > 0 && (
              <div className="absolute top-4 left-4 bg-indigo-900/85 backdrop-blur-md border border-indigo-400/50 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>CV Model: {detections[0].label}</span>
                </div>
                <div className="text-[10px] text-indigo-200">
                  Confidence: {(detections[0].confidence * 100).toFixed(1)}% | ResNet-50 Feature Extractor
                </div>
              </div>
            )}
          </div>

          {/* Detections List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identified Visual Features ({detections.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {detections.map((det, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      {det.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{det.description}</p>
                </div>
              ))}
            </div>
          </div>

          {summary && (
            <div className="bg-slate-100/70 rounded-xl p-3 text-xs text-slate-700 border border-slate-200">
              <strong className="text-slate-900 font-semibold">Automated Diagnostic Summary:</strong> {summary}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
