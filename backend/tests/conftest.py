import asyncio
import pytest
from app.database.session import engine
from app.models import Base


@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    """Ensure database schema is reset to a clean state before tests run."""
    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(_setup())
    yield
    async def _teardown():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(_teardown())
