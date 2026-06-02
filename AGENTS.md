# Agent Guidance

This project is a child-facing learning product. Keep every change small,
clear, and safety-aware.

## Project Rules

- Build for children under 10, with the first app focused on ages 8-10.
- Keep child-facing language simple, warm, and non-shaming.
- Avoid raw technical panels in the default child experience.
- Do not add free-form AI chat without a separate safety review.
- Do not collect personal information from children.
- Do not add accounts, sharing, or persistence until parent/teacher controls
  are designed.
- Keep runtime execution controlled and documented as a prototype unless a
  stronger sandbox is implemented.

## Engineering Rules

- Prefer small tickets over large feature piles.
- Reuse ideas from OOH-AHH, but do not copy the whole multi-track app.
- Do not add backend, frontend, AI, or persistence features before the ticket
  asks for them.
- Keep the first product simple: one-file code, run mission, story steps,
  output, validation, hints.
- Use deterministic local explanations before any LLM integration.

## Vocabulary

- variable: memory box
- assignment: remember this
- update: change the memory box
- loop: repeater
- condition: question
- function: machine
- print: say
- error: Python got stuck

## Review Checklist

- Is the UI understandable to a child?
- Is the wording gentle?
- Does the feature avoid collecting child data?
- Does it avoid giving full answers?
- Does it keep the first milestone small?
