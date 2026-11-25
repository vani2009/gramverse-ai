import pytest
from app.core.config import settings
from app.database.session import check_db_connection, get_db
from app.database.base import Base


def test_settings_loaded():
    assert settings.PROJECT_NAME == "GramVerse AI Backend"
    assert settings.API_V1_STR == "/api/v1"
    assert "http://localhost:3000" in settings.ALLOWED_ORIGINS
    assert settings.async_database_url is not None


@pytest.mark.anyio
async def test_database_connection():
    is_connected = await check_db_connection()
    assert is_connected is True


@pytest.mark.anyio
async def test_get_db_session():
    async for db in get_db():
        from sqlalchemy import text
        result = await db.execute(text("SELECT 1"))
        assert result.scalar() == 1
        break
