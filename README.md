# Python for Kids

Python for Kids is a kid-friendly coding learning app for children under 10.
It helps learners write tiny Python programs, run them, and understand what
Python did through simple story-style steps.

The project borrows lessons learned from PROJECT OOH-AHH, but it is a separate
product with a simpler UI, safer learning boundaries, and child-first language.

## First Milestone

The first milestone focuses on ages 8-10 and teaches:

- `print()` as making Python say something
- variables as memory boxes
- updates as changing a memory box
- loops as repeaters
- conditions as questions
- functions as small machines

## Product Shape

The first app should include:

- mission picker
- friendly mission card
- one-file Python editor
- Run Mission button
- story-style runtime steps
- simple output panel
- gentle mission validation
- local hints only
- next mission flow

## Non-Goals For The First Milestone

- no free-form child AI chat
- no accounts or progress persistence
- no public sharing
- no real package installation
- no Docker or Kubernetes
- no multi-language support
- no adult developer debug UI
- no raw runtime JSON in child-facing views

## Safety Principles

- Do not ask children for personal information.
- Do not expose filesystem or network behavior to learner code.
- Do not include external links in child-facing responses.
- Do not generate full solutions automatically.
- Prefer encouragement and curiosity over scoring pressure.
- Add parent/teacher controls before accounts, sharing, or persistence.

## Planned Structure

```text
frontend/   # kid-friendly React app, future ticket
backend/    # controlled Python execution API, future ticket
lessons/    # mission definitions
docs/       # product, safety, demo, and architecture notes
shared/     # shared schemas when needed
```

## Current Status

This repository is at project foundation stage. No frontend or backend code has
been scaffolded yet.
