import React, { useState } from 'react';
import { InfrastructureAsset, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { Save, MapPin, CheckCircle2, Wrench, Building } from 'lucide-react';

interface AssetSurveyFormProps {
  village: Village;
  onSuccess: () => void;
}

export const AssetSurveyForm: React.FC<AssetSurveyFormProps> = ({ village, onSuccess }) => {
  const isOnline = storageService.isOnline();

  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<InfrastructureAsset['type']>('Handpump');
  const [condition, setCondition] = useState<InfrastructureAsset['condition']>('Good');
  const [beneficiariesCount, setBeneficiariesCount] = useState(350);
  const [landmark, setLandmark] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const [gpsLocation] = useState<{ lat: number; lng: number }>({
    lat: village.center[0] + (Math.random() - 0.5) * 0.003,
    lng: village.center[1] + (Math.random() - 0.5) * 0.003
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assetPayload: InfrastructureAsset = {
      id: 'inf_' + Date.now().toString().slice(-4),
      villageId: village.id,
      villageName: village.name,
      name,
      type: assetType,
      condition,
      location: {
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        description: landmark || `Ward 2, ${village.name}`
      },
      installYear: 2024,
      lastInspected: new Date().toISOString().split('T')[0],
      beneficiariesCount
    };

    if (isOnline) {
      storageService.addInfrastructure(assetPayload);
      setSubmittedStatus('Civic asset geotagged and registered in PostGIS layer!');
    } else {
      storageService.addToOfflineQueue({
        type: 'infrastructure',
        payload: assetPayload
      });
      setSubmittedStatus('Offline: Asset survey stored in Local Sync Queue.');
    }

    setTimeout(() => {
      setSubmittedStatus(null);
      setName('');
      setLandmark('');
      onSuccess();
    }, 1400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {submittedStatus && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{submittedStatus}</span>
        </div>
      )}

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <Building className="w-3.5 h-3.5 text-sky-600" /> Civic Asset Identification
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Asset Name / Tag *</label>
            <input
              type="text"
              required
              placeholder="e.g. Public Handpump HP-08 (Near Temple)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Asset Category</label>
              <select
                value={assetType}
                onChange={e => setAssetType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
              >
                <option value="Handpump">Handpump (Mark II)</option>
                <option value="Water Tank">Overhead Water Reservoir (OHT)</option>
                <option value="Solar Streetlight">Solar Streetlight Luminaire</option>
                <option value="Transformer">Electrical Transformer</option>
                <option value="School">School Building</option>
                <option value="Health Sub-Center">Health Sub-Center</option>
                <option value="Road Stretches">CC / Bitumen Road Culvert</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Operational Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
              >
                <option value="Good">Good (Fully Operational)</option>
                <option value="Needs Maintenance">Needs Maintenance (Minor Fault)</option>
                <option value="Critical Repair">Critical Repair (Shut Down)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Beneficiaries Count</label>
              <input
                type="number"
                min={10}
                value={beneficiariesCount}
                onChange={e => setBeneficiariesCount(parseInt(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Location Landmark</label>
              <input
                type="text"
                placeholder="e.g. Ward 4 Community Chowk"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>GPS Geotag: {gpsLocation.lat.toFixed(5)}° N, {gpsLocation.lng.toFixed(5)}° E</span>
        </div>
        <span className="text-sky-700 font-bold">Auto-Linked to PostGIS</span>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white transition shadow-sm flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> Geotag & Register Asset
      </button>
    </form>
  );
};
