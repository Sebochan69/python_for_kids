import type { Lesson, MissionValidationResult, RunCodeResponse } from './types';

const CONCEPT_LABELS: Record<string, string> = {
  print_statement: 'Python Speaker',
  variable_assignment: 'Memory Box Builder',
  variable_update: 'Memory Box Changer',
  for_loop: 'Repeater Ranger',
  if_statement: 'Question Checker',
  function_definition: 'Machine Builder',
  function_call: 'Machine User',
};

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

  if (/^\s*for\s+[A-Za-z_][A-Za-z0-9_]*\s+in\s+/m.test(code)) {
    found.add('for_loop');
  }

  if (/^\s*if\s+.+:/m.test(code)) {
    found.add('if_statement');
  }

  if (/^\s*def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/m.test(code)) {
    found.add('function_definition');
  }

  if (/^\s*(?!def\b|if\b|for\b|print\b)[A-Za-z_][A-Za-z0-9_]*\s*=?.*?\b[A-Za-z_][A-Za-z0-9_]*\s*\(/m.test(code)) {
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
