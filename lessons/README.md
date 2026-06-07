# Lessons

Lessons are kid-friendly Python quests. Each lesson is a JSON file that matches
[lesson.schema.json](../shared/schemas/lesson.schema.json).

## Lesson Fields

- `id`: stable lowercase lesson id
- `title`: child-facing quest name
- `summary`: short description for the Quest List
- `difficulty`: `starter` or `easy`
- `topic`: main Python concept
- `age_range`: intended learner age range
- `mission_prompt`: short child-facing goal
- `starter_code`: one-file Python starter code
- `expected_stdout`: output used for validation
- `required_concepts`: simple concept tags used for checks
- `learning_goals`: what the child should practice
- `hints`: local deterministic hints used by Sebot
- `adult_guidance`: optional parent/teacher note

## V1 Lesson Pack

The official V1 quest order is:

1. `say-hello.lesson.json`
2. `remember-a-name.lesson.json`
3. `words-and-numbers.lesson.json`
4. `add-numbers.lesson.json`
5. `join-words.lesson.json`
6. `change-a-score.lesson.json`
7. `compare-scores.lesson.json`
8. `choose-a-game.lesson.json`
9. `repeat-a-cheer.lesson.json`
10. `list-of-friends.lesson.json`
11. `function-machine.lesson.json`
12. `checkpoint-first-words.lesson.json`
13. `checkpoint-number-adventure.lesson.json`
14. `checkpoint-mini-party.lesson.json`

Checkpoint quests mix concepts introduced earlier. They should not introduce
new syntax without a prior teaching quest.

## V1 Concept Tags

- `print_statement`
- `variable_assignment`
- `variable_update`
- `string_literal`
- `number_literal`
- `math_operation`
- `string_join`
- `comparison_operator`
- `for_loop`
- `if_statement`
- `list_usage`
- `function_definition`
- `function_call`

## Current Frontend Behavior

The frontend Quest List loads these lessons, injects `starter_code` into the
Code Box, supports reset, and can move to the previous or next quest.

The app compares runtime stdout against `expected_stdout` and uses simple local
concept detection for required concepts. Sebot uses lesson `hints` for local
deterministic guidance. This is not AI chat.
