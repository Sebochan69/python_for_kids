import type { Lesson, MissionValidationResult, RunCodeResponse } from './types';

function normalizeOutput(output: string) {
  return output.replace(/\r\n/g, '\n').trim();
}

export function validateMission(lesson: Lesson, result: RunCodeResponse | null): MissionValidationResult {
  if (!result) {
    return {
      status: 'not_run',
      title: 'Ready to try',
      message: 'Run the mission when you are ready.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: '',
    };
  }

  if (result.status === 'timeout') {
    return {
      status: 'try_again',
      title: 'Python got tired',
      message: 'The code kept running for too long. Try making the mission shorter.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
    };
  }

  if (result.status === 'error') {
    return {
      status: 'try_again',
      title: 'Python got stuck',
      message: 'Look at the story steps and try fixing the line where Python got stuck.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
    };
  }

  const expected = normalizeOutput(lesson.expected_stdout);
  const actual = normalizeOutput(result.stdout);

  if (actual === expected) {
    return {
      status: 'complete',
      title: 'Mission complete',
      message: 'Great work. Python said exactly what the mission asked for.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
    };
  }

  if (actual.length > 0) {
    return {
      status: 'almost',
      title: 'Almost there',
      message: 'Python said something, but it does not match the mission yet.',
      expectedOutput: lesson.expected_stdout,
      actualOutput: result.stdout,
    };
  }

  return {
    status: 'try_again',
    title: 'Try again',
    message: 'Python did not say the mission answer yet.',
    expectedOutput: lesson.expected_stdout,
    actualOutput: result.stdout,
  };
}
