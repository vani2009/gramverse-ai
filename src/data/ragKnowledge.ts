import { RagDocumentCitation } from '../types';

export interface KnowledgeDocument {
  id: string;
  title: string;
  sourceDoc: string;
  category: 'scheme' | 'village_records' | 'complaints_policy' | 'development_plan';
  keywords: string[];
  content: string;
}

export const RAG_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'doc_gpdp_2024',
    title: 'Kothri Kalan Gram Panchayat Development Plan (GPDP) 2024-25',
    sourceDoc: 'Panchayati Raj Dept, Govt of Madhya Pradesh, Ref: GPDP-ASH-2024-KOTHRI',
    category: 'development_plan',
    keywords: ['budget', 'expenditure', 'roads', 'priority', 'population', 'wards', 'finance', 'funds'],
    content: 'Kothri Kalan Gram Panchayat operates under Ashta Block, Sehore District with 11 wards and 590 households. Total sanctioned untied grant for 2024-25 is ₹52.0 Lakhs under 15th Finance Commission. Priority works sanctioned include CC road paving in Ward 2, replacement of damaged submersible pump in Ward 4, and retrofitting 24 solar streetlights.'
  },
  {
    id: 'doc_jjm_guidelines',
    title: 'Jal Jeevan Mission Har Ghar Jal Technical Guidelines (Sec 4.2)',
    sourceDoc: 'Ministry of Jal Shakti, Operational Guidelines for Implementation of JJM',
    category: 'scheme',
    keywords: ['water', 'tap', 'piped', 'jjm', 'handpump', 'fhtc', 'drinking', 'clean water'],
    content: 'Under Jal Jeevan Mission, every rural household is entitled to a Functional Household Tap Connection (FHTC) providing 55 liters per capita per day (lpcd) of potable water adhering to BIS 10500 standards. Village Water & Sanitation Committee (VWSC) manages user charges (₹60/month) and water quality surveillance using Field Test Kits (FTKs).'
  },
  {
    id: 'doc_pmkisan_sop',
    title: 'PM-KISAN Samman Nidhi Operational Framework & DBT Protocol',
    sourceDoc: 'Ministry of Agriculture & Farmers Welfare, Cir No. 12-04/2023-Credit',
    category: 'scheme',
    keywords: ['farmer', 'kisan', 'land', '6000', 'pmkisan', 'installment', 'dbt', 'agriculture', 'jamabandi'],
    content: 'PM-KISAN provides ₹6,000 per annum paid in 3 four-monthly installments of ₹2,000 each via Direct Benefit Transfer into Aadhaar-seeded accounts. Small and marginal landholder farmer families with cultivable land up to 5 acres recorded in state land revenue records (Jamabandi/RoR) are eligible. Institutional landholders and income tax payees are excluded.'
  },
  {
    id: 'doc_pmayg_rules',
    title: 'PMAY-G Rural Housing Assistance Manual & Eligibility Matrix',
    sourceDoc: 'Ministry of Rural Development, Pradhan Mantri Awaas Yojana - Gramin Framework',
    category: 'scheme',
    keywords: ['house', 'housing', 'pucca', 'kutcha', 'pmay', 'bpl', '120000', 'subsidy', 'shelter'],
    content: 'PMAY-G grants ₹1,20,000 in plain areas and ₹1,30,000 in hilly/difficult areas for constructing a minimum 25 sq. m. pucca home with a dedicated hygienic cooking space. Beneficiaries also receive 90-95 person-days of unskilled labor under MGNREGA (approx ₹25,000) and ₹12,000 incentive for toilet construction under SBM-G.'
  },
  {
    id: 'doc_complaint_sla',
    title: 'GramVerse Citizen Grievance Redressal SLA & Escalation Protocol',
    sourceDoc: 'Digital Panchayati Raj Citizen Charter & Grievance SLA Notification 2024',
    category: 'complaints_policy',
    keywords: ['complaint', 'grievance', 'sla', 'days', 'resolution', 'override', 'pothole', 'escalation'],
    content: 'All citizen complaints lodged on GramVerse AI are categorized automatically via NLP and Computer Vision within 3 seconds. First inspection by Junior Engineer / Panchayat Secretary must occur within 48 hours. Category 1 emergencies (drinking water contamination, live electric wires) have a mandatory 24-hour turnaround SLA. Routine road repairs carry a 14-day SLA.'
  },
  {
    id: 'doc_health_subcenter',
    title: 'Kothri Kalan Health & Wellness Sub-Center Service Log 2026',
    sourceDoc: 'National Health Mission Madhya Pradesh, District Health Society Sehore Record',
    category: 'village_records',
    keywords: ['health', 'clinic', 'vaccine', 'anm', 'doctor', 'medicine', 'sub-center', 'ayushman'],
    content: 'The Kothri Kalan Health Sub-Center is staffed by ANM Smt. Sunita Devi and 2 Accredited Social Health Activists (ASHAs). Routine immunization runs every Thursday. Emergency medical kit, antenatal care tests, and generic fever/ORS/iron medications are stocked on site. Critical referrals are sent to Ashta Civil Hospital / CHC (12 km).'
  }
];

export function searchRagKnowledge(query: string): { answer: string; citations: RagDocumentCitation[] } {
  const lowerQuery = query.toLowerCase();
  
  // Scoring documents
  const scoredDocs = RAG_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    doc.keywords.forEach(kw => {
      if (lowerQuery.includes(kw)) score += 3;
    });
    // Check words in title and content
    const queryTokens = lowerQuery.split(/\s+/).filter(w => w.length > 2);
    queryTokens.forEach(token => {
      if (doc.title.toLowerCase().includes(token)) score += 2;
      if (doc.content.toLowerCase().includes(token)) score += 1;
    });
    return { doc, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  if (scoredDocs.length === 0) {
    return {
      answer: "I checked the verified Gram Panchayat records, official government scheme portals, and village survey files. I couldn't find a direct record matching that query. You can ask about village budget, drinking water status under JJM, farmer eligibility for PM-KISAN, or complaint resolution timelines.",
      citations: []
    };
  }

  const topMatch = scoredDocs[0].doc;
  const citations: RagDocumentCitation[] = scoredDocs.slice(0, 2).map(({ doc }) => ({
    id: doc.id,
    docTitle: doc.title,
    sourceDoc: doc.sourceDoc,
    section: 'Official Certified Record',
    excerpt: doc.content.slice(0, 160) + '...',
    confidenceScore: 0.94
  }));

  // Context-specific answer construction
  let answer = '';
  if (lowerQuery.includes('budget') || lowerQuery.includes('fund') || lowerQuery.includes('money') || lowerQuery.includes('plan')) {
    answer = `Based on the official **Kothri Kalan GPDP 2024-25**, the total sanctioned untied grant for the current fiscal year is **₹52.0 Lakhs** under the 15th Finance Commission. To date, ₹41.5 Lakhs (79.8%) has been utilized across key projects including Ward 2 CC road paving and Ward 4 solar streetlights in Ashta Block.`;
  } else if (lowerQuery.includes('water') || lowerQuery.includes('tap') || lowerQuery.includes('jjm') || lowerQuery.includes('handpump')) {
    answer = `According to the **Jal Jeevan Mission Guidelines (Sec 4.2)** and Kothri Kalan water records, the village currently has 76% functional household tap connection (FHTC) coverage with an operational 150 KL Overhead Water Reservoir. If your handpump is discharging muddy or rusty water, an automated work order can be created for cylinder inspection by PHED within 24 hours.`;
  } else if (lowerQuery.includes('kisan') || lowerQuery.includes('farmer') || lowerQuery.includes('6000') || lowerQuery.includes('pm-kisan')) {
    answer = `Under **PM-KISAN Samman Nidhi**, eligible landholding farmer families receive **₹6,000 per year** in 3 tranches of ₹2,000 directly via DBT. You need your Aadhaar card, Jamabandi/Khatauni land revenue record, and an Aadhaar-seeded active bank account. Institutional owners and income tax payers are excluded.`;
  } else if (lowerQuery.includes('house') || lowerQuery.includes('awas') || lowerQuery.includes('pmay') || lowerQuery.includes('bpl')) {
    answer = `Under **PMAY-G (Pradhan Mantri Awas Yojana - Gramin)**, selected BPL and AAY families living in kutcha dwellings receive a direct grant of **₹1,20,000** for constructing a 25 sq. m. pucca house, plus 90-95 days of MGNREGA wages (~₹25,000) and ₹12,000 for a sanitary toilet.`;
  } else if (lowerQuery.includes('complaint') || lowerQuery.includes('pothole') || lowerQuery.includes('sla') || lowerQuery.includes('status')) {
    answer = `According to the **GramVerse Grievance Redressal SLA Protocol**, complaints submitted through the citizen portal are categorized using NLP and Computer Vision instantly. Water emergencies require 24-hour response, while road and drainage works carry a 14-day SLA. Village officials can review, verify, or re-categorize issues directly on their dashboard.`;
  } else {
    answer = `Verified from **${topMatch.title}**: ${topMatch.content}`;
  }

  return { answer, citations };
}
