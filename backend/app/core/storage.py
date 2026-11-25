import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp3", ".wav", ".m4a"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def save_upload_file(file: UploadFile, subfolder: str = "complaints") -> str:
    """
    Saves an uploaded evidence file (photo or audio) to the uploads directory.
    Returns relative URL path suitable for public web delivery.
    """
    filename = file.filename or "evidence.jpg"
    _, ext = os.path.splitext(filename.lower())

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Ensure upload directory exists
    target_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = os.path.join(target_dir, unique_filename)

    # Read and save in chunks to check size
    size = 0
    async with aiofiles.open(target_path, "wb") as out_file:
        while content := await file.read(1024 * 1024):  # 1MB chunk
            size += len(content)
            if size > MAX_FILE_SIZE:
                # Remove partially written file
                try:
                    os.remove(target_path)
                except OSError:
                    pass
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)} MB."
                )
            await out_file.write(content)

    # Return relative URL
    return f"/uploads/{subfolder}/{unique_filename}"
