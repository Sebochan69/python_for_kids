from fastapi import FastAPI

from app.api.v1.run import router as run_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)
app.include_router(run_router, prefix="/api/v1")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "python-for-kids-backend",
    }
