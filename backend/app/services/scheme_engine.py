from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.scheme import Scheme
from app.models.household import Household
from app.schemas.ai import (
    SchemeMatchResult,
    SchemeRecommendationResponse,
)

DEFAULT_SCHEMES = [
    {
        "code": "PMAY-G",
        "name": "Pradhan Mantri Awas Yojana - Gramin",
        "department": "Ministry of Rural Development",
        "description": "Financial assistance of ₹1.20 Lakh to ₹1.30 Lakh for construction of permanent pucca houses for homeless and households living in kutcha/dilapidated houses.",
        "benefit_summary": "₹1.20 Lakh grant + 90 days MGNREGA wages + ₹12,000 toilet assistance.",
        "application_deadline": "Ongoing",
        "required_documents": ["Aadhaar Card", "Bank Account Passbook", "BPL/SECC Card", "Land Possession Certificate"],
        "eligibility_rules": {
            "max_monthly_income": 15000.0,
            "requires_no_pucca_house": True
        }
    },
    {
        "code": "PM-KISAN",
        "name": "PM Kisan Samman Nidhi",
        "department": "Ministry of Agriculture & Farmers Welfare",
        "description": "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 to all landholding farmer families.",
        "benefit_summary": "₹6,000 per year directly into bank account via DBT.",
        "application_deadline": "Ongoing",
        "required_documents": ["Aadhaar Card", "Land Ownership Record (Khasra/Khatauni)", "Bank Passbook"],
        "eligibility_rules": {
            "min_land_acres": 0.05,
            "max_land_acres": 5.0,
            "max_monthly_income": 25000.0
        }
    },
    {
        "code": "JJM",
        "name": "Jal Jeevan Mission (Har Ghar Jal)",
        "department": "Ministry of Jal Shakti",
        "description": "Provides functional household tap connection (FHTC) delivering 55 liters per capita per day of potable drinking water to every rural household.",
        "benefit_summary": "Piped potable tap water connection directly into household.",
        "application_deadline": "Mission Target 2026",
        "required_documents": ["Aadhaar Card of Head", "Proof of Residence (Ration Card/Electricity Bill)"],
        "eligibility_rules": {
            "requires_no_water_tap": True
        }
    },
    {
        "code": "AYUSHMAN-BHARAT",
        "name": "Ayushman Bharat (PM-JAY)",
        "department": "National Health Authority",
        "description": "Health coverage of up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization.",
        "benefit_summary": "Cashless hospitalization up to ₹5 Lakh annually across empanelled hospitals.",
        "application_deadline": "Ongoing",
        "required_documents": ["Aadhaar Card", "Ration Card", "PM-JAY Letter / SECC Enrollment"],
        "eligibility_rules": {
            "max_monthly_income": 12000.0,
            "deprivation_criteria": ["kutcha", "SC", "ST"]
        }
    },
    {
        "code": "MGNREGA",
        "name": "Mahatma Gandhi NREGA",
        "department": "Ministry of Rural Development",
        "description": "Guarantees 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.",
        "benefit_summary": "100 days guaranteed wage employment at notified state minimum wage.",
        "application_deadline": "Ongoing",
        "required_documents": ["Aadhaar Card", "Photograph", "Bank Account Details"],
        "eligibility_rules": {
            "max_monthly_income": 15000.0
        }
    },
    {
        "code": "PM-SURYA-GHAR",
        "name": "PM Surya Ghar: Muft Bijli Yojana",
        "department": "Ministry of New and Renewable Energy",
        "description": "Subsidies for rooftop solar installation providing up to 300 units of free electricity every month.",
        "benefit_summary": "Subsidy up to ₹78,000 for 1-3 kW rooftop solar plants.",
        "application_deadline": "Ongoing",
        "required_documents": ["Electricity Connection Bill", "Proof of Roof Ownership", "Aadhaar Card"],
        "eligibility_rules": {
            "requires_electricity_connection": True,
            "requires_stable_roof": True
        }
    },
    {
        "code": "SBM-G",
        "name": "Swachh Bharat Mission - Gramin",
        "department": "Ministry of Jal Shakti",
        "description": "Incentive of ₹12,000 for construction of an Individual Household Latrine (IHHL).",
        "benefit_summary": "₹12,000 financial incentive for household toilet construction.",
        "application_deadline": "Ongoing",
        "required_documents": ["Aadhaar Card", "Bank Passbook", "Applicant Photograph"],
        "eligibility_rules": {
            "requires_no_toilet": True
        }
    }
]


async def ensure_schemes_seeded(db: AsyncSession):
    """Seeds master schemes if table is empty."""
    res = await db.execute(select(Scheme))
    if not res.scalars().first():
        for s_data in DEFAULT_SCHEMES:
            scheme = Scheme(**s_data)
            db.add(scheme)
        await db.commit()


def evaluate_single_scheme(scheme_code: str, scheme_data: Dict[str, Any], hh: Dict[str, Any]) -> SchemeMatchResult:
    """Evaluates rules for one scheme against household profile."""
    matched = []
    unmet = []

    income = hh.get("monthly_income") or 0.0
    housing_type = hh.get("housing_type") or "kutcha"
    pucca_house = hh.get("pucca_house", False)
    land = hh.get("land_holding_acres") or 0.0
    water_tap = hh.get("water_tap_available", False)
    electricity = hh.get("electricity_available", False)
    toilet = hh.get("toilet_available", False)
    caste = hh.get("caste_category") or "General"

    if scheme_code == "PMAY-G":
        if not pucca_house and housing_type in ["kutcha", "semi_pucca"]:
            matched.append("Lives in kutcha / non-pucca shelter")
        else:
            unmet.append("Already possesses a permanent pucca house")

        if income <= 15000:
            matched.append(f"Monthly household income (₹{income:.0f}) within BPL limit (₹15,000)")
        else:
            unmet.append(f"Income ₹{income:.0f} exceeds eligibility threshold")

    elif scheme_code == "PM-KISAN":
        if 0.05 <= land <= 5.0:
            matched.append(f"Small / marginal landholding: {land:.1f} acres")
        elif land > 5.0:
            unmet.append(f"Landholding ({land:.1f} acres) exceeds small/marginal farmer limit (5 acres)")
        else:
            unmet.append("No agricultural landholding recorded")

        if income <= 25000:
            matched.append("Income within farmer welfare norms")
        else:
            unmet.append("Income exceeds PM-KISAN limit")

    elif scheme_code == "JJM":
        if not water_tap:
            matched.append("Lacks functional piped household tap water connection")
        else:
            unmet.append("Piped water tap connection already available")

    elif scheme_code == "AYUSHMAN-BHARAT":
        if income <= 12000 or housing_type == "kutcha" or caste in ["SC", "ST"]:
            matched.append("Satisfies socio-economic vulnerability / SECC deprivation indicators")
        else:
            unmet.append("Does not meet Ayushman Bharat SECC deprivation criteria")

    elif scheme_code == "MGNREGA":
        if income <= 15000:
            matched.append("Eligible for guaranteed 100-day rural employment")
        else:
            unmet.append("Income exceeds employment guarantee guideline")

    elif scheme_code == "PM-SURYA-GHAR":
        if electricity:
            matched.append("Existing grid electricity connection active")
        else:
            unmet.append("Grid electricity connection required for net-metering")

        if pucca_house or housing_type in ["semi_pucca", "pucca"]:
            matched.append("Permanent roof capable of supporting solar panel arrays")
        else:
            unmet.append("Permanent or semi-pucca roof structure required")

    elif scheme_code == "SBM-G":
        if not toilet:
            matched.append("Individual household lacks an individual toilet facility")
        else:
            unmet.append("Household already possesses a sanitary toilet")

    # Determine status
    if not unmet:
        status = "eligible"
    elif len(matched) > 0 and len(unmet) <= 1:
        status = "potential"
    else:
        status = "ineligible"

    return SchemeMatchResult(
        scheme_id=scheme_data.get("id"),
        code=scheme_code,
        name=scheme_data.get("name", scheme_code),
        department=scheme_data.get("department", "Government of India"),
        match_status=status,
        matched_criteria=matched,
        unmet_criteria=unmet,
        required_documents=scheme_data.get("required_documents", []),
        benefit_summary=scheme_data.get("benefit_summary")
    )


async def evaluate_household_welfare_schemes(
    db: AsyncSession,
    household_id: Optional[int] = None,
    raw_attributes: Optional[Dict[str, Any]] = None
) -> SchemeRecommendationResponse:
    """Evaluates all master government schemes against household profile."""
    await ensure_schemes_seeded(db)

    hh_dict: Dict[str, Any] = {}

    # 1. Fetch from DB if household_id provided
    if household_id:
        res = await db.execute(select(Household).where(Household.id == household_id))
        hh = res.scalar_one_or_none()
        if hh:
            hh_dict = {
                "monthly_income": hh.monthly_income,
                "housing_type": hh.housing_type,
                "pucca_house": hh.pucca_house,
                "land_holding_acres": hh.land_holding_acres,
                "water_tap_available": hh.water_tap_available,
                "electricity_available": hh.electricity_available,
                "toilet_available": hh.toilet_available,
                "caste_category": hh.caste_category,
            }

    # 2. Merge with any overrides from raw_attributes
    if raw_attributes:
        for k, v in raw_attributes.items():
            if v is not None:
                hh_dict[k] = v

    # 3. Retrieve all schemes
    res = await db.execute(select(Scheme))
    db_schemes = res.scalars().all()

    eligible_list: List[SchemeMatchResult] = []
    potential_list: List[SchemeMatchResult] = []

    for s in db_schemes:
        match_res = evaluate_single_scheme(
            scheme_code=s.code,
            scheme_data={
                "id": s.id,
                "name": s.name,
                "department": s.department,
                "benefit_summary": s.benefit_summary,
                "required_documents": s.required_documents
            },
            hh=hh_dict
        )
        if match_res.match_status == "eligible":
            eligible_list.append(match_res)
        elif match_res.match_status == "potential":
            potential_list.append(match_res)

    return SchemeRecommendationResponse(
        household_id=household_id,
        total_evaluated=len(db_schemes),
        eligible_count=len(eligible_list),
        potential_count=len(potential_list),
        eligible_schemes=eligible_list,
        potential_schemes=potential_list
    )
