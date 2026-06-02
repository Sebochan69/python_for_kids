import json
import subprocess
import sys

from app.core.config import settings
from app.models.run import RunCodeRequest, RunCodeResponse, RunError

CHILD_RUNNER = r"""
import contextlib
import io
import json

payload = json.loads(input())
code = payload["code"]
file_name = payload["file_name"]
stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
errors = []


def blocked_import(*_args, **_kwargs):
    raise ImportError("Importing modules is not available in kids missions yet.")


def blocked_input(*_args, **_kwargs):
    raise RuntimeError("Asking for input is not available in kids missions yet.")


allowed_builtins = {
    "abs": abs,
    "all": all,
    "any": any,
    "bool": bool,
    "dict": dict,
    "enumerate": enumerate,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "print": print,
    "range": range,
    "round": round,
    "set": set,
    "str": str,
    "sum": sum,
    "tuple": tuple,
    "__import__": blocked_import,
    "input": blocked_input,
}

status = "ok"

try:
    compiled = compile(code, file_name, "exec")
    with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
        exec(compiled, {"__builtins__": allowed_builtins}, {})
except SyntaxError as error:
    status = "error"
    errors.append({
        "type": "SyntaxError",
        "message": error.msg,
        "line_number": error.lineno,
    })
    stderr_buffer.write(f"Python got stuck on line {error.lineno}: {error.msg}\n")
except Exception as error:
    status = "error"
    line_number = None
    current = error.__traceback__
    while current is not None:
        if current.tb_frame.f_code.co_filename == file_name:
            line_number = current.tb_lineno
        current = current.tb_next
    errors.append({
        "type": type(error).__name__,
        "message": str(error),
        "line_number": line_number,
    })
    if line_number is None:
        stderr_buffer.write(f"Python got stuck: {error}\n")
    else:
        stderr_buffer.write(f"Python got stuck on line {line_number}: {error}\n")

print(json.dumps({
    "status": status,
    "stdout": stdout_buffer.getvalue(),
    "stderr": stderr_buffer.getvalue(),
    "errors": errors,
    "timed_out": False,
}))
"""


def run_python_code(request: RunCodeRequest) -> RunCodeResponse:
    """Run one kids Python snippet with prototype guardrails.

    This is not a production sandbox. It runs code in an isolated Python
    subprocess with restricted builtins, imports blocked, captured output, and a
    short timeout so early lessons can safely explore tiny snippets.
    """
    payload = json.dumps({"code": request.code, "file_name": request.file_name})

    try:
        completed = subprocess.run(
            [sys.executable, "-I", "-S", "-c", CHILD_RUNNER],
            input=f"{payload}\n",
            text=True,
            capture_output=True,
            timeout=settings.python_run_timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return RunCodeResponse(
            status="timeout",
            stdout="",
            stderr="Python took too long and was stopped.",
            errors=[
                RunError(
                    type="TimeoutError",
                    message="Python took too long and was stopped.",
                    line_number=None,
                ),
            ],
            timed_out=True,
        )

    if completed.returncode != 0:
        return RunCodeResponse(
            status="error",
            stdout="",
            stderr=completed.stderr,
            errors=[
                RunError(
                    type="RunnerError",
                    message="The Python runner could not finish this request.",
                    line_number=None,
                ),
            ],
        )

    try:
        response_payload = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return RunCodeResponse(
            status="error",
            stdout="",
            stderr=completed.stderr,
            errors=[
                RunError(
                    type="RunnerOutputError",
                    message="The Python runner returned an unreadable response.",
                    line_number=None,
                ),
            ],
        )

    return RunCodeResponse(**response_payload)
