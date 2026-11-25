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
        "name": "Shivpura",
        "block": "Chomu",
        "district": "Jaipur Rural",
        "state": "Rajasthan",
        "population": 3420,
        "literacy_rate": 74.2,
        "latitude": 26.9855,
        "longitude": 75.7225,
    },
    {
        "id": 2,
        "name": "Kalyanpur",
        "block": "Chomu",
        "district": "Jaipur Rural",
        "state": "Rajasthan",
        "population": 2890,
        "literacy_rate": 68.5,
        "latitude": 27.0125,
        "longitude": 75.7530,
    },
    {
        "id": 3,
        "name": "Rampur Kalan",
        "block": "Amer",
        "district": "Jaipur Rural",
        "state": "Rajasthan",
        "population": 4150,
        "literacy_rate": 79.1,
        "latitude": 27.0450,
        "longitude": 75.6980,
    },
    {
        "id": 4,
        "name": "Belgaon Khurd",
        "block": "Amer",
        "district": "Jaipur Rural",
        "state": "Rajasthan",
        "population": 1980,
        "literacy_rate": 62.4,
        "latitude": 26.9530,
        "longitude": 75.6810,
    },
    {
        "id": 5,
        "name": "Bhimpur",
        "block": "Bhimpur",
        "district": "Betul",
        "state": "Madhya Pradesh",
        "population": 2500,
        "literacy_rate": 65.0,
        "latitude": 21.8418,
        "longitude": 77.6212,
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
        "name": "Vikram Singh Shekhawat",
        "email": "sarpanch.shivpura@panchayat.gov.in",
        "role": "panchayat",
        "phone": "+91 94140 44556",
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
    # Shivpura Assets
    {
        "village_id": 1,
        "name": "Shivpura Central Water Tank",
        "type": "water_tank",
        "condition_status": "operational",
        "latitude": 26.9862,
        "longitude": 75.7231,
        "capacity_or_size": "50,000 Liters",
        "extra_data": {"beneficiaries": 1200, "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Ward 4 Public Handpump",
        "type": "handpump",
        "condition_status": "needs_repair",
        "latitude": 26.9845,
        "longitude": 75.7215,
        "capacity_or_size": "Deep Borewell (180 ft)",
        "extra_data": {"beneficiaries": 280, "source": "survey", "defect": "rusted water discharge"},
    },
    {
        "village_id": 1,
        "name": "Government Senior Secondary School",
        "type": "school",
        "condition_status": "operational",
        "latitude": 26.9878,
        "longitude": 75.7245,
        "capacity_or_size": "12 Classrooms",
        "extra_data": {"students_enrolled": 460, "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Primary Health Sub-Center",
        "type": "health_center",
        "condition_status": "operational",
        "latitude": 26.9839,
        "longitude": 75.7202,
        "capacity_or_size": "6 Beds",
        "extra_data": {"anm_in_charge": "Smt. Sunita Devi", "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Main Chomu-Shivpura Connecting Road",
        "type": "road",
        "condition_status": "needs_repair",
        "latitude": 26.9850,
        "longitude": 75.7260,
        "capacity_or_size": "2.4 km Bituminous Road",
        "extra_data": {"potholes_count": 4, "traffic": "moderate", "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Temple Square Solar Streetlight Array",
        "type": "streetlight",
        "condition_status": "critical",
        "latitude": 26.9859,
        "longitude": 75.7218,
        "capacity_or_size": "4x 40W LED Panels",
        "extra_data": {"defect": "battery enclosure broken", "source": "survey"},
    },
    {
        "village_id": 1,
        "name": "Ward 2 Distribution Transformer",
        "type": "transformer",
        "condition_status": "operational",
        "latitude": 26.9870,
        "longitude": 75.7238,
        "capacity_or_size": "100 kVA",
        "extra_data": {"source": "survey"},
    },
    # Bhimpur OSM Sample Assets
    {
        "village_id": 5,
        "name": "Bhimpur Main Chauraha Streetlight Cluster",
        "type": "streetlight",
        "condition_status": "needs_repair",
        "latitude": 21.8422,
        "longitude": 77.6219,
        "capacity_or_size": "Cluster of 3",
        "extra_data": {"solar_powered": True, "source": "osm"},
    },
    {
        "village_id": 5,
        "name": "Bhimpur-Betul Connecting MDR Segment",
        "type": "road",
        "condition_status": "operational",
        "latitude": 21.8420,
        "longitude": 77.6215,
        "capacity_or_size": "3.5 km",
        "extra_data": {"surface": "asphalt", "source": "osm"},
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
        "qr_code_id": "QR-SHIV-001",
        "latitude": 26.9848,
        "longitude": 75.7212,
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
        "qr_code_id": "QR-SHIV-002",
        "latitude": 26.9852,
        "longitude": 75.7208,
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
        "qr_code_id": "QR-SHIV-003",
        "latitude": 26.9841,
        "longitude": 75.7220,
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
        "qr_code_id": "QR-SHIV-004",
        "latitude": 26.9872,
        "longitude": 75.7235,
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
        "qr_code_id": "QR-SHIV-005",
        "latitude": 26.9865,
        "longitude": 75.7242,
    },
]

INITIAL_COMPLAINTS = [
    {
        "citizen_id": 3,
        "village_id": 1,
        "description": "The road near the senior secondary school has multiple deep potholes. During rain, water accumulates making it dangerous for students and tractors.",
        "status": "submitted",
        "latitude": 26.9875,
        "longitude": 75.7242,
        "ai_category": "Road",
        "ai_confidence": 0.94,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": None,
        "official_remarks": None,
    },
    {
        "citizen_id": 3,
        "village_id": 1,
        "description": "Ward 4 public handpump is leaking dirty, rusty water. Around 30 families rely on this and urgently need repair or borewell flushing.",
        "status": "under_review",
        "latitude": 26.9845,
        "longitude": 75.7215,
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
        "latitude": 26.9859,
        "longitude": 75.7218,
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
        "latitude": 26.9851,
        "longitude": 75.7228,
        "ai_category": "Sanitation",
        "ai_confidence": 0.95,
        "model_version": "NLP-TFIDF-v1.4",
        "official_override_category": "Sanitation",
        "official_remarks": "Cleaned by sanitation team on 22nd Nov. Lime powder sprayed.",
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
