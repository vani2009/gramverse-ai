import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { AiService } from '../../services/aiService';
import {
  Camera,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Info,
  ShieldAlert,
  Eye
} from 'lucide-react';

interface SubmitComplaintProps {
  village: Village;
  onSubmitted: (complaint: Complaint) => void;
}

const SAMPLE_DEMO_PHOTOS = [
  {
    title: 'Pothole on Road near School',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    categoryHint: 'Road' as ComplaintCategory,
    defaultDesc: 'The road near the school is damaged with two deep potholes after recent monsoon rain. School buses and cyclists face danger.'
  },
  {
    title: 'Muddy Rusted Handpump',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    categoryHint: 'Water' as ComplaintCategory,
    defaultDesc: 'The public handpump near Ward 4 is discharging muddy and rusted water. Casing joint is loose and families cannot drink.'
  },
  {
    title: 'Broken Solar Light Junction',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    categoryHint: 'Electricity' as ComplaintCategory,
    defaultDesc: 'The solar streetlight at the temple crossroad has been dark for a week. The battery enclosure box is hanging broken.'
  }
];

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({ village, onSubmitted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('Road');
  const [landmark, setLandmark] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number }>({
    lat: village.center[0] + (Math.random() - 0.5) * 0.005,
    lng: village.center[1] + (Math.random() - 0.5) * 0.005
  });
  const [gpsCaptured, setGpsCaptured] = useState(true);

  // Live AI NLP prediction state
  const [nlpPrediction, setNlpPrediction] = useState<{
    predictedCategory: ComplaintCategory;
    confidence: number;
    reasoning: string;
  } | null>(null);

  // Live CV detection state
  const [cvDetections, setCvDetections] = useState<any[]>([]);
  const [cvSummary, setCvSummary] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState<Complaint | null>(null);

  // Live NLP categorization when user types description
  useEffect(() => {
    if (description.trim().length > 10) {
      const pred = AiService.classifyComplaintNLP(description);
      setNlpPrediction(pred);
      setSelectedCategory(pred.predictedCategory);
    } else {
      setNlpPrediction(null);
    }
  }, [description]);

  // Update CV when image or category changes
  const handleSelectSample = (sample: typeof SAMPLE_DEMO_PHOTOS[0]) => {
    setImageUrl(sample.url);
    if (!description) {
      setDescription(sample.defaultDesc);
      setTitle(sample.title);
      setLandmark('Near Ward 2, ' + village.name);
    }
    const cvResult = AiService.analyzeImageCV(sample.categoryHint);
    setCvDetections(cvResult.detections);
    setCvSummary(cvResult.summary);
  };

  const captureBrowserGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setGpsCaptured(true);
        },
        () => {
          // Fallback to village center
          setGpsLocation({
            lat: village.center[0] + 0.001,
            lng: village.center[1] + 0.001
          });
          setGpsCaptured(true);
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const finalCategory = selectedCategory;
    const nlpFinal = nlpPrediction || AiService.classifyComplaintNLP(description);
    const cvFinal = cvDetections.length > 0 ? cvDetections : AiService.analyzeImageCV(finalCategory).detections;

    // Severity & Population estimation for priority calculation
    const severity = finalCategory === 'Water' ? 5 : finalCategory === 'Road' ? 4 : 3;
    const pop = finalCategory === 'Water' ? 420 : finalCategory === 'Road' ? 850 : 310;
    const cost = finalCategory === 'Water' ? 0.35 : finalCategory === 'Road' ? 2.4 : 0.45;
    const { score } = AiService.calculatePriorityScore(severity, pop, cost);

    const newComplaint: Complaint = {
      id: 'cmp_' + Date.now().toString().slice(-4),
      citizenId: 'usr_citizen_01',
      citizenName: 'Rameshwar Lal Gurjar',
      citizenPhone: '+91 97850 77889',
      villageId: village.id,
      villageName: village.name,
      title,
      description,
      category: finalCategory,
      status: 'Submitted',
      priorityScore: score,
      severity,
      affectedPopulation: pop,
      estimatedCostLakhs: cost,
      location: {
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        landmark: landmark || `Ward 3, ${village.name}`
      },
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiOutput: {
        predictedCategory: nlpFinal.predictedCategory,
        confidence: nlpFinal.confidence,
        reasoning: nlpFinal.reasoning,
        modelVersion: 'TF-IDF-LogReg-v1.4',
        timestamp: new Date().toISOString(),
        isOverridden: false,
        cvDetections: cvFinal,
        cvAnalysisSummary: cvSummary || 'Visual feature extraction completed.'
      }
    };

    setTimeout(() => {
      storageService.addComplaint(newComplaint);
      setIsSubmitting(false);
      setSuccessSubmitted(newComplaint);
      onSubmitted(newComplaint);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">
          Lodge Citizen Grievance & Village Complaint
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Submit text, capture geotagged GPS coordinates and upload a site photograph. The GramVerse AI engine classifies the issue and calculates priority for the Panchayat.
        </p>
      </div>

      {successSubmitted ? (
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Complaint Successfully Registered!</h3>
            <p className="text-xs text-slate-500">
              Grievance Token: <strong className="font-mono text-slate-800">#{successSubmitted.id}</strong> • Transmitted to {village.name} Gram Panchayat.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">AI Assigned Category:</span>
              <span className="font-bold text-slate-900">{successSubmitted.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NLP Confidence:</span>
              <span className="font-mono font-bold text-emerald-700">
                {(successSubmitted.aiOutput.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Computed Priority Score:</span>
              <span className="font-mono font-bold text-rose-600">
                {successSubmitted.priorityScore}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessSubmitted(null);
              setTitle('');
              setDescription('');
              setImageUrl('');
              setLandmark('');
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
          >
            Lodge Another Complaint
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
          {/* Fast Demo Sample Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Fast Demo: Click a pre-configured grievance case:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_DEMO_PHOTOS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className="p-2 text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center gap-2.5 text-xs group"
                >
                  <img src={s.url} alt={s.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-emerald-800 line-clamp-1">{s.title}</div>
                    <div className="text-[10px] text-slate-400">{s.categoryHint} Category</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Grievance Headline / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The road near the school is damaged"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain the problem in detail. E.g. Heavy rain has caused deep potholes near the school gate, school bus and tractors struggle to pass..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Live NLP Category Preview Card */}
          {nlpPrediction && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  NLP Real-Time Classification Preview
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  {(nlpPrediction.confidence * 100).toFixed(1)}% Match
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {nlpPrediction.reasoning}
              </p>
              <div className="text-[11px] text-slate-600">
                Auto-assigned category:{' '}
                <strong className="text-slate-900">{nlpPrediction.predictedCategory}</strong> (You can adjust below if needed)
              </div>
            </div>
          )}

          {/* Category selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Grievance Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
              >
                <option value="Road">Road (Potholes, culverts, street)</option>
                <option value="Water">Water (Handpump, piped supply, leaks)</option>
                <option value="Sanitation">Sanitation (Drainage, open waste, toilets)</option>
                <option value="Electricity">Electricity (Streetlights, poles, wires)</option>
                <option value="School">School (Classrooms, furniture, walls)</option>
                <option value="Health">Health (Sub-center, medicines)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Specific Landmark / Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Near Govt Middle School Gate 2"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Photo & GPS Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Image upload / preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Site Photograph Evidence
              </label>
              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-900">
                  <img src={imageUrl} alt="Uploaded site evidence" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded hover:bg-slate-900"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleSelectSample(SAMPLE_DEMO_PHOTOS[0])}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20"
                >
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 block font-medium">Click to attach photo</span>
                  <span className="text-[10px] text-slate-400">or click a demo preset above</span>
                </div>
              )}
            </div>

            {/* GPS capture */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                PostGIS GPS Coordinates
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Latitude:</span>
                  <span className="font-mono font-semibold text-slate-800">{gpsLocation.lat.toFixed(6)}° N</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Longitude:</span>
                  <span className="font-mono font-semibold text-slate-800">{gpsLocation.lng.toFixed(6)}° E</span>
                </div>
                <button
                  type="button"
                  onClick={captureBrowserGps}
                  className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-white text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Re-acquire GPS Fix
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Official Grievance will be routed directly to {village.name} GP
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>AI Analyzing & Submitting...</>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Grievance
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
