# Runtime Events

The backend run API returns simple kid-facing runtime events. These events are
not debugger-grade traces yet; they are a first contract for story cards.

## Endpoint

`POST /api/v1/run`

Each response includes:

- `status`
- `stdout`
- `stderr`
- `errors`
- `timed_out`
- `events`

## Event Shape

```json
{
  "id": "event-2",
  "type": "variable_remembered",
  "step": 2,
  "line_number": 1,
  "message": "Python remembers x.",
  "payload": {
    "name": "x",
    "value": 1
  }
}
```

## Current Event Types

- `execution_started`
- `line_executed`
- `variable_remembered`
- `variable_changed`
- `printed_output`
- `error`
- `execution_finished`

## Example

```python
x = 1
x = x + 1
print(x)
```

Expected story-level events:

1. Python starts the mission.
2. Python reads line 1.
3. Python remembers `x`.
4. Python reads line 2.
5. Python changes `x`.
6. Python reads line 3.
7. Python says `2`.
8. Python stops the mission.

## Current Boundaries

- Imports are blocked.
- `input()` is blocked.
- Long-running code is stopped by a timeout.
- Only simple serializable values are tracked.
- Function objects are skipped so children do not see memory addresses.
- Rich loop and function-call tracing will be added later.
