# Safety Notes

Python for Kids is intended for children, so safety and clarity are product
requirements, not extras.

## Current Safety Rules

- No personal data prompts.
- No public sharing.
- No accounts in the first milestone.
- No free-form child AI chat.
- No external links in child-facing helper text.
- No automatic full-solution generation.
- No filesystem persistence from learner code.
- No network access from learner code.

## Runtime Safety

The first runtime should be treated as a prototype until stronger sandboxing is
designed. It should:

- run only submitted lesson code
- capture stdout and errors
- stop long-running code with a timeout
- avoid arbitrary package installation
- avoid file and network access

## Helper Safety

Hints should guide the next thought, not write the answer.

Good:

- "Check what Python is saying. Does it match the mission?"
- "Try using a memory box before you print."

Avoid:

- full final code
- shame
- personal questions
- unrelated links
