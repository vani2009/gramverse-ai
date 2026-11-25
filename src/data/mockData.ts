import { Village, Scheme, Complaint, Household, InfrastructureAsset, User } from '../types';

export const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Rajeshwari Sharma, IAS',
    email: 'admin.district@gramverse.gov.in',
    role: 'admin',
    villageId: 'vil_kothri',
    designation: 'District Collector & Magistrate (Sehore, MP)',
    phone: '+91 98290 11223'
  },
  panchayat: {
    id: 'usr_panchayat_01',
    name: 'Mahendra Patel',
    email: 'sarpanch.kothri@panchayat.gov.in',
    role: 'panchayat',
    villageId: 'vil_kothri',
    designation: 'Sarpanch, Gram Panchayat Kothri Kalan',
    phone: '+91 94250 44556'
  },
  citizen: {
    id: 'usr_citizen_01',
    name: 'Rameshwar Lal Gurjar',
    email: 'rameshwar.gurjar@village.in',
    role: 'citizen',
    villageId: 'vil_kothri',
    designation: 'Resident & Farmer (Ward 3, Kothri Kalan)',
    phone: '+91 97850 77889'
  },
  survey: {
    id: 'usr_survey_01',
    name: 'Pooja Verma',
    email: 'pooja.surveyor@gramverse.ngo',
    role: 'survey',
    villageId: 'vil_kothri',
    designation: 'Gram Mitra Field Surveyor (Ashta Block)',
    phone: '+91 96100 33445'
  }
};

export const MOCK_VILLAGES: Village[] = [
  {
    id: 'vil_kothri',
    name: 'Kothri Kalan',
    block: 'Ashta',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    population: 3650,
    totalHouseholds: 590,
    waterCoveragePct: 76,
    electricityCoveragePct: 93,
    sanitationCoveragePct: 82,
    roadQualityIndex: 71,
    developmentIndex: 82.5,
    activeComplaints: 6,
    resolvedComplaints: 38,
    budgetAllocatedLakhs: 52.0,
    budgetUtilizedLakhs: 41.5,
    center: [23.0722, 76.8296]
  },
  {
    id: 'vil_amlaha',
    name: 'Amlaha',
    block: 'Ashta',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    population: 2980,
    totalHouseholds: 470,
    waterCoveragePct: 81,
    electricityCoveragePct: 95,
    sanitationCoveragePct: 88,
    roadQualityIndex: 78,
    developmentIndex: 84.0,
    activeComplaints: 4,
    resolvedComplaints: 31,
    budgetAllocatedLakhs: 44.0,
    budgetUtilizedLakhs: 36.2,
    center: [23.0850, 76.8850]
  },
  {
    id: 'vil_metwada',
    name: 'Metwada',
    block: 'Ashta',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    population: 2240,
    totalHouseholds: 360,
    waterCoveragePct: 62,
    electricityCoveragePct: 89,
    sanitationCoveragePct: 68,
    roadQualityIndex: 60,
    developmentIndex: 71.2,
    activeComplaints: 9,
    resolvedComplaints: 22,
    budgetAllocatedLakhs: 34.0,
    budgetUtilizedLakhs: 25.8,
    center: [23.0610, 76.8010]
  },
  {
    id: 'vil_bhaunra',
    name: 'Bhaunra',
    block: 'Ashta',
    district: 'Sehore',
    state: 'Madhya Pradesh',
    population: 1850,
    totalHouseholds: 295,
    waterCoveragePct: 54,
    electricityCoveragePct: 86,
    sanitationCoveragePct: 62,
    roadQualityIndex: 52,
    developmentIndex: 64.0,
    activeComplaints: 11,
    resolvedComplaints: 15,
    budgetAllocatedLakhs: 26.0,
    budgetUtilizedLakhs: 18.0,
    center: [23.0450, 76.8450]
  },
  {
    id: 'vil_bhimpur',
    name: 'Bhimpur',
    block: 'Bhimpur',
    district: 'Betul',
    state: 'Madhya Pradesh',
    population: 2500,
    totalHouseholds: 410,
    waterCoveragePct: 50,
    electricityCoveragePct: 85,
    sanitationCoveragePct: 65,
    roadQualityIndex: 55,
    developmentIndex: 67.5,
    activeComplaints: 8,
    resolvedComplaints: 19,
    budgetAllocatedLakhs: 32.0,
    budgetUtilizedLakhs: 22.4,
    center: [21.8418, 77.6212]
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
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    title: 'Damaged road near Government Middle School',
    description: 'The main link road leading to Govt Middle School has developed two large potholes after recent monsoon downpours. School bus and agricultural tractors struggle to pass, risking school children accidents.',
    category: 'Road',
    status: 'In Review',
    priorityScore: 1416.7, // (4 * 850) / 2.4
    severity: 4,
    affectedPopulation: 850,
    estimatedCostLakhs: 2.4,
    location: {
      lat: 23.0742,
      lng: 76.8320,
      landmark: 'Near Govt Middle School Gate 2, Kothri Kalan'
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
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    title: 'Public handpump near Ward 4 discharging mud and rust',
    description: 'The India Mark II public handpump near Ward 4 community hall has had loose casing for 5 days. Water is muddy, red rusted and unusable for cooking or drinking.',
    category: 'Water',
    status: 'Work Order',
    priorityScore: 6000.0, // (5 * 420) / 0.35
    severity: 5,
    affectedPopulation: 420,
    estimatedCostLakhs: 0.35,
    location: {
      lat: 23.0715,
      lng: 76.8285,
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
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    title: 'Solar streetlight battery box damaged and unlit at night',
    description: 'The Gram Panchayat solar streetlight installed at the village crossroads has been non-functional for 2 weeks. The junction enclosure hangs open and wires are cut.',
    category: 'Electricity',
    status: 'Submitted',
    priorityScore: 2066.6, // (3 * 310) / 0.45
    severity: 3,
    affectedPopulation: 310,
    estimatedCostLakhs: 0.45,
    location: {
      lat: 23.0720,
      lng: 76.8292,
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
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    title: 'Primary Health Sub-Center roof seepage in medicine room',
    description: 'Rain seepage through old slab in the ANM medicine store room is damaging vaccine ice-lined refrigerator cables and dressing supplies.',
    category: 'Health',
    status: 'Work Order',
    priorityScore: 2666.6, // (4 * 1200) / 1.8
    severity: 4,
    affectedPopulation: 1200,
    estimatedCostLakhs: 1.8,
    location: {
      lat: 23.0698,
      lng: 76.8272,
      landmark: 'Health Sub-Center, Kothri Kalan'
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
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    title: 'Open drainage overflow near weekly Haat Bazaar',
    description: 'The open brick drain gets blocked by plastic and organic waste from the market, causing foul smelling stagnant water on the pedestrian walkway.',
    category: 'Sanitation',
    status: 'Resolved',
    priorityScore: 1800.0, // (3 * 600) / 1.0
    severity: 3,
    affectedPopulation: 600,
    estimatedCostLakhs: 1.0,
    location: {
      lat: 23.0726,
      lng: 76.8299,
      landmark: 'Kothri Kalan Weekly Market Ground'
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
  },
  // Amlaha Complaints (Ashta Block)
  {
    id: 'cmp_aml_001',
    citizenId: 'usr_citizen_aml_01',
    citizenName: 'Devendra Meena',
    citizenPhone: '+91 94251 11223',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    title: 'Burnt pump motor in Amlaha primary drinking borewell',
    description: 'The 7.5 HP submersible pump installed at Amlaha community tank has burnt due to voltage fluctuations. Over 400 households have had no drinking water supply for 3 days.',
    category: 'Water',
    status: 'In Review',
    priorityScore: 5000.0,
    severity: 5,
    affectedPopulation: 400,
    estimatedCostLakhs: 0.4,
    location: {
      lat: 23.0845,
      lng: 76.8842,
      landmark: 'Near Amlaha Gram Panchayat Bhavan'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-20T08:30:00Z',
    updatedAt: '2026-11-21T10:15:00Z',
    aiOutput: {
      predictedCategory: 'Water',
      confidence: 0.97,
      reasoning: 'NLP identified: "submersible pump", "community tank", "voltage fluctuations", "no drinking water". Classified as Water Supply crisis.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-20T08:30:05Z',
      isOverridden: false,
      cvDetections: [{ label: 'Pump Motor Burnout', confidence: 0.93, description: 'Motor winding burnout and electrical breaker trip' }]
    },
    panchayatRemarks: 'Field technician deputed from Ashta tehsil headquarters. Replacement pump en route.'
  },
  {
    id: 'cmp_aml_002',
    citizenId: 'usr_citizen_aml_02',
    citizenName: 'Kamal Kishore Rathore',
    citizenPhone: '+91 98260 22334',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    title: 'Amlaha Mandi approach road shoulder eroded and collapsed',
    description: 'Heavy grain transport trucks and monsoon water flow have washed away 60 meters of road shoulder near the Krishi Upaj Mandi sub-yard, causing risk of truck overturn.',
    category: 'Road',
    status: 'Submitted',
    priorityScore: 1800.0,
    severity: 4,
    affectedPopulation: 450,
    estimatedCostLakhs: 1.0,
    location: {
      lat: 23.0862,
      lng: 76.8860,
      landmark: 'Amlaha Mandi Road Curve'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-21T12:00:00Z',
    updatedAt: '2026-11-21T12:00:00Z',
    aiOutput: {
      predictedCategory: 'Road',
      confidence: 0.95,
      reasoning: 'NLP identified terms: "road shoulder", "eroded", "Krishi Upaj Mandi", "truck overturn". Classified under Road Infrastructure.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-21T12:00:04Z',
      isOverridden: false,
      cvDetections: [{ label: 'Road Shoulder Erosion', confidence: 0.89, description: 'Subgrade washout along outer curve of bituminous carriageway' }]
    }
  },
  {
    id: 'cmp_aml_003',
    citizenId: 'usr_citizen_aml_03',
    citizenName: 'Santosh Malviya',
    citizenPhone: '+91 97550 33445',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    title: 'Loose low-hanging 11kV electrical wire across farmer fields',
    description: 'An 11kV agricultural feeder cable has sagged to within 7 feet of the ground across crop fields near Ward 2, posing severe electrocution hazard to farmers and cattle.',
    category: 'Electricity',
    status: 'Work Order',
    priorityScore: 3200.0,
    severity: 4,
    affectedPopulation: 240,
    estimatedCostLakhs: 0.3,
    location: {
      lat: 23.0838,
      lng: 76.8830,
      landmark: 'Ward 2 Agricultural Field Crossway'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-19T14:10:00Z',
    updatedAt: '2026-11-20T09:40:00Z',
    aiOutput: {
      predictedCategory: 'Electricity',
      confidence: 0.96,
      reasoning: 'NLP identified: "11kV", "electrical wire", "electrocution hazard", "hanging low". High safety hazard under Electricity.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-19T14:10:04Z',
      isOverridden: false,
      cvDetections: [{ label: 'Sagging Conductor', confidence: 0.94, description: 'Exposed HT conductor below statutory ground clearance' }]
    },
    panchayatRemarks: 'Notified MPPKVVCL Ashta division line inspector. Line tensioning scheduled.'
  },

  // Metwada Complaints (Ashta Block)
  {
    id: 'cmp_met_001',
    citizenId: 'usr_citizen_met_01',
    citizenName: 'Laxminarayan Verma',
    citizenPhone: '+91 96300 44556',
    villageId: 'vil_metwada',
    villageName: 'Metwada',
    title: 'Deep borewell dried up in Harijan Basti',
    description: 'The sole functional community borewell in Metwada Harijan Basti has dried down to silt. Women must walk 1.5 km to nearby farm tubewells.',
    category: 'Water',
    status: 'In Review',
    priorityScore: 4375.0,
    severity: 5,
    affectedPopulation: 350,
    estimatedCostLakhs: 0.4,
    location: {
      lat: 23.0618,
      lng: 76.8005,
      landmark: 'Harijan Basti Water Point, Metwada'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-20T11:00:00Z',
    updatedAt: '2026-11-21T08:30:00Z',
    aiOutput: {
      predictedCategory: 'Water',
      confidence: 0.98,
      reasoning: 'NLP identified: "borewell", "dried up", "community well", "silt", "water scarcity". Classified under Water.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-20T11:00:03Z',
      isOverridden: false,
      cvDetections: [{ label: 'Dry Borewell Discharge', confidence: 0.91, description: 'Zero discharge and sandy discharge sediment' }]
    }
  },
  {
    id: 'cmp_met_002',
    citizenId: 'usr_citizen_met_02',
    citizenName: 'Radheshyam Solanki',
    citizenPhone: '+91 97520 55667',
    villageId: 'vil_metwada',
    villageName: 'Metwada',
    title: 'Metwada weekly Haat bazaar open sewage accumulation',
    description: 'Blocked masonry canal overflowing into vegetable vendor area with pungent sewage, creating severe disease outbreak hazard.',
    category: 'Sanitation',
    status: 'Submitted',
    priorityScore: 1560.0,
    severity: 3,
    affectedPopulation: 520,
    estimatedCostLakhs: 1.0,
    location: {
      lat: 23.0605,
      lng: 76.8015,
      landmark: 'Metwada Haat Bazaar Square'
    },
    imageUrl: 'https://images.unsplash.com/photo-1618060932014-4deda4932554?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-22T09:15:00Z',
    updatedAt: '2026-11-22T09:15:00Z',
    aiOutput: {
      predictedCategory: 'Sanitation',
      confidence: 0.94,
      reasoning: 'NLP identified: "sewage", "blocked canal", "vegetable vendor", "disease outbreak". Classified under Sanitation.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-22T09:15:03Z',
      isOverridden: false,
      cvDetections: [{ label: 'Wastewater Inundation', confidence: 0.88, description: 'Stagnant blackwater pool covering commercial pathway' }]
    }
  },

  // Bhaunra Complaints (Ashta Block)
  {
    id: 'cmp_bha_001',
    citizenId: 'usr_citizen_bha_01',
    citizenName: 'Narendra Singh Thakur',
    citizenPhone: '+91 98930 66778',
    villageId: 'vil_bhaunra',
    villageName: 'Bhaunra',
    title: 'Bhaunra link road stone culvert broken by heavy trolley',
    description: 'Stone slab culvert bridging the irrigation drain on Bhaunra main link road has collapsed in the center. Light vehicles are passing on a narrow dangerous edge.',
    category: 'Road',
    status: 'In Review',
    priorityScore: 2470.6,
    severity: 4,
    affectedPopulation: 420,
    estimatedCostLakhs: 0.68,
    location: {
      lat: 23.0442,
      lng: 76.8458,
      landmark: 'Bhaunra Irrigation Canal Culvert'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-21T15:20:00Z',
    updatedAt: '2026-11-22T10:00:00Z',
    aiOutput: {
      predictedCategory: 'Road',
      confidence: 0.95,
      reasoning: 'NLP identified: "stone slab culvert", "collapsed", "link road", "dangerous edge". Classified as Road defect.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-21T15:20:04Z',
      isOverridden: false,
      cvDetections: [{ label: 'Structural Culvert Collapse', confidence: 0.96, description: 'Fractured stone lintel with void beneath road surface' }]
    }
  },
  {
    id: 'cmp_bha_002',
    citizenId: 'usr_citizen_bha_02',
    citizenName: 'Manohar Lal Yadav',
    citizenPhone: '+91 94060 77889',
    villageId: 'vil_bhaunra',
    villageName: 'Bhaunra',
    title: 'Transformer sparking with frequent power cuts in Ward 2',
    description: 'The 63 kVA transformer near Bhaunra school has severe oil leakage and sparks continuously during evening peak hours, tripping power to 180 homes.',
    category: 'Electricity',
    status: 'Submitted',
    priorityScore: 2160.0,
    severity: 4,
    affectedPopulation: 180,
    estimatedCostLakhs: 0.33,
    location: {
      lat: 23.0460,
      lng: 76.8442,
      landmark: 'Near Bhaunra Govt School Pole'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-22T14:40:00Z',
    updatedAt: '2026-11-22T14:40:00Z',
    aiOutput: {
      predictedCategory: 'Electricity',
      confidence: 0.97,
      reasoning: 'NLP identified: "transformer", "sparks", "oil leakage", "power cuts". Classified under Electricity.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-22T14:40:04Z',
      isOverridden: false,
      cvDetections: [{ label: 'Transformer Oil Seepage', confidence: 0.92, description: 'Dielectric fluid leakage on radiator fins' }]
    }
  },

  // Bhimpur Complaints (Bhimpur Block, Betul District)
  {
    id: 'cmp_bhi_001',
    citizenId: 'usr_citizen_bhi_01',
    citizenName: 'Mangal Singh Korku',
    citizenPhone: '+91 94790 88990',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    title: 'Tribal hamlet unpaved forest approach road cut off',
    description: 'The earthen forest track connecting Korku Tola to Bhimpur main market has washed out with a 4-foot deep trench. Emergency vehicles and milk collection cannot enter.',
    category: 'Road',
    status: 'In Review',
    priorityScore: 3125.0,
    severity: 5,
    affectedPopulation: 250,
    estimatedCostLakhs: 0.4,
    location: {
      lat: 21.8425,
      lng: 77.6205,
      landmark: 'Korku Tola Forest Boundary Track'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-19T09:10:00Z',
    updatedAt: '2026-11-20T11:45:00Z',
    aiOutput: {
      predictedCategory: 'Road',
      confidence: 0.96,
      reasoning: 'NLP identified: "forest track", "washed out", "trench", "emergency vehicles". Classified under Road Infrastructure.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-19T09:10:05Z',
      isOverridden: false,
      cvDetections: [{ label: 'Earthen Road Washout', confidence: 0.95, description: 'Gully erosion splitting track width by over 1.2 meters' }]
    },
    panchayatRemarks: 'MGNREGA gravel leveling and boulder pitching sanctioned.'
  },
  {
    id: 'cmp_bhi_002',
    citizenId: 'usr_citizen_bhi_02',
    citizenName: 'Durgadas Dhurve',
    citizenPhone: '+91 97130 99001',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    title: 'Handpump discharging turbid water with fluoride smell',
    description: 'Community handpump near Bhimpur Ashram School produces muddy, discolored water with chemical odor. 200 school children and residents are affected.',
    category: 'Water',
    status: 'Work Order',
    priorityScore: 4000.0,
    severity: 4,
    affectedPopulation: 300,
    estimatedCostLakhs: 0.3,
    location: {
      lat: 21.8410,
      lng: 77.6220,
      landmark: 'Opposite Bhimpur Ashram School'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-18T10:30:00Z',
    updatedAt: '2026-11-19T16:00:00Z',
    aiOutput: {
      predictedCategory: 'Water',
      confidence: 0.95,
      reasoning: 'NLP identified: "handpump", "turbid water", "fluoride smell", "school children". High urgency Water supply grievance.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-18T10:30:04Z',
      isOverridden: false,
      cvDetections: [{ label: 'Turbid Water Discharge', confidence: 0.91, description: 'High suspended solids from borehole degradation' }]
    },
    panchayatRemarks: 'Water testing kit dispatch arranged. Alternate tanker instructed.'
  },
  {
    id: 'cmp_bhi_003',
    citizenId: 'usr_citizen_bhi_03',
    citizenName: 'Smt. Shanti Bai Marskole',
    citizenPhone: '+91 96850 11223',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    title: 'Bhimpur Main Chauraha solar lights batteries dead',
    description: 'The 3 solar streetlights at Bhimpur main market junction are completely dead for 3 weeks, leaving the market junction in total darkness.',
    category: 'Electricity',
    status: 'Submitted',
    priorityScore: 1944.4,
    severity: 3,
    affectedPopulation: 350,
    estimatedCostLakhs: 0.54,
    location: {
      lat: 21.8422,
      lng: 77.6219,
      landmark: 'Bhimpur Main Chauraha Market Square'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    createdAt: '2026-11-20T17:00:00Z',
    updatedAt: '2026-11-20T17:00:00Z',
    aiOutput: {
      predictedCategory: 'Electricity',
      confidence: 0.93,
      reasoning: 'NLP identified: "solar streetlights", "dead batteries", "total darkness", "market junction". Classified under Electricity.',
      modelVersion: 'TF-IDF-LogReg-v1.4',
      timestamp: '2026-11-20T17:00:03Z',
      isOverridden: false,
      cvDetections: [{ label: 'Dead Solar Luminaire', confidence: 0.92, description: 'Depleted lithium battery unit with non-functional dusk-to-dawn sensor' }]
    }
  }
];

export const MOCK_HOUSEHOLDS: Household[] = [
  {
    id: 'hh_001',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
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
    location: { lat: 23.0725, lng: 76.8290 }
  },
  {
    id: 'hh_002',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
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
    location: { lat: 23.0718, lng: 76.8280 }
  },
  {
    id: 'hh_003',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
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
    location: { lat: 23.0738, lng: 76.8315 }
  },
  {
    id: 'hh_004',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
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
    location: { lat: 23.0728, lng: 76.8290 }
  },
  {
    id: 'hh_005',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
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
    location: { lat: 23.0730, lng: 76.8330 }
  }
];

export const MOCK_INFRASTRUCTURE: InfrastructureAsset[] = [
  {
    id: 'inf_001',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    name: 'Govt Upper Primary School & Smart Classroom',
    type: 'School',
    condition: 'Good',
    location: {
      lat: 23.0745,
      lng: 76.8320,
      description: 'Ward 2, Kothri Kalan Main Road'
    },
    installYear: 2012,
    lastInspected: '2026-10-14',
    beneficiariesCount: 380
  },
  {
    id: 'inf_002',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    name: 'Overhead RCC Water Reservoir (OHT - 150 KL)',
    type: 'Water Tank',
    condition: 'Good',
    location: {
      lat: 23.0732,
      lng: 76.8305,
      description: 'Panchayat Bhavan Campus'
    },
    installYear: 2021,
    lastInspected: '2026-11-02',
    beneficiariesCount: 2200
  },
  {
    id: 'inf_003',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    name: 'Public Handpump HP-04 (India Mark II)',
    type: 'Handpump',
    condition: 'Needs Maintenance',
    location: {
      lat: 23.0715,
      lng: 76.8285,
      description: 'Ward 4 Community Center'
    },
    installYear: 2018,
    lastInspected: '2026-11-17',
    beneficiariesCount: 420
  },
  {
    id: 'inf_004',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    name: 'Primary Health Sub-Center & Wellness Clinic',
    type: 'Health Sub-Center',
    condition: 'Needs Maintenance',
    location: {
      lat: 23.0698,
      lng: 76.8272,
      description: 'Ward 3, Near Bus Stand'
    },
    installYear: 2015,
    lastInspected: '2026-11-16',
    beneficiariesCount: 1650
  },
  {
    id: 'inf_005',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    name: 'Solar High-Mast Streetlight Array (4 x 150W)',
    type: 'Solar Streetlight',
    condition: 'Critical Repair',
    location: {
      lat: 23.0720,
      lng: 76.8292,
      description: 'Temple Chowk Main Intersection'
    },
    installYear: 2023,
    lastInspected: '2026-11-19',
    beneficiariesCount: 890
  },
  {
    id: 'inf_006',
    villageId: 'vil_kothri',
    villageName: 'Kothri Kalan',
    name: 'Distribution Transformer 63 kVA (MPPKVVCL)',
    type: 'Transformer',
    condition: 'Good',
    location: {
      lat: 23.0740,
      lng: 76.8300,
      description: 'Agricultural Feeder Substation'
    },
    installYear: 2020,
    lastInspected: '2026-09-25',
    beneficiariesCount: 1400
  },
  // Amlaha Infrastructure (Ashta Block)
  {
    id: 'inf_aml_001',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    name: 'Amlaha JJM Overhead Water Reservoir (100 KL)',
    type: 'Water Tank',
    condition: 'Good',
    location: {
      lat: 23.0855,
      lng: 76.8855,
      description: 'Near Amlaha Water Works Compound'
    },
    installYear: 2022,
    lastInspected: '2026-11-10',
    beneficiariesCount: 1850
  },
  {
    id: 'inf_aml_002',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    name: 'Govt Middle School Amlaha',
    type: 'School',
    condition: 'Good',
    location: {
      lat: 23.0865,
      lng: 76.8840,
      description: 'Amlaha Main Village Road'
    },
    installYear: 2010,
    lastInspected: '2026-10-22',
    beneficiariesCount: 310
  },
  {
    id: 'inf_aml_003',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    name: 'Amlaha 33/11 kV Power Substation',
    type: 'Transformer',
    condition: 'Good',
    location: {
      lat: 23.0820,
      lng: 76.8820,
      description: 'Feeder Substation Road'
    },
    installYear: 2019,
    lastInspected: '2026-09-15',
    beneficiariesCount: 2980
  },
  {
    id: 'inf_aml_004',
    villageId: 'vil_amlaha',
    villageName: 'Amlaha',
    name: 'Amlaha Health Sub-Center',
    type: 'Health Sub-Center',
    condition: 'Good',
    location: {
      lat: 23.0848,
      lng: 76.8868,
      description: 'Amlaha Village Square'
    },
    installYear: 2017,
    lastInspected: '2026-10-18',
    beneficiariesCount: 1400
  },

  // Metwada Infrastructure (Ashta Block)
  {
    id: 'inf_met_001',
    villageId: 'vil_metwada',
    villageName: 'Metwada',
    name: 'Metwada Primary Health Sub-Center',
    type: 'Health Sub-Center',
    condition: 'Needs Maintenance',
    location: {
      lat: 23.0622,
      lng: 76.8022,
      description: 'Metwada Main Entrance'
    },
    installYear: 2014,
    lastInspected: '2026-11-05',
    beneficiariesCount: 1200
  },
  {
    id: 'inf_met_002',
    villageId: 'vil_metwada',
    villageName: 'Metwada',
    name: 'Metwada Govt Primary School',
    type: 'School',
    condition: 'Good',
    location: {
      lat: 23.0612,
      lng: 76.8008,
      description: 'Ward 1 School Lane'
    },
    installYear: 2011,
    lastInspected: '2026-10-12',
    beneficiariesCount: 220
  },
  {
    id: 'inf_met_003',
    villageId: 'vil_metwada',
    villageName: 'Metwada',
    name: 'Metwada Solar Pump Community Well',
    type: 'Water Tank',
    condition: 'Needs Maintenance',
    location: {
      lat: 23.0602,
      lng: 76.8012,
      description: 'Harijan Basti Water Point'
    },
    installYear: 2021,
    lastInspected: '2026-11-14',
    beneficiariesCount: 650
  },

  // Bhaunra Infrastructure (Ashta Block)
  {
    id: 'inf_bha_001',
    villageId: 'vil_bhaunra',
    villageName: 'Bhaunra',
    name: 'Bhaunra Gram Panchayat Bhavan',
    type: 'School',
    condition: 'Good',
    location: {
      lat: 23.0452,
      lng: 76.8448,
      description: 'Bhaunra Village Center'
    },
    installYear: 2016,
    lastInspected: '2026-10-25',
    beneficiariesCount: 1100
  },
  {
    id: 'inf_bha_002',
    villageId: 'vil_bhaunra',
    villageName: 'Bhaunra',
    name: 'Bhaunra JJM Community Water Standpost',
    type: 'Handpump',
    condition: 'Needs Maintenance',
    location: {
      lat: 23.0448,
      lng: 76.8438,
      description: 'Near Bhaunra Temple Square'
    },
    installYear: 2020,
    lastInspected: '2026-11-08',
    beneficiariesCount: 520
  },

  // Bhimpur Infrastructure (Bhimpur Block, Betul District)
  {
    id: 'inf_bhi_001',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    name: 'Bhimpur Tribal Welfare Ashram School',
    type: 'School',
    condition: 'Good',
    location: {
      lat: 21.8428,
      lng: 77.6215,
      description: 'Bhimpur High School Campus'
    },
    installYear: 2008,
    lastInspected: '2026-10-15',
    beneficiariesCount: 480
  },
  {
    id: 'inf_bhi_002',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    name: 'Bhimpur Primary Health Centre (PHC)',
    type: 'Health Sub-Center',
    condition: 'Good',
    location: {
      lat: 21.8408,
      lng: 77.6208,
      description: 'Main Road Hospital Complex'
    },
    installYear: 2013,
    lastInspected: '2026-11-01',
    beneficiariesCount: 3200
  },
  {
    id: 'inf_bhi_003',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    name: 'Bhimpur Main Chauraha Streetlight Cluster',
    type: 'Solar Streetlight',
    condition: 'Critical Repair',
    location: {
      lat: 21.8422,
      lng: 77.6219,
      description: 'Market Junction High Mast'
    },
    installYear: 2022,
    lastInspected: '2026-11-20',
    beneficiariesCount: 1200
  },
  {
    id: 'inf_bhi_004',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    name: 'Bhimpur-Betul Connecting MDR Road Section',
    type: 'Road Stretches',
    condition: 'Good',
    location: {
      lat: 21.8420,
      lng: 77.6215,
      description: 'Major District Road Segment'
    },
    installYear: 2019,
    lastInspected: '2026-09-30',
    beneficiariesCount: 4500
  },
  {
    id: 'inf_bhi_005',
    villageId: 'vil_bhimpur',
    villageName: 'Bhimpur',
    name: 'Bhimpur Deep Borewell Dual Solar Pump',
    type: 'Handpump',
    condition: 'Needs Maintenance',
    location: {
      lat: 21.8412,
      lng: 77.6225,
      description: 'Opposite Community Hall'
    },
    installYear: 2021,
    lastInspected: '2026-11-18',
    beneficiariesCount: 680
  }
];
