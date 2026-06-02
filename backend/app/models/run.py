from typing import Any, Literal

from pydantic import BaseModel, Field


class RunCodeRequest(BaseModel):
    code: str = Field(
        ...,
        min_length=1,
        max_length=20_000,
        description="Python code from the current kids mission.",
    )
    file_name: str = Field(
        default="main.py",
        max_length=80,
        description="Display name used in error messages.",
    )


class RunError(BaseModel):
    type: str
    message: str
    line_number: int | None = None


class KidRuntimeEvent(BaseModel):
    id: str
    type: Literal[
        "execution_started",
        "line_executed",
        "variable_remembered",
        "variable_changed",
        "printed_output",
        "error",
        "execution_finished",
    ]
    step: int
    line_number: int | None = None
    message: str
    payload: dict[str, Any] = Field(default_factory=dict)


class RunCodeResponse(BaseModel):
    status: Literal["ok", "error", "timeout"]
    events: list[KidRuntimeEvent] = Field(default_factory=list)
    stdout: str
    stderr: str
    errors: list[RunError]
    timed_out: bool = False
