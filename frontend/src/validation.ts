import type { Lesson, MissionValidationResult, RunCodeResponse } from './types';

const CONCEPT_LABELS: Record<string, string> = {
  print_statement: 'Python Speaker',
  variable_assignment: 'Memory Box Builder',
  variable_update: 'Memory Box Changer',
  string_literal: 'Word Keeper',
  number_literal: 'Number Keeper',
  math_operation: 'Number Math',
  string_join: 'Word Joiner',
  comparison_operator: 'Comparator',
  for_loop: 'Repeater Ranger',
  if_statement: 'Question Checker',
  list_usage: 'List Builder',
  function_definition: 'Machine Builder',
  function_call: 'Machine User',
};

const BUILTIN_CALLS = new Set(['print', 'range', 'len', 'str', 'int', 'float', 'list', 'dict', 'sum']);

function normalizeOutput(output: string) {
  return output.replace(/\r\n/g, '\n').trim();
}

export function conceptLabel(concept: string) {
  return CONCEPT_LABELS[concept] ?? concept;
}

export function detectConcepts(code: string) {
  const found = new Set<string>();

  if (/\bprint\s*\(/.test(code)) {
    found.add('print_statement');
  }

  if (/^\s*[A-Za-z_][A-Za-z0-9_]*\s*=\s*[^=]/m.test(code)) {
    found.add('variable_assignment');
  }

  if (/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\1\s*[-+*/]/m.test(code)) {
    found.add('variable_update');
  }

  if (/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/.test(code)) {
    found.add('string_literal');
  }

  if (/\b\d+(?:\.\d+)?\b/.test(code)) {
    found.add('number_literal');
  }

  if (/[A-Za-z0-9_)\]]\s*[-+*/]\s*[A-Za-z0-9_("'[]/.test(code)) {
    found.add('math_operation');
  }

  if (/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\+\s*[A-Za-z_][A-Za-z0-9_]*|[A-Za-z_][A-Za-z0-9_]*\s*\+\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.test(code)) {
    found.add('string_join');
  }

  if (/^\s*if\s+.+(?:==|!=|>=|<=|>|<).+:/m.test(code)) {
    found.add('comparison_operator');
  }

  if (/^\s*for\s+[A-Za-z_][A-Za-z0-9_]*\s+in\s+/m.test(code)) {
    found.add('for_loop');
  }

  if (/^\s*if\s+.+:/m.test(code)) {
    found.add('if_statement');
  }

  if (/\[[\s\S]*?\]/.test(code)) {
    found.add('list_usage');
  }

  if (/^\s*def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/m.test(code)) {
    found.add('function_definition');
  }

  if (
    code
      .split('\n')
      .some((line) =>
        !/^\s*def\b/.test(line)
        && [...line.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].some((match) => !BUILTIN_CALLS.has(match[1])),
      )
  ) {
    found.add('function_call');
  }

  return [...found];
}

export function validateMission(
  lesson: Lesson,
  result: RunCodeResponse | null,
  code: string,
): MissionValidationResult {
  const foundConcepts = detectConcepts(code);
  const missingConcepts = lesson.required_concepts.filter((concept) => !foundConcepts.includes(concept));
  const conceptSummary = {
    required: lesson.required_concepts,
    found: foundConcepts.filter((concept) => lesson.required_concepts.includes(concept)),
    missing: missingConcepts,
  };

  if (!result) {
    return {
      status: 'not_run',
      title: 'Ready to try',
      message: 'Run the mission when you are ready.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: '',
      concepts: conceptSummary,
    };
  }

  if (result.status === 'timeout') {
    return {
      status: 'try_again',
      title: 'Python got tired',
      message: 'The code kept running for too long. Try making the mission shorter.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
      concepts: conceptSummary,
    };
  }

  if (result.status === 'error') {
    return {
      status: 'try_again',
      title: 'Python got stuck',
      message: 'Look at the story steps and try fixing the line where Python got stuck.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
      concepts: conceptSummary,
    };
  }

  const expected = normalizeOutput(lesson.expected_stdout);
  const actual = normalizeOutput(result.stdout);

  if (actual === expected && missingConcepts.length === 0) {
    return {
      status: 'complete',
      title: 'Mission complete',
      message: 'Great work. Python said exactly what the mission asked for.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
      concepts: conceptSummary,
    };
  }

  if (actual === expected) {
    return {
      status: 'almost',
      title: 'Almost there',
      message: 'Python said the right thing. Try using every mission skill too.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
      concepts: conceptSummary,
    };
  }

  if (actual.length > 0 || conceptSummary.found.length > 0) {
    return {
      status: 'almost',
      title: 'Almost there',
      message: 'Some mission pieces are working. Check the goal and try one more change.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
      concepts: conceptSummary,
    };
  }

  return {
    status: 'try_again',
    title: 'Try again',
    message: 'Python did not say the mission answer yet.',
    expectedOutput: lesson.expected_stdout,
    actualOutput: result.stdout,
    concepts: conceptSummary,
  };
}
