import { ComplaintCategory, CvDetection, Household, Scheme } from '../types';
import { MOCK_SCHEMES } from '../data/mockData';

// Keywords dictionary for TF-IDF / Logistic Regression simulation with Indian Multilingual Support
const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  Road: [
    'road', 'pothole', 'street', 'asphalt', 'tar', 'bridge', 'culvert', 'muddy path', 'bus', 'tractor', 'traffic', 'crater', 'divider',
    'सड़क', 'सडक', 'रास्ता', 'खड्डा', 'खड्डे', 'पुलिया', 'कीचड़', 'डामर',
    'रस्ता', 'खड्डे', 'डांबर', 'वाहतूक', 'रास्ता',
    'রাস্তা', 'পথ', 'খানাখন্দ',
    'రోడ్డు', 'రహదారి', 'గుంతలు',
    'சாலை', 'பாதை', 'குழி',
    'રસ્તો', 'માર્ગ', 'ખાડા',
    'ರಸ್ತೆ', 'ಗುಂಡಿಗಳು',
    'റോഡ്', 'കുഴികൾ',
    'ਸੜਕ', 'ਖੱਡੇ',
    'ରାସ୍ତା', 'ଖାଲ'
  ],
  Water: [
    'water', 'handpump', 'tap', 'pipeline', 'tank', 'well', 'drinking water', 'boring', 'motor', 'supply', 'turbid', 'chlorine', 'leakage', 'jjm',
    'पानी', 'जल', 'हैंडपंप', 'नल', 'पाइप', 'टंकी', 'बोरिंग', 'पेयजल', 'कुआं', 'सप्लाई',
    'पाणी', 'हातपंप', 'नळ', 'पाईपलाईन', 'टाकी', 'विहीर', 'पिण्याचे पाणी',
    'জল', 'পানীয় জল', 'টিউবওয়েল', 'পাম্প', 'পাইপলাইন',
    'నీరు', 'తాగునీరు', 'చేతిపంపు', 'పైపులైన్', 'ట్యాంక్',
    'தண்ணீர்', 'குடிநீர்', 'கைபம்பு', 'குழாய்',
    'પાણી', 'પીવાનું પાણી', 'હેન્ડપંપ', 'નળ', 'ટાંકી',
    'ನೀರು', 'ಕುಡಿಯುವ ನೀರು', 'ಕೈಪಂಪ್', 'ಕೊಳವೆ',
    'വെള്ളം', 'കുടിവെള്ളം', 'പമ്പ്', 'പൈപ്പ്',
    'ਪਾਣੀ', 'ਪੀਣ ਵਾਲਾ ਪਾਣੀ', 'ਹੈਂਡਪੰਪ', 'ਨਲਕਾ',
    'ପାଣି', 'ପାନୀୟ ଜଳ', 'ନଳକୂଅ', 'ପାଇପ୍'
  ],
  Sanitation: [
    'garbage', 'drain', 'drainage', 'gutter', 'waste', 'smell', 'toilet', 'sewage', 'dump', 'trash', 'overflow', 'plastic', 'filth',
    'कचरा', 'नाली', 'गटर', 'गंदगी', 'सफाई', 'बदबू', 'शौचालय', 'कूड़ा', 'सीवेज',
    'कचरा', 'सांडपाणी', 'गटार', 'घाण', 'शौचालय', 'स्वच्छता',
    'আবর্জনা', 'নর্দমা', 'ময়লা', 'শৌচাগার', 'বর্জ্য',
    'చెత్త', 'మురుగు', 'కాలువ', 'మరుగుదొడ్డి', 'పారిశుధ్యం',
    'குப்பை', 'சாக்கடை', 'கழிவுநீர்', 'கழிப்பறை',
    'કચરો', 'ગટર', 'ગંદકી', 'શૌચાલય',
    'ಕಸ', 'ಚರಂಡಿ', 'ತ್ಯಾಜ್ಯ', 'ಶೌಚಾಲಯ',
    'മാലിന്യം', 'ഓട', 'ശുചിമുറി',
    'ਕੂੜਾ', 'ਨਾਲੀ', 'ਗੰਦਗੀ', 'ਟਾਇਲਟ',
    'ଆବର୍ଜନା', 'ନାଳ', 'ଅପରିଷ୍କାର', 'ଶୌଚାଳୟ'
  ],
  Electricity: [
    'electric', 'electricity', 'light', 'streetlight', 'solar', 'pole', 'wire', 'transformer', 'power', 'blackout', 'spark', 'current', 'meter',
    'बिजली', 'लाइट', 'स्ट्रीटलाइट', 'सोलर', 'खंभा', 'तार', 'ट्रांसफार्मर', 'करंट', 'अंधेरा',
    'वीज', 'पथदिवा', 'सौर', 'खांब', 'वायर', 'ट्रान्सफॉर्मर',
    'বিদ্যুৎ', 'বাতি', 'আলো', 'ট্রান্সফরমার', 'তার',
    'విద్యుత్', 'లైట్లు', 'స్తంభం', 'ట్రాన్స్‌ఫార్మర్',
    'மின்சாரம்', 'விளக்கு', 'மின் கம்பம்',
    'વીજળી', 'લાઈટ', 'થાંભલો', 'ટ્રાન્સફોર્મર',
    'ವಿದ್ಯುತ್', 'ಬೆಳಕು', 'ಕಂಬ',
    'വൈദ്യുതി', 'വെളിച്ചം', 'പോസ്റ്റ്',
    'ਬਿਜਲੀ', 'ਲਾਈਟ', 'ਖੰਭਾ',
    'ବିଦ୍ୟୁତ', 'ଆଲୋକ', 'ଖୁଣ୍ଟ'
  ],
  School: [
    'school', 'teacher', 'desk', 'blackboard', 'classroom', 'student', 'midday meal', 'boundary wall', 'playground', 'books', 'education',
    'स्कूल', 'विद्यालय', 'शाला', 'शिक्षक', 'कक्षा', 'मास्टर', 'छात्र', 'मध्याह्न भोजन',
    'शाळा', 'शिक्षक', 'वर्गखोली', 'विद्यार्थी',
    'বিদ্যালয়', 'স্কুল', 'শিক্ষক', 'শ্রেণিকক্ষ',
    'పాఠశాల', 'బడి', 'ఉపాధ్యాయుడు', 'విద్యార్థులు',
    'பள்ளி', 'ஆசிரியர்', 'வகுப்பறை', 'மாணவர்கள்',
    'શાળા', 'શિક્ષક', 'વર્ગખંડ', 'વિદ્યાર્થીઓ',
    'ಶಾಲೆ', 'ಶಿಕ್ಷಕ', 'ತರಗತಿ',
    'സ്കൂൾ', 'അധ്യാപകൻ', 'ക്ലാസ്സ്',
    'ਸਕੂਲ', 'ਅਧਿਆਪਕ', 'ਜਮਾਤ',
    'ବିଦ୍ୟାଳୟ', 'ଶିକ୍ଷକ', 'ଶ୍ରେଣୀଗୃହ'
  ],
  Health: [
    'health', 'hospital', 'dispensary', 'doctor', 'nurse', 'medicine', 'anm', 'asha', 'clinic', 'vaccine', 'injection', 'illness', 'emergency',
    'अस्पताल', 'स्वास्थ्य', 'डॉक्टर', 'दवा', 'दवाई', 'उपस्वास्थ्य केंद्र', 'टीका', 'आशा',
    'रुग्णालय', 'आरोग्य', 'दवाखाना', 'औषध', 'लस',
    'হাসপাতাল', 'স্বাস্থ্য', 'ডাক্তার', 'ওষুধ',
    'ఆసుపత్రి', 'ఆరోగ్యం', 'వైద్యుడు', 'మందులు',
    'மருத்துவமனை', 'சுகாதாரம்', 'மருத்துவர்', 'மருந்து',
    'દવાખાનું', 'હોસ્પિટલ', 'આરોગ્ય', 'ડૉક્ટર', 'દવા',
    'ಆಸ್ಪತ್ರೆ', 'ಆರೋಗ್ಯ', 'ವೈದ್ಯರು', 'ಔಷಧಿ',
    'ആശുപത്രി', 'ആരോഗ്യം', 'ഡോക്ടർ', 'മരുന്ന്',
    'ਹਸਪਤਾਲ', 'ਸਿਹਤ', 'ਡਾਕਟਰ', 'ਦਵਾਈ',
    'ଡାକ୍ତରଖାନା', 'ସ୍ୱାସ୍ଥ୍ୟ', 'ଡାକ୍ତର', 'ଔଷଧ'
  ]
};

export class AiService {
  /**
   * NLP Complaint Classifier (TF-IDF + Logistic Regression simulation)
   */
  static classifyComplaintNLP(text: string): {
    predictedCategory: ComplaintCategory;
    confidence: number;
    reasoning: string;
    modelVersion: string;
    categoryScores: Record<ComplaintCategory, number>;
  } {
    const lower = text.toLowerCase();
    const scores: Record<ComplaintCategory, number> = {
      Road: 0.1,
      Water: 0.1,
      Sanitation: 0.1,
      Electricity: 0.1,
      School: 0.1,
      Health: 0.1
    };

    let totalHits = 0;
    const detectedKeywords: { category: ComplaintCategory; word: string }[] = [];

    (Object.keys(CATEGORY_KEYWORDS) as ComplaintCategory[]).forEach(cat => {
      CATEGORY_KEYWORDS[cat].forEach(kw => {
        if (lower.includes(kw)) {
          scores[cat] += 1.8;
          totalHits++;
          detectedKeywords.push({ category: cat, word: kw });
        }
      });
    });

    // Determine top category
    let bestCat: ComplaintCategory = 'Road';
    let maxScore = -1;

    (Object.keys(scores) as ComplaintCategory[]).forEach(cat => {
      if (scores[cat] > maxScore) {
        maxScore = scores[cat];
        bestCat = cat;
      }
    });

    // Softmax-like normalized confidence
    const sumExp = Object.values(scores).reduce((a, b) => a + Math.exp(b / 2), 0);
    const topExp = Math.exp(maxScore / 2);
    let confidence = Math.min(0.985, Math.max(0.68, topExp / sumExp));

    // Explanation formulation
    const matchedTokens = detectedKeywords.filter(k => k.category === bestCat).map(k => `"${k.word}"`);
    let reasoning = '';
    if (matchedTokens.length > 0) {
      reasoning = `NLP Model detected high semantic correlation with key tokens: ${matchedTokens.slice(0, 4).join(', ')}. Scored ${(confidence * 100).toFixed(1)}% match against training corpus.`;
    } else {
      reasoning = `General vocabulary processed. Closest lexical cluster mapped to ${bestCat} infrastructure with moderate confidence.`;
      confidence = 0.72;
    }

    return {
      predictedCategory: bestCat,
      confidence: parseFloat(confidence.toFixed(3)),
      reasoning,
      modelVersion: 'TF-IDF-LogReg-v1.4',
      categoryScores: scores
    };
  }

  /**
   * Computer Vision Image Defect Detector (Transfer Learning / ResNet / YOLO simulation)
   */
  static analyzeImageCV(categoryHint: ComplaintCategory): {
    detections: CvDetection[];
    summary: string;
  } {
    switch (categoryHint) {
      case 'Road':
        return {
          detections: [
            { label: 'Pavement Surface Pothole', confidence: 0.94, description: 'Depressed asphalt crater with exposed ballast aggregate' },
            { label: 'Longitudinal Bitumen Cracking', confidence: 0.87, description: 'Subgrade moisture erosion along edge berm' }
          ],
          summary: 'Visible physical road damage identified with structural erosion.'
        };
      case 'Water':
        return {
          detections: [
            { label: 'Handpump Mechanical Flange Rust', confidence: 0.92, description: 'Iron oxidation and discolored discharge runoff' },
            { label: 'Standing Wastewater Ponding', confidence: 0.89, description: 'Puddle accumulation lacking proper drainage run' }
          ],
          summary: 'Water facility mechanical fault and sanitary hazard identified.'
        };
      case 'Electricity':
        return {
          detections: [
            { label: 'Exposed Battery/Wiring Box', confidence: 0.91, description: 'Open enclosure with severed connection cables' },
            { label: 'PV Luminaire Hardware', confidence: 0.95, description: 'Pole-mounted monocrystalline solar frame' }
          ],
          summary: 'Electrical safety breach and disrupted power luminaire confirmed.'
        };
      case 'Sanitation':
        return {
          detections: [
            { label: 'Solid Waste Siltation', confidence: 0.93, description: 'Municipal plastic and organic debris block in open culvert' },
            { label: 'Greywater Spillage', confidence: 0.88, description: 'Over-the-bank surface overflow onto walkway' }
          ],
          summary: 'Sanitation obstruction causing localized public health hazard.'
        };
      case 'School':
        return {
          detections: [
            { label: 'Structural Wall Peeling/Cracking', confidence: 0.89, description: 'Damaged plaster on exterior classroom wall' },
            { label: 'Damaged Furniture Hardware', confidence: 0.84, description: 'Unusable dual-desk iron bench frames' }
          ],
          summary: 'Educational asset infrastructure defects requiring repair.'
        };
      case 'Health':
        return {
          detections: [
            { label: 'Ceiling Moisture Ingress', confidence: 0.91, description: 'Dampness patch with fungal mold marks on concrete slab' },
            { label: 'Floor Tile Fractures', confidence: 0.82, description: 'Dislodged ceramic sanitary tiles' }
          ],
          summary: 'Clinical facility dampness and safety risk detected.'
        };
      default:
        return {
          detections: [
            { label: 'Infrastructure Defect', confidence: 0.85, description: 'General asset maintenance issue detected' }
          ],
          summary: 'Potential defect detected on site image.'
        };
    }
  }

  /**
   * Rule-based Development Prioritization Scoring
   * Score = (Severity [1-5] * Population Affected) / Estimated Cost in Lakhs
   */
  static calculatePriorityScore(
    severity: number,
    affectedPopulation: number,
    estimatedCostLakhs: number
  ): {
    score: number;
    tier: 'Critical' | 'High' | 'Medium' | 'Routine';
    formulaBreakdown: string;
  } {
    const cost = Math.max(0.1, estimatedCostLakhs);
    const rawScore = (severity * affectedPopulation) / cost;
    const rounded = Math.round(rawScore * 10) / 10;

    let tier: 'Critical' | 'High' | 'Medium' | 'Routine' = 'Routine';
    if (rounded >= 3000) tier = 'Critical';
    else if (rounded >= 1500) tier = 'High';
    else if (rounded >= 700) tier = 'Medium';

    return {
      score: rounded,
      tier,
      formulaBreakdown: `(${severity} Severity × ${affectedPopulation} People) ÷ ₹${cost.toFixed(2)} Lakhs = ${rounded}`
    };
  }

  /**
   * Rule-based Scheme Eligibility Engine
   */
  static matchSchemes(household: Partial<Household>): {
    eligible: { scheme: Scheme; reasons: string[] }[];
    ineligible: { scheme: Scheme; missingCriteria: string[] }[];
  } {
    const eligible: { scheme: Scheme; reasons: string[] }[] = [];
    const ineligible: { scheme: Scheme; missingCriteria: string[] }[] = [];

    MOCK_SCHEMES.forEach(scheme => {
      const reasons: string[] = [];
      const missing: string[] = [];

      const crit = scheme.eligibility;

      // Farming check
      if (crit.requiresFarming) {
        if (household.isKisanRegistered || (household.landHoldingAcres && household.landHoldingAcres > 0)) {
          reasons.push(`Registered farmer with ${household.landHoldingAcres || 0} acres land`);
        } else {
          missing.push('Requires agricultural land ownership in Jamabandi records');
        }
      }

      // Max land check
      if (crit.maxLandAcres !== undefined && household.landHoldingAcres !== undefined) {
        if (household.landHoldingAcres <= crit.maxLandAcres) {
          reasons.push(`Landholding (${household.landHoldingAcres} ac) is within limit (≤ ${crit.maxLandAcres} ac)`);
        } else {
          missing.push(`Landholding exceeds max limit of ${crit.maxLandAcres} acres`);
        }
      }

      // Max income check
      if (crit.maxIncome !== undefined && household.annualIncome !== undefined) {
        if (household.annualIncome <= crit.maxIncome) {
          reasons.push(`Annual income ₹${household.annualIncome.toLocaleString('en-IN')} is within ceiling (≤ ₹${crit.maxIncome.toLocaleString('en-IN')})`);
        } else {
          missing.push(`Annual income ₹${household.annualIncome.toLocaleString('en-IN')} exceeds threshold of ₹${crit.maxIncome.toLocaleString('en-IN')}`);
        }
      }

      // Ration card check
      if (crit.requiredRationCard && household.rationCardType) {
        if (crit.requiredRationCard.includes(household.rationCardType)) {
          reasons.push(`Holds ${household.rationCardType} ration card under NFSA`);
        } else {
          missing.push(`Requires ${crit.requiredRationCard.join(' or ')} card (Current: ${household.rationCardType})`);
        }
      }

      // Sanitation check
      if (crit.requiresNoToilet) {
        if (!household.hasSanitationToilet) {
          reasons.push('Household does not currently have an Individual Sanitary Latrine (IHHL)');
        } else {
          missing.push('Household already has a constructed toilet facility');
        }
      }

      // JJM / MGNREGA universal checks
      if (scheme.id === 'sch_jjm') {
        if (household.drinkingWaterSource !== 'Tap Connection') {
          reasons.push('Household lacks functional piped tap water connection');
        } else {
          reasons.push('Eligible for community water quality testing & O&M scheme');
        }
      }

      if (scheme.id === 'sch_mgnrega') {
        reasons.push('Statutory 100 days wage guarantee open to all rural adult job seekers');
      }

      if (missing.length === 0) {
        eligible.push({ scheme, reasons });
      } else {
        ineligible.push({ scheme, missingCriteria: missing });
      }
    });

    return { eligible, ineligible };
  }
}
