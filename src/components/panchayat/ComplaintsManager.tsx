import React, { useState } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { AiPredictionBadge } from '../ai/AiPredictionBadge';
import { CvInspectionModal } from '../ai/CvInspectionModal';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Filter,
  Eye,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

interface ComplaintsManagerProps {
  village: Village;
  onLocateOnMap?: (complaint: Complaint) => void;
}

export const ComplaintsManager: React.FC<ComplaintsManagerProps> = ({
  village,
  onLocateOnMap
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>(storageService.getComplaints());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showCvModal, setShowCvModal] = useState(false);
  const [activeCvComplaint, setActiveCvComplaint] = useState<Complaint | null>(null);

  // Status update state
  const [newRemarks, setNewRemarks] = useState('');

  const refreshList = () => {
    setComplaints(storageService.getComplaints());
  };

  const filtered = complaints.filter(c => {
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.location.landmark.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = (id: string, status: ComplaintStatus) => {
    storageService.updateComplaintStatus(id, status, newRemarks || undefined);
    setNewRemarks('');
    refreshList();
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint({
        ...selectedComplaint,
        status,
        panchayatRemarks: newRemarks || selectedComplaint.panchayatRemarks
      });
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Submitted
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
            <Eye className="w-3 h-3" /> In Review
          </span>
        );
      case 'Work Order':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <Wrench className="w-3 h-3" /> Work Order Issued
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Citizen Grievance & AI Triaging Management
          </h2>
          <p className="text-xs text-slate-500">
            Review citizen complaints, inspect AI NLP predictions and CV defect detections, and assign work orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Total Active:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {complaints.filter(c => c.status !== 'Resolved').length} Unresolved
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by issue, citizen name, or landmark..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="Road">Road</option>
              <option value="Water">Water</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Electricity">Electricity</option>
              <option value="School">School</option>
              <option value="Health">Health</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="In Review">In Review</option>
            <option value="Work Order">Work Order</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid / Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints List Column */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500 text-xs">
              No grievances match the selected filters.
            </div>
          ) : (
            filtered.map(cmp => (
              <div
                key={cmp.id}
                onClick={() => setSelectedComplaint(cmp)}
                className={`bg-white rounded-2xl p-4 border transition cursor-pointer hover:shadow-xs space-y-3 ${
                  selectedComplaint?.id === cmp.id
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700">
                        {cmp.category}
                      </span>
                      {getStatusBadge(cmp.status)}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(cmp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{cmp.title}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Priority Score</div>
                    <div className={`font-mono font-bold text-sm ${
                      cmp.priorityScore >= 3000 ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {cmp.priorityScore}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {cmp.description}
                </p>

                {/* AI Snippet Bar */}
                <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-600">
                      AI Categorized: <strong>{cmp.aiOutput.predictedCategory}</strong> ({(cmp.aiOutput.confidence * 100).toFixed(0)}%)
                    </span>
                    {cmp.aiOutput.isOverridden && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-semibold">
                        Overridden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {cmp.imageUrl && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveCvComplaint(cmp);
                          setShowCvModal(true);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> CV Analysis ({cmp.aiOutput.cvDetections.length})
                      </button>
                    )}
                    {onLocateOnMap && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onLocateOnMap(cmp);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" /> Map
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Citizen: <strong>{cmp.citizenName}</strong></span>
                  <span>📍 {cmp.location.landmark}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Complaint Detail Panel */}
        <div className="space-y-4">
          {selectedComplaint ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 sticky top-28">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800">Grievance File #{selectedComplaint.id}</span>
                {getStatusBadge(selectedComplaint.status)}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{selectedComplaint.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {/* Citizen info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-900">{selectedComplaint.citizenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-900">{selectedComplaint.citizenPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-700">{selectedComplaint.location.landmark}</span>
                </div>
              </div>

              {/* AI Prediction & Category Override Component */}
              <AiPredictionBadge
                aiOutput={selectedComplaint.aiOutput}
                complaintId={selectedComplaint.id}
                allowOverride={true}
                onOverridden={() => {
                  refreshList();
                  const updated = storageService.getComplaints().find(c => c.id === selectedComplaint.id);
                  if (updated) setSelectedComplaint(updated);
                }}
              />

              {/* CV Image preview */}
              {selectedComplaint.imageUrl && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Uploaded Evidence Photo</span>
                    <button
                      onClick={() => {
                        setActiveCvComplaint(selectedComplaint);
                        setShowCvModal(true);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      Open CV Inspector
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      setActiveCvComplaint(selectedComplaint);
                      setShowCvModal(true);
                    }}
                    className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 cursor-pointer group"
                  >
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Complaint"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                      Click to inspect CV detections
                    </div>
                  </div>
                </div>
              )}

              {/* Priority Calculation Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Transparent Priority Score:</span>
                  <span className="font-bold text-rose-600 font-mono text-sm">{selectedComplaint.priorityScore}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Formula: (Severity [{selectedComplaint.severity}/5] × {selectedComplaint.affectedPopulation} pop) ÷ ₹{selectedComplaint.estimatedCostLakhs}L
                </p>
              </div>

              {/* Status Workflow Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">Official Action / Remarks</label>
                <input
                  type="text"
                  placeholder="Add resolution or inspection notes..."
                  value={newRemarks}
                  onChange={e => setNewRemarks(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedComplaint.id, 'In Review')}
                    className="p-2 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition"
                  >
                    Mark In Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedComplaint.id, 'Work Order')}
                    className="p-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                  >
                    Issue Work Order
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedComplaint.id, 'Resolved')}
                    className="col-span-2 p-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
                  >
                    Mark Issue Resolved
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
              Select a grievance from the list to view its complete AI prediction telemetry, inspect photos, and update workflow status.
            </div>
          )}
        </div>
      </div>

      {/* CV Inspector Modal */}
      {showCvModal && activeCvComplaint && (
        <CvInspectionModal
          isOpen={showCvModal}
          onClose={() => setShowCvModal(false)}
          imageUrl={activeCvComplaint.imageUrl}
          detections={activeCvComplaint.aiOutput.cvDetections}
          summary={activeCvComplaint.aiOutput.cvAnalysisSummary}
          title={activeCvComplaint.title}
        />
      )}
    </div>
  );
};
