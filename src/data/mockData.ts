import { Village, Scheme, Complaint, Household, InfrastructureAsset, User } from '../types';

export const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Rajeshwari Sharma, IAS',
    email: 'admin.district@gramverse.gov.in',
    role: 'admin',
    villageId: 'vil_shivpura',
    designation: 'District Development Officer (DDO)',
    phone: '+91 98290 11223'
  },
  panchayat: {
    id: 'usr_panchayat_01',
    name: 'Vikram Singh Shekhawat',
    email: 'sarpanch.shivpura@panchayat.gov.in',
    role: 'panchayat',
    villageId: 'vil_shivpura',
    designation: 'Sarpanch & Village Secretary',
    phone: '+91 94140 44556'
  },
  citizen: {
    id: 'usr_citizen_01',
    name: 'Rameshwar Lal Gurjar',
    email: 'rameshwar.gurjar@village.in',
    role: 'citizen',
    villageId: 'vil_shivpura',
    designation: 'Resident & Farmer (Ward 3)',
    phone: '+91 97850 77889'
  },
  survey: {
    id: 'usr_survey_01',
    name: 'Pooja Verma',
    email: 'pooja.surveyor@gramverse.ngo',
    role: 'survey',
    villageId: 'vil_shivpura',
    designation: 'Gram Mitra Field Surveyor',
    phone: '+91 96100 33445'
  }
};

export const MOCK_VILLAGES: Village[] = [
  {
    id: 'vil_shivpura',
    name: 'Shivpura',
    block: 'Chomu',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    population: 3420,
    totalHouseholds: 568,
    waterCoveragePct: 78,
    electricityCoveragePct: 94,
    sanitationCoveragePct: 86,
    roadQualityIndex: 68,
    developmentIndex: 81.4,
    activeComplaints: 7,
    resolvedComplaints: 42,
    budgetAllocatedLakhs: 48.5,
    budgetUtilizedLakhs: 37.2,
    center: [26.9855, 75.7225]
  },
  {
    id: 'vil_kalyanpur',
    name: 'Kalyanpur',
    block: 'Chomu',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    population: 2890,
    totalHouseholds: 440,
    waterCoveragePct: 59,
    electricityCoveragePct: 88,
    sanitationCoveragePct: 72,
    roadQualityIndex: 54,
    developmentIndex: 69.8,
    activeComplaints: 14,
    resolvedComplaints: 28,
    budgetAllocatedLakhs: 36.0,
    budgetUtilizedLakhs: 29.5,
    center: [27.0125, 75.7530]
  },
  {
    id: 'vil_rampur',
    name: 'Rampur Kalan',
    block: 'Amer',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    population: 4150,
    totalHouseholds: 710,
    waterCoveragePct: 84,
    electricityCoveragePct: 96,
    sanitationCoveragePct: 91,
    roadQualityIndex: 82,
    developmentIndex: 88.2,
    activeComplaints: 5,
    resolvedComplaints: 63,
    budgetAllocatedLakhs: 58.0,
    budgetUtilizedLakhs: 49.8,
    center: [27.0450, 75.6980]
  },
  {
    id: 'vil_belgaon',
    name: 'Belgaon Khurd',
    block: 'Amer',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    population: 1980,
    totalHouseholds: 315,
    waterCoveragePct: 45,
    electricityCoveragePct: 82,
    sanitationCoveragePct: 64,
    roadQualityIndex: 48,
    developmentIndex: 58.5,
    activeComplaints: 19,
    resolvedComplaints: 16,
    budgetAllocatedLakhs: 28.0,
    budgetUtilizedLakhs: 18.2,
    center: [26.9530, 75.6810]
  }
];

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: 'sch_pmkisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    shortCode: 'PM-KISAN',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    financialBenefit: '₹6,000 per year in 3 direct DBT tranches',
    description: 'Direct income support of ₹6,000 annually in three equal installments to all landholding farmer families across rural India.',
    eligibility: {
      requiresFarming: true,
      maxLandAcres: 5.0
    },
    documentsRequired: ['Aadhaar Card', 'Land Revenue Record (Jamabandi/Khatauni)', 'Active Bank Passbook with NPCI Aadhaar seeding'],
    applicationUrl: 'https://pmkisan.gov.in'
  },
  {
    id: 'sch_jjm',
    name: 'Jal Jeevan Mission (Har Ghar Jal)',
    shortCode: 'JJM',
    ministry: 'Ministry of Jal Shakti',
    category: 'Water & Sanitation',
    financialBenefit: '100% subsidized piped functional household tap connection (FHTC)',
    description: 'Providing safe and adequate drinking water through individual household tap connections to all households in rural India with 55 LPCD potable water.',
    eligibility: {},
    documentsRequired: ['Village Ration Card / Parivar ID', 'House Electricity Bill or Gram Panchayat verification'],
    applicationUrl: 'https://jaljeevanmission.gov.in'
  },
  {
    id: 'sch_pmayg',
    name: 'Pradhan Mantri Awaas Yojana - Gramin',
    shortCode: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    category: 'Housing',
    financialBenefit: '₹1,20,000 grant + 90 days MGNREGA wages + ₹12,000 toilet subsidy',
    description: 'Financial assistance to homeless and households living in kutcha/dilapidated houses for constructing a pucca dwelling unit with disaster-resilient features.',
    eligibility: {
      maxIncome: 120000,
      requiredRationCard: ['BPL', 'AAY']
    },
    documentsRequired: ['SECC 2011 Verification / Gram Sabha list', 'Aadhaar Card', 'MGNREGA Job Card', 'Bank Passbook', 'Photograph of existing kutcha house'],
    applicationUrl: 'https://pmayg.nic.in'
  },
  {
    id: 'sch_ayushman',
    name: 'Ayushman Bharat PM-JAY (Golden Card)',
    shortCode: 'PM-JAY',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'Healthcare',
    financialBenefit: '₹5,00,000 cashless secondary and tertiary hospital cover per family/year',
    description: 'Comprehensive cashless health insurance for vulnerable families covering surgical, hospitalization, and critical care procedures across empanelled hospitals.',
    eligibility: {
      maxIncome: 250000,
      requiredRationCard: ['BPL', 'AAY']
    },
    documentsRequired: ['Aadhaar Card', 'Ration Card / NFSA database match', 'Mobile phone linked with Aadhaar OTP'],
    applicationUrl: 'https://pmjay.gov.in'
  },
  {
    id: 'sch_mgnrega',
    name: 'MGNREGA Rural Employment Guarantee Scheme',
    shortCode: 'MGNREGA',
    ministry: 'Ministry of Rural Development',
    category: 'Employment',
    financialBenefit: '100 guaranteed days of wage employment at ₹266/day + social security',
    description: 'Statutory guarantee for at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.',
    eligibility: {},
    documentsRequired: ['Village Residence Proof', 'Aadhaar Card', 'Passport Photo of Family members'],
    applicationUrl: 'https://nrega.nic.in'
  },
  {
    id: 'sch_suryaghar',
    name: 'PM Surya Ghar - Muft Bijli Yojana (Rooftop Solar)',
    shortCode: 'PM-SURYA',
    ministry: 'Ministry of New & Renewable Energy',
    category: 'Solar & Energy',
    financialBenefit: 'Up to ₹78,000 direct subsidy for 1-3 kW rooftop solar plants',
    description: 'Subsidized rooftop solar power installation allowing rural households to obtain up to 300 free units of electricity per month and sell surplus to the grid.',
    eligibility: {
      maxIncome: 350000
    },
    documentsRequired: ['Electricity Connection Bill in Applicant Name', 'Rooftop Ownership Proof', 'Bank Cancelled Cheque'],
    applicationUrl: 'https://pmsuryaghar.gov.in'
  },
  {
    id: 'sch_sbm',
    name: 'Swachh Bharat Mission (Gramin) Individual Toilet',
    shortCode: 'SBM-G',
    ministry: 'Ministry of Drinking Water and Sanitation',
    category: 'Water & Sanitation',
    financialBenefit: '₹12,000 direct incentive for construction of individual sanitary latrine (IHHL)',
    description: 'Financial assistance provided to rural households to eradicate open defecation and achieve Open Defecation Free Plus status with sustainable twin-pit toilets.',
    eligibility: {
      requiresNoToilet: true
    },
    documentsRequired: ['Aadhaar Card', 'Bank Account Details', 'Geo-tagged photograph of construction site'],
    applicationUrl: 'https://swachhbharatmission.ddws.gov.in'
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp_001',
    citizenId: 'usr_citizen_01',
    citizenName: 'Rameshwar Lal Gurjar',
    citizenPhone: '+91 97850 77889',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    title: 'Damaged road near Government Middle School',
    description: 'The main link road leading to Govt Middle School has developed two large potholes after recent monsoon downpours. School bus and agricultural tractors struggle to pass, risking school children accidents.',
    category: 'Road',
    status: 'In Review',
    priorityScore: 1416.7, // (4 * 850) / 2.4
    severity: 4,
    affectedPopulation: 850,
    estimatedCostLakhs: 2.4,
    location: {
      lat: 26.9862,
      lng: 75.7238,
      landmark: 'Near Govt Middle School Gate 2, Shivpura'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-18T10:14:00Z',
    updatedAt: '2026-11-19T14:30:00Z',
    aiOutput: {
      predictedCategory: 'Road',
      confidence: 0.964,
      reasoning: 'NLP detected keywords: "road", "potholes", "school bus", "tractors", "accidents". Highest semantic similarity with Road Infrastructure category.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-18T10:14:05Z',
      isOverridden: false,
      cvDetections: [
        { label: 'Deep Asphalt Pothole', confidence: 0.92, description: 'Localized pavement depression (~45cm diameter, 12cm depth) with loose subgrade' },
        { label: 'Water Pooling', confidence: 0.88, description: 'Moisture ingress detected along edges causing structural degradation' }
      ],
      cvAnalysisSummary: 'AI CV Model identified deep surface cavity compromising vehicular transit.'
    },
    panchayatRemarks: 'Site inspection completed by JE Mukesh. Estimating tar-patching and drain culvert extension.'
  },
  {
    id: 'cmp_002',
    citizenId: 'usr_citizen_02',
    citizenName: 'Sunita Devi Meghwal',
    citizenPhone: '+91 94145 22334',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    title: 'Public handpump near Ward 4 discharging mud and rust',
    description: 'The India Mark II public handpump near Ward 4 community hall has had loose casing for 5 days. Water is muddy, red rusted and unusable for cooking or drinking.',
    category: 'Water',
    status: 'Work Order',
    priorityScore: 6000.0, // (5 * 420) / 0.35
    severity: 5,
    affectedPopulation: 420,
    estimatedCostLakhs: 0.35,
    location: {
      lat: 26.9845,
      lng: 75.7205,
      landmark: 'Opposite Community Hall, Ward 4'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-17T09:20:00Z',
    updatedAt: '2026-11-19T11:00:00Z',
    aiOutput: {
      predictedCategory: 'Water',
      confidence: 0.948,
      reasoning: 'NLP identified terms: "handpump", "drinking water", "mud", "rusty", "cooking". Highest probability assigned to Water Supply.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-17T09:20:03Z',
      isOverridden: false,
      cvDetections: [
        { label: 'Handpump Cylinder Corrosion', confidence: 0.91, description: 'Surface oxidation and mechanical wear on handle joint' },
        { label: 'Stagnant Water Pool', confidence: 0.85, description: 'Missing soak-pit drainage leading to wastewater pooling' }
      ],
      cvAnalysisSummary: 'Water asset mechanical malfunction and contamination risk.'
    },
    panchayatRemarks: 'Work order #WO-2026-89 issued to PHED mechanic for cylinder replacement.'
  },
  {
    id: 'cmp_003',
    citizenId: 'usr_citizen_03',
    citizenName: 'Bhanwar Singh Rathore',
    citizenPhone: '+91 98281 99001',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    title: 'Solar streetlight battery box damaged and unlit at night',
    description: 'The Gram Panchayat solar streetlight installed at the village crossroads has been non-functional for 2 weeks. The junction enclosure hangs open and wires are cut.',
    category: 'Electricity',
    status: 'Submitted',
    priorityScore: 2066.6, // (3 * 310) / 0.45
    severity: 3,
    affectedPopulation: 310,
    estimatedCostLakhs: 0.45,
    location: {
      lat: 26.9880,
      lng: 75.7252,
      landmark: 'Temple Crossroads, Ward 1'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-19T16:45:00Z',
    updatedAt: '2026-11-19T16:45:00Z',
    aiOutput: {
      predictedCategory: 'Electricity',
      confidence: 0.931,
      reasoning: 'NLP identified key tokens: "solar streetlight", "unlit", "wires", "battery box". Classified under Electricity / Energy.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-19T16:45:04Z',
      isOverridden: false,
      cvDetections: [
        { label: 'Electrical Enclosure Breach', confidence: 0.87, description: 'Tampered battery casing with exposed low-voltage wiring' },
        { label: 'Photovoltaic Luminaire', confidence: 0.94, description: 'Solar LED luminaire mounted on pole' }
      ],
      cvAnalysisSummary: 'Power hardware failure detected requiring battery and cable rewiring.'
    }
  },
  {
    id: 'cmp_004',
    citizenId: 'usr_citizen_04',
    citizenName: 'Sita Ram Meena',
    citizenPhone: '+91 93140 88776',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    title: 'Primary Health Sub-Center roof seepage in medicine room',
    description: 'Rain seepage through old slab in the ANM medicine store room is damaging vaccine ice-lined refrigerator cables and dressing supplies.',
    category: 'Health',
    status: 'Work Order',
    priorityScore: 2666.6, // (4 * 1200) / 1.8
    severity: 4,
    affectedPopulation: 1200,
    estimatedCostLakhs: 1.8,
    location: {
      lat: 26.9830,
      lng: 75.7212,
      landmark: 'Health Sub-Center, Shivpura'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-16T11:10:00Z',
    updatedAt: '2026-11-18T15:20:00Z',
    aiOutput: {
      predictedCategory: 'Health',
      confidence: 0.952,
      reasoning: 'NLP identified: "health sub-center", "medicine room", "vaccine", "ANM". Classified under Public Health infrastructure.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-16T11:10:04Z',
      isOverridden: false,
      cvDetections: [
        { label: 'Moisture Wall Efflorescence', confidence: 0.86, description: 'Plaster dampness and water seepage markings on masonry ceiling' }
      ],
      cvAnalysisSummary: 'Building structural water-leakage affecting healthcare cold-chain room.'
    },
    panchayatRemarks: 'Funds sanctioned under 15th Finance Commission Untied Grant for waterproof polymer coating.'
  },
  {
    id: 'cmp_005',
    citizenId: 'usr_citizen_05',
    citizenName: 'Kailash Chand Sharma',
    citizenPhone: '+91 94142 55667',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    title: 'Open drainage overflow near weekly Haat Bazaar',
    description: 'The open brick drain gets blocked by plastic and organic waste from the market, causing foul smelling stagnant water on the pedestrian walkway.',
    category: 'Sanitation',
    status: 'Resolved',
    priorityScore: 1800.0, // (3 * 600) / 1.0
    severity: 3,
    affectedPopulation: 600,
    estimatedCostLakhs: 1.0,
    location: {
      lat: 26.9870,
      lng: 75.7210,
      landmark: 'Shivpura Weekly Market Ground'
    },
    imageUrl: 'https://images.unsplash.com/photo-1618060932014-4deda4932554?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-12T08:00:00Z',
    updatedAt: '2026-11-15T17:00:00Z',
    aiOutput: {
      predictedCategory: 'Sanitation',
      confidence: 0.915,
      reasoning: 'NLP identified terms: "drainage", "overflow", "stagnant water", "foul smell". Categorized as Sanitation / Drainage.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-12T08:00:03Z',
      isOverridden: false,
      cvDetections: [
        { label: 'Blocked Drainage Trench', confidence: 0.89, description: 'Solid waste accumulation impeding gravity flow of greywater' }
      ],
      cvAnalysisSummary: 'Drainage blockage with hygiene hazard in high footfall commercial zone.'
    },
    panchayatRemarks: 'Cleaned by sanitation team on 15 Nov. Cement slabs installed over the open drain.'
  }
];

export const MOCK_HOUSEHOLDS: Household[] = [
  {
    id: 'hh_001',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    headName: 'Rameshwar Lal Gurjar',
    aadhaarLastFour: '4481',
    familySize: 5,
    annualIncome: 95000,
    casteCategory: 'OBC',
    rationCardType: 'BPL',
    landHoldingAcres: 1.8,
    drinkingWaterSource: 'Public Handpump',
    hasSanitationToilet: true,
    hasElectricity: true,
    isKisanRegistered: true,
    matchedSchemeIds: ['sch_pmkisan', 'sch_jjm', 'sch_ayushman', 'sch_mgnrega'],
    surveyedAt: '2026-11-10T14:30:00Z',
    volunteerName: 'Pooja Verma',
    location: { lat: 26.9858, lng: 75.7228 }
  },
  {
    id: 'hh_002',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    headName: 'Mangi Lal Bairwa',
    aadhaarLastFour: '8912',
    familySize: 6,
    annualIncome: 72000,
    casteCategory: 'SC',
    rationCardType: 'AAY',
    landHoldingAcres: 0.5,
    drinkingWaterSource: 'Tap Connection',
    hasSanitationToilet: false,
    hasElectricity: true,
    isKisanRegistered: false,
    matchedSchemeIds: ['sch_pmayg', 'sch_sbm', 'sch_ayushman', 'sch_mgnrega'],
    surveyedAt: '2026-11-11T11:15:00Z',
    volunteerName: 'Pooja Verma',
    location: { lat: 26.9842, lng: 75.7215 }
  },
  {
    id: 'hh_003',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    headName: 'Geeta Devi Meena',
    aadhaarLastFour: '6620',
    familySize: 4,
    annualIncome: 110000,
    casteCategory: 'ST',
    rationCardType: 'BPL',
    landHoldingAcres: 2.4,
    drinkingWaterSource: 'Tap Connection',
    hasSanitationToilet: true,
    hasElectricity: true,
    isKisanRegistered: true,
    matchedSchemeIds: ['sch_pmkisan', 'sch_ayushman', 'sch_mgnrega', 'sch_suryaghar'],
    surveyedAt: '2026-11-12T16:00:00Z',
    volunteerName: 'Pooja Verma',
    location: { lat: 26.9875, lng: 75.7240 }
  },
  {
    id: 'hh_004',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    headName: 'Suraj Mal Saini',
    aadhaarLastFour: '1398',
    familySize: 7,
    annualIncome: 165000,
    casteCategory: 'OBC',
    rationCardType: 'APL',
    landHoldingAcres: 3.2,
    drinkingWaterSource: 'Tap Connection',
    hasSanitationToilet: true,
    hasElectricity: true,
    isKisanRegistered: true,
    matchedSchemeIds: ['sch_pmkisan', 'sch_suryaghar'],
    surveyedAt: '2026-11-14T10:45:00Z',
    volunteerName: 'Pooja Verma',
    location: { lat: 26.9882, lng: 75.7218 }
  },
  {
    id: 'hh_005',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    headName: 'Kailash Chand Sharma',
    aadhaarLastFour: '5577',
    familySize: 4,
    annualIncome: 240000,
    casteCategory: 'General',
    rationCardType: 'APL',
    landHoldingAcres: 4.0,
    drinkingWaterSource: 'Tap Connection',
    hasSanitationToilet: true,
    hasElectricity: true,
    isKisanRegistered: true,
    matchedSchemeIds: ['sch_pmkisan', 'sch_suryaghar'],
    surveyedAt: '2026-11-15T15:20:00Z',
    volunteerName: 'Pooja Verma',
    location: { lat: 26.9866, lng: 75.7255 }
  }
];

export const MOCK_INFRASTRUCTURE: InfrastructureAsset[] = [
  {
    id: 'inf_001',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    name: 'Govt Upper Primary School & Smart Classroom',
    type: 'School',
    condition: 'Good',
    location: {
      lat: 26.9864,
      lng: 75.7242,
      description: 'Ward 2, Shivpura Main Road'
    },
    installYear: 2012,
    lastInspected: '2026-10-14',
    beneficiariesCount: 380
  },
  {
    id: 'inf_002',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    name: 'Overhead RCC Water Reservoir (OHT - 150 KL)',
    type: 'Water Tank',
    condition: 'Good',
    location: {
      lat: 26.9838,
      lng: 75.7220,
      description: 'Panchayat Bhavan Campus'
    },
    installYear: 2021,
    lastInspected: '2026-11-02',
    beneficiariesCount: 2200
  },
  {
    id: 'inf_003',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    name: 'Public Handpump HP-04 (India Mark II)',
    type: 'Handpump',
    condition: 'Needs Maintenance',
    location: {
      lat: 26.9845,
      lng: 75.7205,
      description: 'Ward 4 Community Center'
    },
    installYear: 2018,
    lastInspected: '2026-11-17',
    beneficiariesCount: 420
  },
  {
    id: 'inf_004',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    name: 'Primary Health Sub-Center & Wellness Clinic',
    type: 'Health Sub-Center',
    condition: 'Needs Maintenance',
    location: {
      lat: 26.9830,
      lng: 75.7212,
      description: 'Ward 3, Near Bus Stand'
    },
    installYear: 2015,
    lastInspected: '2026-11-16',
    beneficiariesCount: 1650
  },
  {
    id: 'inf_005',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    name: 'Solar High-Mast Streetlight Array (4 x 150W)',
    type: 'Solar Streetlight',
    condition: 'Critical Repair',
    location: {
      lat: 26.9880,
      lng: 75.7252,
      description: 'Temple Chowk Main Intersection'
    },
    installYear: 2023,
    lastInspected: '2026-11-19',
    beneficiariesCount: 890
  },
  {
    id: 'inf_006',
    villageId: 'vil_shivpura',
    villageName: 'Shivpura',
    name: 'Distribution Transformer 63 kVA (JVVNL)',
    type: 'Transformer',
    condition: 'Good',
    location: {
      lat: 26.9852,
      lng: 75.7198,
      description: 'Agricultural Feeder Substation'
    },
    installYear: 2020,
    lastInspected: '2026-09-25',
    beneficiariesCount: 1400
  }
];
