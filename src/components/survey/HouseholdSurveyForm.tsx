import React, { useState } from 'react';
import { CasteCategory, Household, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { AiService } from '../../services/aiService';
import {
  Save,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  User,
  DollarSign,
  Droplets,
  Home
} from 'lucide-react';

interface HouseholdSurveyFormProps {
  village: Village;
  onSuccess: () => void;
}

export const HouseholdSurveyForm: React.FC<HouseholdSurveyFormProps> = ({ village, onSuccess }) => {
  const isOnline = storageService.isOnline();

  const [headName, setHeadName] = useState('');
  const [aadhaarLastFour, setAadhaarLastFour] = useState('');
  const [familySize, setFamilySize] = useState(4);
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [casteCategory, setCasteCategory] = useState<CasteCategory>('OBC');
  const [rationCardType, setRationCardType] = useState<'BPL' | 'AAY' | 'APL' | 'None'>('BPL');
  const [landHoldingAcres, setLandHoldingAcres] = useState(1.5);
  const [drinkingWaterSource, setDrinkingWaterSource] = useState<'Tap Connection' | 'Public Handpump' | 'Open Well' | 'Tanker'>('Public Handpump');
  const [hasSanitationToilet, setHasSanitationToilet] = useState(false);
  const [hasElectricity, setHasElectricity] = useState(true);
  const [isKisanRegistered, setIsKisanRegistered] = useState(true);

  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number }>({
    lat: village.center[0] + (Math.random() - 0.5) * 0.004,
    lng: village.center[1] + (Math.random() - 0.5) * 0.004
  });

  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim() || aadhaarLastFour.length !== 4) return;

    // Evaluate matched schemes
    const testProfile: Partial<Household> = {
      annualIncome,
      landHoldingAcres,
      rationCardType,
      casteCategory,
      drinkingWaterSource,
      hasSanitationToilet,
      isKisanRegistered
    };
    const { eligible } = AiService.matchSchemes(testProfile);
    const matchedSchemeIds = eligible.map(e => e.scheme.id);

    const householdPayload: Household = {
      id: 'hh_' + Date.now().toString().slice(-4),
      villageId: village.id,
      villageName: village.name,
      headName,
      aadhaarLastFour,
      familySize,
      annualIncome,
      casteCategory,
      rationCardType,
      landHoldingAcres,
      drinkingWaterSource,
      hasSanitationToilet,
      hasElectricity,
      isKisanRegistered,
      matchedSchemeIds,
      surveyedAt: new Date().toISOString(),
      volunteerName: 'Pooja Verma (Volunteer)',
      location: gpsLocation
    };

    if (isOnline) {
      storageService.addHousehold(householdPayload);
      setSubmittedStatus('Household record saved directly to village registry!');
    } else {
      storageService.addToOfflineQueue({
        type: 'household',
        payload: householdPayload
      });
      setSubmittedStatus('Network offline. Survey securely stored in Local Offline Sync Queue.');
    }

    setTimeout(() => {
      setSubmittedStatus(null);
      // Reset
      setHeadName('');
      setAadhaarLastFour('');
      onSuccess();
    }, 1400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Network Notice */}
      <div className={`p-3 rounded-xl border flex items-center justify-between ${
        isOnline
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-900 animate-pulse'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
          <span className="font-semibold">
            {isOnline ? 'Online Mode: Direct Server Sync' : 'Offline Mode: Stored Locally (Sync Queue)'}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/70 border border-current">
          {village.name} GP
        </span>
      </div>

      {submittedStatus && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{submittedStatus}</span>
        </div>
      )}

      {/* Section 1: Demographics */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <User className="w-3.5 h-3.5 text-emerald-600" /> 1. Head of Household & Identity
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name of Head *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rameshwar Lal Gurjar"
              value={headName}
              onChange={e => setHeadName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Aadhaar (Last 4 Digits) *</label>
            <input
              type="text"
              required
              maxLength={4}
              pattern="\d{4}"
              placeholder="e.g. 4481"
              value={aadhaarLastFour}
              onChange={e => setAadhaarLastFour(e.target.value.replace(/\D/g, ''))}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Social Category</label>
            <select
              value={casteCategory}
              onChange={e => setCasteCategory(e.target.value as CasteCategory)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
            >
              <option value="General">General</option>
              <option value="General (EWS)">General (EWS)</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Total Family Size</label>
            <input
              type="number"
              min={1}
              max={15}
              value={familySize}
              onChange={e => setFamilySize(parseInt(e.target.value))}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Socio-economic */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-sky-600" /> 2. Income & Landholding
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Annual Income (₹)</label>
            <input
              type="number"
              step={5000}
              value={annualIncome}
              onChange={e => setAnnualIncome(parseInt(e.target.value))}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ration Card Type</label>
            <select
              value={rationCardType}
              onChange={e => setRationCardType(e.target.value as any)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
            >
              <option value="BPL">BPL (Below Poverty Line)</option>
              <option value="AAY">AAY (Antyodaya)</option>
              <option value="APL">APL</option>
              <option value="None">None</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Land (Acres)</label>
            <input
              type="number"
              step={0.1}
              value={landHoldingAcres}
              onChange={e => setLandHoldingAcres(parseFloat(e.target.value))}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-mono"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isKisanRegistered}
            onChange={e => setIsKisanRegistered(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-0"
          />
          <span className="font-semibold text-slate-800">Has Jamabandi Agricultural Land Records</span>
        </label>
      </div>

      {/* Section 3: Basic Amenities */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <Droplets className="w-3.5 h-3.5 text-blue-600" /> 3. Utilities & Sanitation
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Drinking Water Source</label>
            <select
              value={drinkingWaterSource}
              onChange={e => setDrinkingWaterSource(e.target.value as any)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-hidden font-medium"
            >
              <option value="Tap Connection">Tap Connection (JJM FHTC)</option>
              <option value="Public Handpump">Public Handpump</option>
              <option value="Open Well">Open Well</option>
              <option value="Tanker">Water Tanker Supply</option>
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSanitationToilet}
                onChange={e => setHasSanitationToilet(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-800">Has Individual Sanitary Toilet (IHHL)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasElectricity}
                onChange={e => setHasElectricity(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-800">Electrified Dwelling Unit</span>
            </label>
          </div>
        </div>
      </div>

      {/* Geotagging */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Geo-Tagged: {gpsLocation.lat.toFixed(5)}° N, {gpsLocation.lng.toFixed(5)}° E</span>
        </div>
        <span className="text-emerald-700 font-bold">Accuracy: ±3.2m</span>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> Save Household Survey Record
      </button>
    </form>
  );
};
