# Lessons

Lessons are kid-friendly Python missions. Each lesson is a JSON file that
matches [lesson.schema.json](../shared/schemas/lesson.schema.json).

## Lesson Fields

- `id`: stable lowercase lesson id
- `title`: child-facing mission name
- `summary`: short description for the mission picker
- `difficulty`: `starter` or `easy`
- `topic`: main Python concept
- `age_range`: intended learner age range
- `mission_prompt`: short child-facing goal
- `starter_code`: one-file Python starter code
- `expected_stdout`: output used later for validation
- `required_concepts`: simple concept tags used later for badges and checks
- `learning_goals`: what the child should practice
- `hints`: local deterministic hints
- `adult_guidance`: optional parent/teacher note

## Starter Pack

- `say-hello.lesson.json`
- `remember-a-name.lesson.json`
- `change-a-score.lesson.json`
- `repeat-a-cheer.lesson.json`
- `choose-a-game.lesson.json`
- `function-machine.lesson.json`

## Current Frontend Behavior

The frontend mission picker loads these lessons, injects `starter_code` into the
editor, supports reset, and can move to the next mission after a successful run.
Lesson validation has not been implemented yet.
