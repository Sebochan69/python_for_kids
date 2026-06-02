from fastapi import APIRouter

from app.models.run import RunCodeRequest, RunCodeResponse
from app.services.python_runner import run_python_code

router = APIRouter(prefix="/run", tags=["run"])


@router.post("", response_model=RunCodeResponse)
def run_code(request: RunCodeRequest) -> RunCodeResponse:
    return run_python_code(request)
