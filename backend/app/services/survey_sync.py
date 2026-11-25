from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.survey import Survey
from app.models.household import Household
from app.models.village import Village
from app.models.user import User
from app.schemas.survey import (
    SurveySyncItem,
    SurveySyncResponse,
    SyncItemResult,
)


async def process_survey_sync_batch(
    db: AsyncSession,
    items: List[SurveySyncItem],
    volunteer: User
) -> SurveySyncResponse:
    """
    Processes an array of offline survey submissions with idempotent de-duplication.
    - If client_uuid already exists: updates existing survey record.
    - If client_uuid is new: provisions/links household and creates new survey.
    - Wraps each item in a savepoint to prevent a single bad item from failing the entire batch.
    """
    results: List[SyncItemResult] = []
    inserted_count = 0
    updated_count = 0
    failed_count = 0

    for item in items:
        async with db.begin_nested():
            try:
                # 1. Check if survey with this client_uuid was already ingested
                existing_survey_query = select(Survey).where(Survey.client_uuid == item.client_uuid)
                res = await db.execute(existing_survey_query)
                survey = res.scalar_one_or_none()

                if survey:
                    # Idempotent update: refresh survey data without creating duplicate
                    survey.survey_data = item.survey_data
                    if item.latitude is not None:
                        survey.latitude = item.latitude
                    if item.longitude is not None:
                        survey.longitude = item.longitude

                    updated_count += 1
                    results.append(SyncItemResult(
                        client_uuid=item.client_uuid,
                        status="updated",
                        survey_id=survey.id,
                        household_id=survey.household_id,
                        message="Existing survey record updated successfully."
                    ))
                    continue

                # 2. Determine / provision household
                target_household_id = item.household_id

                # If no household_id given, check if household details were captured offline
                if not target_household_id and item.household_head and item.village_id:
                    # Check if household exists by QR code
                    household = None
                    if item.qr_code_id:
                        hh_res = await db.execute(
                            select(Household).where(Household.qr_code_id == item.qr_code_id)
                        )
                        household = hh_res.scalar_one_or_none()

                    if not household:
                        # Verify village exists
                        v_res = await db.execute(select(Village).where(Village.id == item.village_id))
                        if v_res.scalar_one_or_none():
                            household = Household(
                                village_id=item.village_id,
                                household_head=item.household_head,
                                family_size=item.family_size or 1,
                                monthly_income=item.monthly_income or 0.0,
                                housing_type=item.housing_type or "kutcha",
                                pucca_house=item.pucca_house or False,
                                land_holding_acres=item.land_holding_acres or 0.0,
                                water_tap_available=item.water_tap_available or False,
                                electricity_available=item.electricity_available or False,
                                toilet_available=item.toilet_available or False,
                                caste_category=item.caste_category or "General",
                                qr_code_id=item.qr_code_id,
                                latitude=item.latitude,
                                longitude=item.longitude
                            )
                            db.add(household)
                            await db.flush()
                            target_household_id = household.id
                    else:
                        target_household_id = household.id

                # 3. Create new survey record
                new_survey = Survey(
                    client_uuid=item.client_uuid,
                    household_id=target_household_id,
                    volunteer_id=volunteer.id,
                    survey_type=item.survey_type,
                    survey_data=item.survey_data,
                    latitude=item.latitude,
                    longitude=item.longitude
                )
                db.add(new_survey)
                await db.flush()

                inserted_count += 1
                results.append(SyncItemResult(
                    client_uuid=item.client_uuid,
                    status="created",
                    survey_id=new_survey.id,
                    household_id=target_household_id,
                    message="New survey record synchronized."
                ))

            except Exception as e:
                failed_count += 1
                results.append(SyncItemResult(
                    client_uuid=item.client_uuid,
                    status="error",
                    message=f"Sync error: {str(e)}"
                ))

    await db.commit()

    return SurveySyncResponse(
        total_received=len(items),
        inserted_count=inserted_count,
        updated_count=updated_count,
        failed_count=failed_count,
        results=results
    )
