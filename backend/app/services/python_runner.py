import json
import subprocess
import sys

from app.core.config import settings
from app.models.run import RunCodeRequest, RunCodeResponse, RunError

CHILD_RUNNER = r"""
import contextlib
import io
import json
import sys

payload = json.loads(input())
code = payload["code"]
file_name = payload["file_name"]
stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
errors = []
events = []
step = 0
last_line_number = None
last_snapshot = {}


def add_event(event_type, message, line_number=None, payload=None):
    global step
    events.append({
        "id": f"event-{step}",
        "type": event_type,
        "step": step,
        "line_number": line_number,
        "message": message,
        "payload": payload or {},
    })
    step += 1


def serialize_value(value):
    if callable(value):
        return None
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, tuple):
        return [serialize_value(item) for item in value]
    if isinstance(value, dict):
        return {
            str(key): serialize_value(item)
            for key, item in value.items()
        }
    return str(value)


def snapshot_variables(local_values):
    snapshot = {}
    for name, value in local_values.items():
        if name.startswith("__"):
            continue
        serialized = serialize_value(value)
        if serialized is not None:
            snapshot[name] = serialized
    return snapshot


def emit_variable_changes(previous_snapshot, next_snapshot, line_number):
    for name, value in next_snapshot.items():
        if name not in previous_snapshot:
            add_event(
                "variable_remembered",
                f"Python remembers {name}.",
                line_number,
                {"name": name, "value": value},
            )
        elif previous_snapshot[name] != value:
            add_event(
                "variable_changed",
                f"Python changes {name}.",
                line_number,
                {
                    "name": name,
                    "old_value": previous_snapshot[name],
                    "new_value": value,
                },
            )


def trace_lines(frame, event, _arg):
    global last_line_number, last_snapshot
    if event != "line" or frame.f_code.co_filename != file_name:
        return trace_lines

    current_snapshot = snapshot_variables(frame.f_locals)
    if last_line_number is not None:
        emit_variable_changes(last_snapshot, current_snapshot, last_line_number)

    line_number = frame.f_lineno
    add_event("line_executed", f"Python reads line {line_number}.", line_number)
    last_line_number = line_number
    last_snapshot = current_snapshot
    return trace_lines


def blocked_import(*_args, **_kwargs):
    raise ImportError("Importing modules is not available in kids missions yet.")


def blocked_input(*_args, **_kwargs):
    raise RuntimeError("Asking for input is not available in kids missions yet.")


def kid_print(*args, **kwargs):
    line_number = None
    current_frame = sys._getframe()
    caller_frame = current_frame.f_back
    if caller_frame is not None and caller_frame.f_code.co_filename == file_name:
        line_number = caller_frame.f_lineno
    text = " ".join(str(arg) for arg in args)
    add_event(
        "printed_output",
        f"Python says {text}.",
        line_number,
        {"text": text},
    )
    print(*args, **kwargs)


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
    "print": kid_print,
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
add_event("execution_started", "Python starts the mission.")

try:
    compiled = compile(code, file_name, "exec")
    global_values = {"__builtins__": allowed_builtins}
    local_values = {}
    with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
        sys.settrace(trace_lines)
        exec(compiled, global_values, local_values)
        sys.settrace(None)
        if last_line_number is not None:
            emit_variable_changes(last_snapshot, snapshot_variables(local_values), last_line_number)
except SyntaxError as error:
    status = "error"
    errors.append({
        "type": "SyntaxError",
        "message": error.msg,
        "line_number": error.lineno,
    })
    add_event(
        "error",
        f"Python got stuck on line {error.lineno}.",
        error.lineno,
        {"type": "SyntaxError", "message": error.msg},
    )
    stderr_buffer.write(f"Python got stuck on line {error.lineno}: {error.msg}\n")
except Exception as error:
    sys.settrace(None)
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
    add_event(
        "error",
        "Python got stuck.",
        line_number,
        {"type": type(error).__name__, "message": str(error)},
    )
    if line_number is None:
        stderr_buffer.write(f"Python got stuck: {error}\n")
    else:
        stderr_buffer.write(f"Python got stuck on line {line_number}: {error}\n")
finally:
    sys.settrace(None)
    add_event("execution_finished", "Python stops the mission.")

print(json.dumps({
    "status": status,
    "events": events,
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
            events=[
                {
                    "id": "event-0",
                    "type": "execution_started",
                    "step": 0,
                    "line_number": None,
                    "message": "Python starts the mission.",
                    "payload": {},
                },
                {
                    "id": "event-1",
                    "type": "error",
                    "step": 1,
                    "line_number": None,
                    "message": "Python took too long and was stopped.",
                    "payload": {"type": "TimeoutError"},
                },
                {
                    "id": "event-2",
                    "type": "execution_finished",
                    "step": 2,
                    "line_number": None,
                    "message": "Python stops the mission.",
                    "payload": {},
                },
            ],
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
