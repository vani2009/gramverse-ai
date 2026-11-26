export type UserRole = 'admin' | 'panchayat' | 'citizen' | 'survey';

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    designation: string;
    villageId?: string;
    villageName?: string;
    panchId?: string;
    aadharNumber?: string;
    employeeId?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  villageId: string;
  phone?: string;
  designation?: string;
}

export interface Village {
  id: string;
  name: string;
  block: string;
  district: string;
  state: string;
  population: number;
  totalHouseholds: number;
  waterCoveragePct: number;
  electricityCoveragePct: number;
  sanitationCoveragePct: number;
  roadQualityIndex: number; // 0-100
  developmentIndex: number; // 0-100
  activeComplaints: number;
  resolvedComplaints: number;
  budgetAllocatedLakhs: number;
  budgetUtilizedLakhs: number;
  center: [number, number]; // lat, lng
  bounds?: [[number, number], [number, number]];
}

export type ComplaintCategory = 'Road' | 'Water' | 'Sanitation' | 'Electricity' | 'School' | 'Health';
export type ComplaintStatus = 'Submitted' | 'In Review' | 'Work Order' | 'Resolved';

export interface CvDetection {
  label: string;
  confidence: number;
  description: string;
}

export interface AiPredictionMetadata {
  predictedCategory: ComplaintCategory;
  confidence: number;
  reasoning: string;
  modelVersion: string;
  timestamp: string;
  isOverridden?: boolean;
  overriddenCategory?: ComplaintCategory;
  overrideReason?: string;
  cvDetections: CvDetection[];
  cvAnalysisSummary?: string;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone?: string;
  villageId: string;
  villageName: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priorityScore: number; // (Severity * Population) / Cost
  severity: number; // 1 to 5
  affectedPopulation: number;
  estimatedCostLakhs: number;
  location: {
    lat: number;
    lng: number;
    landmark: string;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  aiOutput: AiPredictionMetadata;
  panchayatRemarks?: string;
}

export type CasteCategory = 'General' | 'General (EWS)' | 'OBC' | 'SC' | 'ST';

export interface Household {
  id: string;
  villageId: string;
  villageName: string;
  headName: string;
  aadhaarLastFour: string;
  familySize: number;
  annualIncome: number;
  casteCategory: CasteCategory;
  rationCardType: 'BPL' | 'AAY' | 'APL' | 'None';
  landHoldingAcres: number;
  drinkingWaterSource: 'Tap Connection' | 'Public Handpump' | 'Open Well' | 'Tanker';
  hasSanitationToilet: boolean;
  hasElectricity: boolean;
  isKisanRegistered: boolean;
  matchedSchemeIds: string[];
  surveyedAt: string;
  volunteerName: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface InfrastructureAsset {
  id: string;
  villageId: string;
  villageName: string;
  name: string;
  type: 'Handpump' | 'Water Tank' | 'School' | 'Health Sub-Center' | 'Road Stretches' | 'Solar Streetlight' | 'Transformer';
  condition: 'Good' | 'Needs Maintenance' | 'Critical Repair';
  location: {
    lat: number;
    lng: number;
    description: string;
  };
  installYear: number;
  lastInspected: string;
  beneficiariesCount: number;
}

export interface Scheme {
  id: string;
  name: string;
  shortCode: string;
  ministry: string;
  category: 'Agriculture' | 'Housing' | 'Healthcare' | 'Water & Sanitation' | 'Employment' | 'Solar & Energy';
  financialBenefit: string;
  description: string;
  eligibility: {
    maxIncome?: number;
    maxLandAcres?: number;
    allowedCaste?: CasteCategory[];
    requiredRationCard?: ('BPL' | 'AAY' | 'APL')[];
    requiresNoToilet?: boolean;
    requiresFarming?: boolean;
  };
  documentsRequired: string[];
  applicationUrl: string;
}

export interface OfflineSurveyRecord {
  id: string;
  type: 'household' | 'infrastructure';
  payload: any;
  capturedAt: string;
  synced: boolean;
  syncAttempts: number;
  status: 'pending' | 'synced' | 'failed';
}

export interface RagDocumentCitation {
  id: string;
  docTitle: string;
  sourceDoc: string;
  section: string;
  excerpt: string;
  confidenceScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: RagDocumentCitation[];
}

export interface PanchayatNotice {
  id: string;
  villageId: string;
  title: string;
  content: string;
  category: 'Gram Sabha' | 'Water Supply' | 'Health Camp' | 'Agriculture' | 'Emergency' | 'General';
  priority: 'Normal' | 'High' | 'Urgent';
  date: string;
  authorName: string;
  authorRole: string;
}
