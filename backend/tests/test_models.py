import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.database.base import Base
from app.models import (
    Village,
    User,
    Household,
    Survey,
    Infrastructure,
    Complaint,
    ComplaintImage,
    Scheme,
    SchemeRecommendation,
    DevelopmentPriority,
)


@pytest.fixture
async def test_session():
    # In-memory SQLite async engine for isolated model testing
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.mark.anyio
async def test_create_village_and_user(test_session: AsyncSession):
    village = Village(
        name="Shivpura",
        block="Ghatigaon",
        district="Gwalior",
        population=1240,
        literacy_rate=68.5,
        latitude=26.1234,
        longitude=78.5678
    )
    test_session.add(village)
    await test_session.commit()
    await test_session.refresh(village)

    assert village.id is not None
    assert village.name == "Shivpura"

    user = User(
        firebase_uid="firebase_uid_test_123",
        name="Ramesh Sarpanch",
        email="ramesh@gramverse.org",
        role="panchayat",
        village_id=village.id
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)

    assert user.id is not None
    assert user.role == "panchayat"
    assert user.village_id == village.id


@pytest.mark.anyio
async def test_household_and_survey(test_session: AsyncSession):
    village = Village(name="Kalyanpur", block="Dabra", district="Gwalior")
    test_session.add(village)
    await test_session.commit()

    household = Household(
        village_id=village.id,
        household_head="Mukesh Yadav",
        family_size=5,
        monthly_income=6500.0,
        housing_type="kutcha",
        pucca_house=False,
        land_holding_acres=1.5,
        qr_code_id="QR_KALYANPUR_001"
    )
    test_session.add(household)
    await test_session.commit()
    await test_session.refresh(household)

    assert household.id is not None
    assert household.pucca_house is False

    survey = Survey(
        client_uuid="550e8400-e29b-41d4-a716-446655440000",
        household_id=household.id,
        survey_type="household",
        survey_data={"drinking_water_source": "community_well", "ration_card": "BPL"}
    )
    test_session.add(survey)
    await test_session.commit()
    await test_session.refresh(survey)

    assert survey.id is not None
    assert survey.client_uuid == "550e8400-e29b-41d4-a716-446655440000"


@pytest.mark.anyio
async def test_complaint_with_ai_metadata(test_session: AsyncSession):
    village = Village(name="Rampur", block="Morar", district="Gwalior")
    test_session.add(village)
    await test_session.commit()

    complaint = Complaint(
        village_id=village.id,
        description="Main road near primary school has deep potholes and water accumulation.",
        latitude=26.22,
        longitude=78.18,
        status="submitted",
        ai_category="Road",
        ai_confidence=0.92,
        model_version="nlp-logistic-v1.0"
    )
    test_session.add(complaint)
    await test_session.commit()
    await test_session.refresh(complaint)

    image = ComplaintImage(
        complaint_id=complaint.id,
        image_url="https://storage.googleapis.com/gramverse-bucket/evidence/pothole1.jpg",
        cv_detected_labels=[{"label": "pothole", "confidence": 0.88}],
        cv_confidence=0.88,
        model_version="cv-defect-v1.0"
    )
    test_session.add(image)
    await test_session.commit()
    await test_session.refresh(complaint)

    assert complaint.id is not None
    assert complaint.ai_category == "Road"
    assert len(complaint.images) == 1
    assert complaint.images[0].cv_confidence == 0.88


@pytest.mark.anyio
async def test_priority_planner_and_scheme(test_session: AsyncSession):
    village = Village(name="Belgaon", block="Bhitwar", district="Gwalior")
    test_session.add(village)
    await test_session.commit()

    scheme = Scheme(
        name="Pradhan Mantri Awas Yojana - Gramin",
        code="PMAY-G",
        department="Ministry of Rural Development",
        description="Financial assistance for kutcha house replacement",
        eligibility_rules={"pucca_house": False, "max_income": 120000},
        required_documents=["Aadhaar Card", "Bank Passbook", "BPL Certificate"]
    )
    test_session.add(scheme)

    # Calculate Priority: (Severity 4 * 650 people) / 3.5 Lakhs = 742.86
    priority = DevelopmentPriority(
        village_id=village.id,
        issue="Repair School Approach Road",
        category="Road",
        severity=4,
        population_affected=650,
        estimated_cost_lakhs=3.5,
        priority_score=round((4 * 650) / 3.5, 2),
        rank=1,
        matching_scheme="PMGSY"
    )
    test_session.add(priority)
    await test_session.commit()

    assert priority.id is not None
    assert priority.priority_score == 742.86
    assert scheme.code == "PMAY-G"
