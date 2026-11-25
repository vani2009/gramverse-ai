import React, { useState, useEffect } from 'react';
import { OfflineSurveyRecord } from '../../types';
import { storageService } from '../../services/storageService';
import {
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';

interface OfflineQueueProps {
  onSyncComplete?: () => void;
}

export const OfflineQueue: React.FC<OfflineQueueProps> = ({ onSyncComplete }) => {
  const [queue, setQueue] = useState<OfflineSurveyRecord[]>(storageService.getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{ count: number; backendSynced: boolean } | null>(null);

  const loadQueue = () => {
    setQueue(storageService.getOfflineQueue());
  };

  useEffect(() => {
    loadQueue();
    window.addEventListener('gramverse-storage-change', loadQueue);
    return () => window.removeEventListener('gramverse-storage-change', loadQueue);
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncSummary(null);

    try {
      const result = await storageService.syncOfflineQueue();
      setSyncSummary({ count: result.syncedCount, backendSynced: result.backendSynced });
      loadQueue();
      if (onSyncComplete) onSyncComplete();
    } catch {
      setSyncSummary({ count: 0, backendSynced: false });
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = queue.filter(q => !q.synced).length;

  return (
    <div className="space-y-4">
      {/* Sync Status Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Field Worker Offline Storage Queue
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Surveys captured without network are cached in local browser IndexedDB / LocalStorage storage and synced when connection resumes.
          </p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={pendingCount === 0 || isSyncing}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition shadow-xs flex items-center justify-center gap-2 shrink-0"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Syncing with Server...
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4" /> Sync All ({pendingCount} Pending)
            </>
          )}
        </button>
      </div>

      {syncSummary && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Successfully synchronized <strong>{syncSummary.count} survey records</strong>!
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
            {syncSummary.backendSynced ? 'FastAPI & PostGIS Synced' : 'Local Master Synced'}
          </span>
        </div>
      )}

      {/* Queue items */}
      <div className="space-y-2.5">
        {queue.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <div className="font-bold text-slate-800">Sync Queue Clean</div>
            <div>All captured field surveys have been synchronized with the backend.</div>
          </div>
        ) : (
          queue.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.synced
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : 'bg-white border-amber-200 shadow-2xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.type === 'household' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {item.type} Survey
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">ID: {item.id}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.capturedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm">
                  {item.type === 'household'
                    ? `Household: ${item.payload.headName} (Family of ${item.payload.familySize})`
                    : `Asset: ${item.payload.name} (${item.payload.condition})`}
                </div>

                <div className="text-[11px] text-slate-500">
                  📍 {item.payload.location.lat.toFixed(5)}° N, {item.payload.location.lng.toFixed(5)}° E
                </div>
              </div>

              <div className="shrink-0">
                {item.synced ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Synced to Server
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
                    <Clock className="w-3 h-3" /> Pending Sync
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
