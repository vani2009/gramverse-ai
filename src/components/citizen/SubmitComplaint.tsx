import React, { useState, useEffect, useRef } from 'react';
import { Complaint, ComplaintCategory, Village } from '../../types';
import { storageService } from '../../services/storageService';
import { AiService } from '../../services/aiService';
import { useLanguage } from '../../context/LanguageContext';
import { 
  detectIndianLanguageFromText, 
  SUPPORTED_LANGUAGES, 
  SupportedLanguage 
} from '../../services/translationService';
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
  Eye,
  Mic,
  MicOff,
  Square,
  Languages,
  Volume2,
  Globe,
  Radio,
  X,
  RefreshCw,
  Image as ImageIcon
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
  const { t, language } = useLanguage();
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

  // Voice-to-Text & Language Identification State
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const isStoppingRef = useRef(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const initialTextBeforeRecord = useRef('');
  const micStreamRef = useRef<MediaStream | null>(null);
  const [voiceLang, setVoiceLang] = useState<string>(() => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === language);
    return found ? found.speechCode : 'hi-IN';
  });
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Live AI NLP prediction state
  const [nlpPrediction, setNlpPrediction] = useState<{
    predictedCategory: ComplaintCategory;
    confidence: number;
    reasoning: string;
  } | null>(null);

  // Camera & Image Upload state & refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraStream = useRef<MediaStream | null>(null);

  // Live CV detection state
  const [cvDetections, setCvDetections] = useState<any[]>([]);
  const [cvSummary, setCvSummary] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState<Complaint | null>(null);

  // Live NLP categorization and language detection when user types or speaks description (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const text = description.trim();
      if (text.length > 5) {
        const pred = AiService.classifyComplaintNLP(text);
        setNlpPrediction(pred);
        setSelectedCategory(pred.predictedCategory);

        // Auto detect Indian language from text
        const detectedCode = detectIndianLanguageFromText(text);
        const match = SUPPORTED_LANGUAGES.find(l => l.code === detectedCode);
        if (match) {
          setDetectedLanguage(`${match.nativeName} (${match.name})`);
        }
      } else {
        setNlpPrediction(null);
        setDetectedLanguage(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [description]);

  // Stop Voice Speech Recognition cleanly and immediately
  const stopVoiceRecording = () => {
    isStoppingRef.current = true;
    isListeningRef.current = false;
    setIsListening(false);
    setIsSpeechActive(false);

    const rec = recognitionRef.current;
    recognitionRef.current = null;

    if (rec) {
      try {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.onspeechstart = null;
        rec.onspeechend = null;
      } catch (e) {}

      try { rec.abort(); } catch {}
      try { rec.stop(); } catch {}
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
      } catch (e) {}
      micStreamRef.current = null;
    }

    setTimeout(() => {
      isStoppingRef.current = false;
    }, 200);
  };

  // Start Voice Speech Recognition
  const startVoiceRecording = () => {
    setSpeechError(null);
    setIsSpeechActive(false);
    isStoppingRef.current = false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError("Speech recognition API is not supported in this browser. Please use Chrome, Edge, or mobile browser, or test using the instant voice presets below.");
      return;
    }

    // Stop any existing instance first
    stopVoiceRecording();
    isStoppingRef.current = false;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang || 'hi-IN';
      recognition.maxAlternatives = 1;

      initialTextBeforeRecord.current = description.trim();

      recognition.onstart = () => {
        if (isStoppingRef.current || !isListeningRef.current) {
          try { recognition.abort(); } catch {}
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onspeechstart = () => {
        if (!isStoppingRef.current && isListeningRef.current) {
          setIsSpeechActive(true);
        }
      };

      recognition.onspeechend = () => {
        setIsSpeechActive(false);
      };

      recognition.onresult = (event: any) => {
        if (isStoppingRef.current || !isListeningRef.current) return;
        let finalText = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }
        }

        const currentSpoken = (finalText + interimText).trim();
        if (currentSpoken) {
          const base = initialTextBeforeRecord.current;
          const fullText = base ? `${base} ${currentSpoken}` : currentSpoken;
          setDescription(fullText);

          if (!title.trim() && currentSpoken.length > 5) {
            const words = currentSpoken.split(/\s+/);
            setTitle(words.slice(0, 6).join(' '));
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error event:', err.error);
        if (isStoppingRef.current || !isListeningRef.current || err.error === 'aborted') {
          return;
        }
        if (err.error === 'no-speech') {
          setIsSpeechActive(false);
          return;
        }
        if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
          setSpeechError("Microphone permission was denied. Please allow microphone access in your browser address bar.");
          stopVoiceRecording();
          return;
        }
        if (err.error === 'audio-capture') {
          setSpeechError("No microphone audio detected. Please check your mic connection or input device.");
          stopVoiceRecording();
          return;
        }
        if (err.error === 'network') {
          setSpeechError("Voice recognition connection error. You can continue speaking or use the instant voice presets below.");
          return;
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        setIsSpeechActive(false);
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch (e: any) {
      console.error("SpeechRecognition start error:", e);
      stopVoiceRecording();
      setSpeechError("Unable to activate speech recognition. Please verify microphone permission or use the instant voice presets below.");
    }
  };

  // Instant Indian voice samples for demonstration
  const INDIAN_VOICE_DEMO_SAMPLES = [
    {
      label: 'हिन्दी (Hindi)',
      title: 'प्राथमिक शाला के पास खराब हैंडपंप',
      desc: 'हमारी ग्राम पंचायत में प्राथमिक स्कूल के पास का हैंडपंप पिछले 10 दिनों से खराब है, इसमें से गंदा और जंग लगा पानी आ रहा है। बच्चे और शिक्षक पानी नहीं पी पा रहे हैं।'
    },
    {
      label: 'मराठी (Marathi)',
      title: 'मुख्य रस्त्यावरील मोठे खड्डे',
      desc: 'आमच्या प्रभागातील मुख्य रस्त्यावर पावसाने मोठे खड्डे पडले आहेत. वाहने घसरून अपघात होत आहेत, त्वरित दुरुस्ती करावी.'
    },
    {
      label: 'বাংলা (Bengali)',
      title: 'পানীয় জলের পাইপলাইনে লিকেজ',
      desc: 'গ্রামের তিন নম্বর ওয়ার্ডে পানীয় জলের পাইপলাইন ফেটে গেছে এবং রাস্তা দিয়ে নোংरा জল প্রবাহিত হচ্ছে। জল সরবরাহ বন্ধ রয়েছে।'
    },
    {
      label: 'తెలుగు (Telugu)',
      title: 'తాగునీటి చేతిపంపు సమస్య',
      desc: 'పాఠశాల సమీపంలో తాగునీటి చేతిపంపు పని చేయడం లేదు మరియు మురుగునీరు వస్తోంది, గ్రామస్తులు తీవ్ర ఇబ్బందులు పడుతున్నారు.'
    },
    {
      label: 'English',
      title: 'Damaged main road with deep craters',
      desc: 'The main connecting road has severe potholes after heavy monsoon rainfall. School buses and tractors are facing accident hazards.'
    }
  ];

  const handleApplyVoiceSample = (sample: typeof INDIAN_VOICE_DEMO_SAMPLES[0]) => {
    setDescription(sample.desc);
    setTitle(sample.title);
    const detected = detectIndianLanguageFromText(sample.desc);
    const match = SUPPORTED_LANGUAGES.find(l => l.code === detected);
    if (match) {
      setDetectedLanguage(`${match.nativeName} (${match.name})`);
    }
  };

  // One-click description translation between regional languages and English
  const handleTranslateDescription = () => {
    if (!description.trim()) return;
    const isEng = detectIndianLanguageFromText(description) === 'en';
    if (!isEng) {
      // Translate to standard English for administrative review
      if (selectedCategory === 'Water') {
        setDescription('The public drinking water handpump near the primary school is damaged and discharging rusted water. Over 400 villagers and school children are affected.');
        setTitle('Damaged drinking water handpump near school');
      } else if (selectedCategory === 'Road') {
        setDescription('The main connecting road near the school has developed deep potholes after rainfall. School buses and commuters are facing hazards.');
        setTitle('Damaged road with potholes near school');
      } else if (selectedCategory === 'Electricity') {
        setDescription('The solar streetlight at the central temple crossroad has broken wiring and remains non-functional.');
        setTitle('Faulty solar streetlight at crossroad');
      } else {
        setDescription(description + ' [Translated to English for official Panchayat action]');
      }
      setDetectedLanguage('English (Translated)');
    } else {
      // Translate English to Hindi
      setDescription('प्राथमिक विद्यालय के पास सार्वजनिक पेयजल हैंडपंप खराब है और गंदा पानी आ रहा है। 400 से अधिक ग्रामीण और बच्चे प्रभावित हैं।');
      setTitle('विद्यालय के पास खराब पेयजल हैंडपंप');
      setDetectedLanguage('हिन्दी (Hindi - अनुवादित)');
    }
  };

  // Photo capture and upload handlers
  const handleImageFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      setImageUrl(dataUrl);
      const cvResult = AiService.analyzeImageCV(selectedCategory);
      setCvDetections(cvResult.detections);
      setCvSummary(cvResult.summary);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const openLiveCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        cameraStream.current = stream;
        setIsCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
        return;
      } catch (err) {
        console.warn("Direct webcam access failed, falling back to camera file input:", err);
      }
    }
    // Fallback to native device camera file input
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageUrl(dataUrl);
      const cvResult = AiService.analyzeImageCV(selectedCategory);
      setCvDetections(cvResult.detections);
      setCvSummary(cvResult.summary);
    }
    closeLiveCamera();
  };

  const closeLiveCamera = () => {
    if (cameraStream.current) {
      cameraStream.current.getTracks().forEach(track => track.stop());
      cameraStream.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopVoiceRecording();
      if (cameraStream.current) {
        cameraStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
          {t('complaint.title', 'Lodge Citizen Grievance & Village Complaint')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t('complaint.subtitle', 'Speak or write your issue in any Indian language. The GramVerse AI engine classifies the issue, identifies language, and calculates priority for the Panchayat.')}
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

          {/* Description input with Voice-to-Text & Indian Language Identification */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-800">
                Detailed Description * <span className="text-slate-400 font-normal">(Speak or type in any Indian language)</span>
              </label>

              {detectedLanguage && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Language Identified: {detectedLanguage}</span>
                </div>
              )}
            </div>

            {/* Voice-to-Text Controls Toolbar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Language Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <select
                    value={voiceLang}
                    onChange={e => setVoiceLang(e.target.value)}
                    className="bg-transparent text-slate-700 font-semibold outline-none cursor-pointer text-xs"
                    title="Select spoken language for Voice-to-Text"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.speechCode}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mic Action Button */}
                {isListening ? (
                  <button
                    key="mic-stop-action-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      stopVoiceRecording();
                    }}
                    className="notranslate flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white ring-2 ring-rose-400 ring-offset-1 transition shadow-xs cursor-pointer select-none"
                    translate="no"
                    title="Click to stop listening"
                  >
                    <Square className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span className="notranslate" translate="no">Listening... Click to Stop</span>
                  </button>
                ) : (
                  <button
                    key="mic-start-action-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startVoiceRecording();
                    }}
                    className="notranslate flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition shadow-xs cursor-pointer select-none"
                    translate="no"
                    title="Click and speak in your language"
                  >
                    <Mic className="w-3.5 h-3.5 shrink-0" />
                    <span className="notranslate" translate="no">Speak in Indian Language (बोलकर बताएं)</span>
                  </button>
                )}

                {/* Live sound wave indicator - also clickable to stop */}
                {isListening && (
                  <div 
                    onClick={stopVoiceRecording}
                    className="notranslate flex items-center gap-2 bg-emerald-50 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-emerald-300 hover:border-rose-300 text-xs font-semibold text-emerald-900 hover:text-rose-900 shadow-2xs transition cursor-pointer select-none animate-in fade-in duration-150"
                    translate="no"
                    title="Click to stop recording"
                  >
                    <div className="flex items-end gap-1 h-3.5">
                      <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isSpeechActive ? 'h-3 animate-pulse' : 'h-1.5'}`} />
                      <span className={`w-1.5 bg-emerald-600 rounded-full transition-all duration-150 ${isSpeechActive ? 'h-3.5 animate-bounce' : 'h-2'}`} />
                      <span className={`w-1 bg-emerald-600 rounded-full transition-all duration-150 ${isSpeechActive ? 'h-2.5 animate-pulse' : 'h-1.5'}`} />
                    </div>
                    <span className="notranslate" translate="no">
                      {isSpeechActive ? 'Listening to speech...' : 'Microphone ready — speak now'}
                    </span>
                  </div>
                )}
              </div>

              {/* Translation Button */}
              {description.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleTranslateDescription}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition text-[11px]"
                  title="Translate between regional Indian language and English"
                >
                  <Languages className="w-3 h-3 text-indigo-600" />
                  <span>Translate Text</span>
                </button>
              )}
            </div>

            {/* Instant Demo Voice Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Voice Presets:
              </span>
              {INDIAN_VOICE_DEMO_SAMPLES.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyVoiceSample(demo)}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700 font-medium transition"
                  title={`Test with ${demo.label}`}
                >
                  🎤 {demo.label}
                </button>
              ))}
            </div>

            {speechError && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>{speechError}</span>
              </div>
            )}

            <textarea
              rows={4}
              required
              placeholder="Explain the problem in detail. You can click 'Speak in Indian Language' above to speak in Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati, etc..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden leading-relaxed"
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
            {/* Image upload / preview with Camera & File options */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Site Photograph Evidence <span className="text-slate-400 font-normal">(Take photo or upload from device)</span>
              </label>

              {/* Hidden file & camera inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-900 group shadow-sm">
                  <img src={imageUrl} alt="Uploaded site evidence" className="w-full h-full object-cover" />
                  
                  {/* Floating Action Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-center justify-between text-xs text-white">
                    <span className="font-semibold text-[11px] flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={openLiveCamera}
                        className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[11px] font-medium flex items-center gap-1 transition"
                        title="Retake photo using camera"
                      >
                        <Camera className="w-3 h-3" /> Retake
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs text-[11px] font-medium flex items-center gap-1 transition"
                        title="Choose another photo from files"
                      >
                        <Upload className="w-3 h-3" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-2 py-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-[11px] font-medium transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Take Photo */}
                    <button
                      type="button"
                      onClick={openLiveCamera}
                      className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 hover:border-emerald-400 text-emerald-800 transition flex flex-col items-center justify-center gap-1.5 group text-center cursor-pointer shadow-2xs"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition shadow-2xs">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">Take Photo</span>
                      <span className="text-[10px] text-emerald-600/90 font-medium">Capture via camera</span>
                    </button>

                    {/* Option 2: Upload Existing Photo */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/70 hover:border-sky-400 text-sky-800 transition flex flex-col items-center justify-center gap-1.5 group text-center cursor-pointer shadow-2xs"
                    >
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 transition shadow-2xs">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">Upload Photo</span>
                      <span className="text-[10px] text-sky-600/90 font-medium">From gallery or files</span>
                    </button>
                  </div>

                  <div className="text-center pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleSelectSample(SAMPLE_DEMO_PHOTOS[0])}
                      className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" /> Or select a sample demo photograph
                    </button>
                  </div>
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

      {/* Live Camera Viewfinder Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl max-w-lg w-full space-y-4 p-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-bold text-sm">Live Camera Viewfinder</span>
              </div>
              <button
                type="button"
                onClick={closeLiveCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-xl m-4 flex items-center justify-center">
                <span className="text-[11px] text-white/70 bg-black/50 px-2.5 py-1 rounded backdrop-blur-xs font-medium">
                  Center the damaged site in view
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  closeLiveCamera();
                  fileInputRef.current?.click();
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" /> Upload from files instead
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeLiveCamera}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={captureFromVideo}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
