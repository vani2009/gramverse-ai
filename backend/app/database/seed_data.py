"""Database seeder for GramVerse AI.

Initializes realistic villages, infrastructure assets with PostGIS coordinates,
households with socioeconomic indicators, citizen grievances, master welfare
schemes, and GPDP development priorities for Phase 1 demonstration.
"""

from __future__ import annotations

import logging
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import AsyncSessionLocal
from app.models.village import Village
from app.models.infrastructure import Infrastructure
from app.models.household import Household
from app.models.complaint import Complaint
from app.models.scheme import Scheme
from app.models.priority import DevelopmentPriority
from app.models.user import User

logger = logging.getLogger("gramverse.seed")


INITIAL_VILLAGES = [
    {
        "id": 1,
        "name": "Kothri Kalan",
        "block": "Ashta",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "population": 3650,
        "literacy_rate": 76.5,
        "latitude": 23.0722,
        "longitude": 76.8296,
    },
    {
        "id": 2,
        "name": "Amlaha",
        "block": "Ashta",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "population": 2980,
        "literacy_rate": 78.0,
        "latitude": 23.0850,
        "longitude": 76.8850,
    },
    {
        "id": 3,
        "name": "Metwada",
        "block": "Ashta",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "population": 2240,
        "literacy_rate": 69.2,
        "latitude": 23.0610,
        "longitude": 76.8010,
    },
    {
        "id": 4,
        "name": "Bhaunra",
        "block": "Ashta",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "population": 1850,
        "literacy_rate": 64.0,
        "latitude": 23.0450,
        "longitude": 76.8450,
    },
    {
        "id": 5,
        "name": "Lasudiya Khas",
        "block": "Ashta",
        "district": "Sehore",
        "state": "Madhya Pradesh",
        "population": 2150,
        "literacy_rate": 68.0,
        "latitude": 23.0180,
        "longitude": 76.7820,
    },
]

INITIAL_USERS = [
    {
        "firebase_uid": "dev_admin_uid",
        "name": "Dr. Rajeshwari Sharma, IAS",
        "email": "admin.district@gramverse.gov.in",
        "role": "admin",
        "phone": "+91 98290 11223",
        "village_id": 1,
        "is_active": True,
    },
    {
        "firebase_uid": "dev_panchayat_uid",
        "name": "Mahendra Patel",
        "email": "sarpanch.kothri@panchayat.gov.in",
        "role": "panchayat",
        "phone": "+91 94250 44556",
        "village_id": 1,
        "is_active": True,
    },
    {
        "firebase_uid": "dev_citizen_uid",
        "name": "Rameshwar Lal Gurjar",
        "email": "rameshwar.gurjar@village.in",
        "role": "citizen",
        "phone": "+91 97850 77889",
        "village_id": 1,
        "is_active": True,
    },
    {
        "firebase_uid": "dev_survey_uid",
        "name": "Pooja Verma",
        "email": "pooja.surveyor@gramverse.ngo",
        "role": "survey",
        "phone": "+91 96100 33445",
        "village_id": 1,
        "is_active": True,
    },
]

INITIAL_INFRASTRUCTURE = [
    # Kothri Kalan, Sehore, Madhya Pradesh Assets
    {
        "village_id": 1,
        "name": "Kothri Kalan Overhead Water Reservoir (JJM)",
        "type": "water_tank",
        "condition_status": "operational",
        "latitude": 23.0735,
        "longitude": 76.8310,
        "capacity_or_size": "75,000 Liters",
        "extra_data": {"beneficiaries": 1800, "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Kothri Main Chauraha Deep Handpump (Ward 3)",
        "type": "handpump",
        "condition_status": "needs_repair",
        "latitude": 23.0715,
        "longitude": 76.8285,
        "capacity_or_size": "Deep Borewell (210 ft)",
        "extra_data": {"beneficiaries": 350, "source": "survey", "defect": "rusted water discharge"},
    },
    {
        "village_id": 1,
        "name": "Govt Higher Secondary School Kothri Kalan",
        "type": "school",
        "condition_status": "operational",
        "latitude": 23.0748,
        "longitude": 76.8325,
        "capacity_or_size": "14 Classrooms",
        "extra_data": {"students_enrolled": 520, "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Primary Health Sub-Center Kothri",
        "type": "health_center",
        "condition_status": "operational",
        "latitude": 23.0698,
        "longitude": 76.8272,
        "capacity_or_size": "8 Beds",
        "extra_data": {"anm_in_charge": "Smt. Sunita Devi", "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Main Kothri-Amlaha PMGSY Connecting Road",
        "type": "road",
        "condition_status": "needs_repair",
        "latitude": 23.0728,
        "longitude": 76.8340,
        "capacity_or_size": "3.2 km Bituminous Road",
        "extra_data": {"potholes_count": 5, "traffic": "moderate", "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Temple Chowk Solar High-Mast Streetlight Array",
        "type": "streetlight",
        "condition_status": "critical",
        "latitude": 23.0720,
        "longitude": 76.8292,
        "capacity_or_size": "4x 50W LED Panels",
        "extra_data": {"defect": "battery enclosure broken", "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Kothri Agricultural Feeder Transformer (MPPKVVCL)",
        "type": "transformer",
        "condition_status": "operational",
        "latitude": 23.0740,
        "longitude": 76.8300,
        "capacity_or_size": "100 kVA",
        "extra_data": {"source": "survey"},
    },
    # Amlaha Assets (Village ID 2)
    {
        "village_id": 2,
        "name": "Amlaha JJM Overhead Water Reservoir (100 KL)",
        "type": "water_tank",
        "condition_status": "operational",
        "latitude": 23.0855,
        "longitude": 76.8855,
        "capacity_or_size": "100,000 Liters",
        "extra_data": {"beneficiaries": 1850, "source": "survey"},
    },
    {
        "village_id": 2,
        "name": "Govt Middle School Amlaha",
        "type": "school",
        "condition_status": "operational",
        "latitude": 23.0865,
        "longitude": 76.8840,
        "capacity_or_size": "8 Classrooms",
        "extra_data": {"beneficiaries": 310, "source": "survey"},
    },
    {
        "village_id": 2,
        "name": "Amlaha 33/11 kV Power Substation",
        "type": "transformer",
        "condition_status": "operational",
        "latitude": 23.0820,
        "longitude": 76.8820,
        "capacity_or_size": "5 MVA Substation",
        "extra_data": {"beneficiaries": 2980, "source": "survey"},
    },
    {
        "village_id": 2,
        "name": "Amlaha Health Sub-Center",
        "type": "health_center",
        "condition_status": "operational",
        "latitude": 23.0848,
        "longitude": 76.8868,
        "capacity_or_size": "6 Beds",
        "extra_data": {"beneficiaries": 1400, "source": "survey"},
    },
    # Metwada Assets (Village ID 3)
    {
        "village_id": 3,
        "name": "Metwada Primary Health Sub-Center",
        "type": "health_center",
        "condition_status": "needs_repair",
        "latitude": 23.0622,
        "longitude": 76.8022,
        "capacity_or_size": "4 Beds",
        "extra_data": {"beneficiaries": 1200, "source": "survey"},
    },
    {
        "village_id": 3,
        "name": "Metwada Govt Primary School",
        "type": "school",
        "condition_status": "operational",
        "latitude": 23.0612,
        "longitude": 76.8008,
        "capacity_or_size": "6 Classrooms",
        "extra_data": {"beneficiaries": 220, "source": "survey"},
    },
    {
        "village_id": 3,
        "name": "Metwada Solar Pump Community Well",
        "type": "water_tank",
        "condition_status": "needs_repair",
        "latitude": 23.0602,
        "longitude": 76.8012,
        "capacity_or_size": "30,000 Liters",
        "extra_data": {"beneficiaries": 650, "source": "survey"},
    },
    # Bhaunra Assets (Village ID 4)
    {
        "village_id": 4,
        "name": "Bhaunra Gram Panchayat Bhavan",
        "type": "school",
        "condition_status": "operational",
        "latitude": 23.0452,
        "longitude": 76.8448,
        "capacity_or_size": "Panchayat Complex",
        "extra_data": {"beneficiaries": 1100, "source": "survey"},
    },
    {
        "village_id": 4,
        "name": "Bhaunra JJM Community Water Standpost",
        "type": "handpump",
        "condition_status": "needs_repair",
        "latitude": 23.0448,
        "longitude": 76.8438,
        "capacity_or_size": "Standpost",
        "extra_data": {"beneficiaries": 520, "source": "survey"},
    },
    # Lasudiya Khas Assets (Village ID 5, Ashta Block, Sehore)
    {
        "village_id": 5,
        "name": "Govt Primary & Middle School Lasudiya Khas",
        "type": "school",
        "condition_status": "operational",
        "latitude": 23.0188,
        "longitude": 76.7825,
        "capacity_or_size": "8 Classrooms",
        "extra_data": {"beneficiaries": 280, "source": "survey"},
    },
    {
        "village_id": 5,
        "name": "Lasudiya Khas Health & Wellness Sub-Center",
        "type": "health_center",
        "condition_status": "operational",
        "latitude": 23.0170,
        "longitude": 76.7810,
        "capacity_or_size": "4 Beds",
        "extra_data": {"beneficiaries": 1850, "source": "survey"},
    },
    {
        "village_id": 5,
        "name": "Lasudiya Khas Main Chauraha Streetlight Cluster",
        "type": "streetlight",
        "condition_status": "needs_repair",
        "latitude": 23.0185,
        "longitude": 76.7822,
        "capacity_or_size": "Cluster of 3",
        "extra_data": {"solar_powered": True, "source": "survey"},
    },
    {
        "village_id": 5,
        "name": "Lasudiya Khas-Ashta Connecting Link Road Segment",
        "type": "road",
        "condition_status": "operational",
        "latitude": 23.0192,
        "longitude": 76.7830,
        "capacity_or_size": "2.8 km",
        "extra_data": {"surface": "asphalt", "source": "survey"},
    },
    {
        "village_id": 5,
        "name": "Lasudiya Khas Deep Borewell Dual Solar Pump",
        "type": "handpump",
        "condition_status": "needs_repair",
        "latitude": 23.0178,
        "longitude": 76.7818,
        "capacity_or_size": "Solar Dual Pump",
        "extra_data": {"beneficiaries": 540, "source": "survey"},
    },
]

INITIAL_HOUSEHOLDS = [
    {
        "village_id": 1,
        "household_head": "Rameshwar Lal Gurjar",
        "family_size": 5,
        "monthly_income": 8500.0,
        "housing_type": "kutcha",
        "pucca_house": False,
        "land_holding_acres": 1.5,
        "water_tap_available": False,
        "electricity_available": True,
        "toilet_available": False,
        "caste_category": "OBC",
        "qr_code_id": "QR-KOTHRI-001",
        "latitude": 23.0718,
        "longitude": 76.8288,
    },
    {
        "village_id": 1,
        "household_head": "Mohan Lal Meena",
        "family_size": 6,
        "monthly_income": 6200.0,
        "housing_type": "kutcha",
        "pucca_house": False,
        "land_holding_acres": 0.8,
        "water_tap_available": False,
        "electricity_available": True,
        "toilet_available": True,
        "caste_category": "ST",
        "qr_code_id": "QR-KOTHRI-002",
        "latitude": 23.0725,
        "longitude": 76.8279,
    },
    {
        "village_id": 1,
        "household_head": "Smt. Kamala Devi Bairwa",
        "family_size": 4,
        "monthly_income": 4800.0,
        "housing_type": "kutcha",
        "pucca_house": False,
        "land_holding_acres": 0.0,
        "water_tap_available": False,
        "electricity_available": False,
        "toilet_available": False,
        "caste_category": "SC",
        "qr_code_id": "QR-KOTHRI-003",
        "latitude": 23.0712,
        "longitude": 76.8302,
    },
    {
        "village_id": 1,
        "household_head": "Surendra Singh Rathore",
        "family_size": 4,
        "monthly_income": 28000.0,
        "housing_type": "pucca",
        "pucca_house": True,
        "land_holding_acres": 6.2,
        "water_tap_available": True,
        "electricity_available": True,
        "toilet_available": True,
        "caste_category": "General",
        "qr_code_id": "QR-KOTHRI-004",
        "latitude": 23.0738,
        "longitude": 76.8315,
    },
    {
        "village_id": 1,
        "household_head": "Gopal Sharma",
        "family_size": 5,
        "monthly_income": 19500.0,
        "housing_type": "pucca",
        "pucca_house": True,
        "land_holding_acres": 3.0,
        "water_tap_available": True,
        "electricity_available": True,
        "toilet_available": True,
        "caste_category": "General",
        "qr_code_id": "QR-KOTHRI-005",
        "latitude": 23.0731,
        "longitude": 76.8322,
    },
]

INITIAL_COMPLAINTS = [
    {
        "citizen_id": 3,
        "village_id": 1,
        "description": "The road near the higher secondary school has multiple deep potholes. During rain, water accumulates making it dangerous for students and tractors.",
        "status": "submitted",
        "latitude": 23.0745,
        "longitude": 76.8330,
        "ai_category": "Road",
        "ai_confidence": 0.94,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    {
        "citizen_id": 3,
        "village_id": 1,
        "description": "Ward 3 public handpump is leaking dirty, rusty water. Around 30 families rely on this and urgently need repair or borewell flushing.",
        "status": "under_review",
        "latitude": 23.0715,
        "longitude": 76.8285,
        "ai_category": "Water",
        "ai_confidence": 0.96,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": "Water",
        "official_remarks": "PHED field engineer alerted. Pump cylinder kit replacement scheduled.",
    },
    {
        "citizen_id": 3,
        "village_id": 1,
        "description": "Temple square solar streetlight is not working for 8 days. Battery enclosure is hanging open.",
        "status": "submitted",
        "latitude": 23.0720,
        "longitude": 76.8292,
        "ai_category": "Electricity",
        "ai_confidence": 0.92,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    {
        "citizen_id": 3,
        "village_id": 1,
        "description": "Open drain overflowing into the street near market corner. Stagnant water causing foul smell and mosquito breeding.",
        "status": "resolved",
        "latitude": 23.0726,
        "longitude": 76.8299,
        "ai_category": "Sanitation",
        "ai_confidence": 0.95,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": "Sanitation",
        "official_remarks": "Cleaned by sanitation team on 22nd Nov. Lime powder sprayed.",
    },
    # Amlaha Complaints (Village ID 2)
    {
        "citizen_id": 3,
        "village_id": 2,
        "description": "The 7.5 HP submersible pump installed at Amlaha community tank has burnt due to voltage fluctuations. Over 400 households have had no drinking water supply for 3 days.",
        "status": "under_review",
        "latitude": 23.0845,
        "longitude": 76.8842,
        "ai_category": "Water",
        "ai_confidence": 0.97,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": "Field technician dispatched from Ashta.",
    },
    {
        "citizen_id": 3,
        "village_id": 2,
        "description": "Heavy grain transport trucks have washed away 60 meters of road shoulder near Krishi Upaj Mandi sub-yard.",
        "status": "submitted",
        "latitude": 23.0862,
        "longitude": 76.8860,
        "ai_category": "Road",
        "ai_confidence": 0.95,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    # Metwada Complaints (Village ID 3)
    {
        "citizen_id": 3,
        "village_id": 3,
        "description": "The community borewell in Metwada Harijan Basti has dried down to silt. Urgent tanker supply needed.",
        "status": "under_review",
        "latitude": 23.0618,
        "longitude": 76.8005,
        "ai_category": "Water",
        "ai_confidence": 0.98,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    {
        "citizen_id": 3,
        "village_id": 3,
        "description": "Blocked masonry canal overflowing into vegetable vendor area with pungent sewage in weekly haat bazaar.",
        "status": "submitted",
        "latitude": 23.0605,
        "longitude": 76.8015,
        "ai_category": "Sanitation",
        "ai_confidence": 0.94,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    # Bhaunra Complaints (Village ID 4)
    {
        "citizen_id": 3,
        "village_id": 4,
        "description": "Stone slab culvert bridging the irrigation drain on Bhaunra main link road has collapsed in the center.",
        "status": "under_review",
        "latitude": 23.0442,
        "longitude": 76.8458,
        "ai_category": "Road",
        "ai_confidence": 0.95,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    # Lasudiya Khas Complaints (Village ID 5, Ashta Block, Sehore)
    {
        "citizen_id": 3,
        "village_id": 5,
        "description": "The Lasudiya Khas connecting link road to Ashta highway has a clogged drainage culvert causing water logging across 100 meters.",
        "status": "under_review",
        "latitude": 23.0192,
        "longitude": 76.7830,
        "ai_category": "Road",
        "ai_confidence": 0.96,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": "Road maintenance team scheduled.",
    },
    {
        "citizen_id": 3,
        "village_id": 5,
        "description": "Community handpump near Lasudiya Khas Ward 2 has a broken foot valve and discharges muddy water.",
        "status": "submitted",
        "latitude": 23.0178,
        "longitude": 76.7818,
        "ai_category": "Water",
        "ai_confidence": 0.95,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
]

INITIAL_PRIORITIES = [
    {
        "village_id": 1,
        "issue": "Asphalt Repair & Drainage for School Road",
        "category": "Road",
        "severity": 4,
        "population_affected": 850,
        "estimated_cost_lakhs": 2.4,
        "priority_score": 1416.7,
        "rank": 1,
        "matching_scheme": "PMGSY & Gram Panchayat Tied Fund",
        "status": "proposed",
    },
    {
        "village_id": 1,
        "issue": "Ward 4 Deep Borewell Replacement & Pipeline",
        "category": "Water",
        "severity": 5,
        "population_affected": 420,
        "estimated_cost_lakhs": 0.85,
        "priority_score": 2470.6,
        "rank": 2,
        "matching_scheme": "Jal Jeevan Mission (JJM)",
        "status": "proposed",
    },
    {
        "village_id": 1,
        "issue": "Community Sanitation Complex (Ward 3)",
        "category": "Sanitation",
        "severity": 4,
        "population_affected": 320,
        "estimated_cost_lakhs": 1.2,
        "priority_score": 1066.7,
        "rank": 3,
        "matching_scheme": "Swachh Bharat Mission (Grameen)",
        "status": "proposed",
    },
]


async def seed_initial_data_if_empty() -> None:
    """Populates the database with initial demonstration entities if villages table is empty."""
    async with AsyncSessionLocal() as db:
        v_count = await db.scalar(select(func.count(Village.id)))
        if v_count and v_count > 0:
            return

        print("Seeding initial database with demo villages, infrastructure, households, and GIS layers...")

        # 1. Seed Villages
        for v_data in INITIAL_VILLAGES:
            lat, lon = v_data.get("latitude"), v_data.get("longitude")
            v_obj = Village(
                id=v_data["id"],
                name=v_data["name"],
                block=v_data["block"],
                district=v_data["district"],
                state=v_data["state"],
                population=v_data["population"],
                literacy_rate=v_data["literacy_rate"],
                latitude=lat,
                longitude=lon,
                location=f"SRID=4326;POINT({lon} {lat})" if lat and lon else None,
            )
            db.add(v_obj)

        await db.flush()

        # 2. Seed Users
        for u_data in INITIAL_USERS:
            db.add(User(**u_data))

        # 3. Seed Infrastructure Assets
        for i_data in INITIAL_INFRASTRUCTURE:
            lat = i_data["latitude"]
            lon = i_data["longitude"]
            db.add(
                Infrastructure(
                    village_id=i_data["village_id"],
                    name=i_data["name"],
                    type=i_data["type"],
                    condition_status=i_data["condition_status"],
                    latitude=lat,
                    longitude=lon,
                    location=f"SRID=4326;POINT({lon} {lat})",
                    capacity_or_size=i_data.get("capacity_or_size"),
                    extra_data=i_data.get("extra_data", {}),
                )
            )

        # 4. Seed Households
        for h_data in INITIAL_HOUSEHOLDS:
            db.add(Household(**h_data))

        # 5. Seed Complaints
        for c_data in INITIAL_COMPLAINTS:
            lat = c_data["latitude"]
            lon = c_data["longitude"]
            db.add(
                Complaint(
                    citizen_id=c_data["citizen_id"],
                    village_id=c_data["village_id"],
                    description=c_data["description"],
                    status=c_data["status"],
                    latitude=lat,
                    longitude=lon,
                    location=f"SRID=4326;POINT({lon} {lat})",
                    ai_category=c_data["ai_category"],
                    ai_confidence=c_data["ai_confidence"],
                    model_version=c_data["model_version"],
                    official_override_category=c_data["official_override_category"],
                    official_remarks=c_data["official_remarks"],
                )
            )

        # 6. Seed Priorities
        for p_data in INITIAL_PRIORITIES:
            db.add(DevelopmentPriority(**p_data))

        await db.commit()
        print("Initial database seeding completed successfully.")
