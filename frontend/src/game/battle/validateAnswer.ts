import type { AnswerValidationOptions, AnswerValidationResult } from './types';

function trimBlankEdges(lines: string[]) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === '') {
    start += 1;
  }

  while (end > start && lines[end - 1].trim() === '') {
    end -= 1;
  }

  return lines.slice(start, end);
}

function normalizeLineWhitespace(line: string) {
  let normalized = '';
  let quote: '"' | "'" | null = null;
  let escaping = false;

  for (const char of line.trim()) {
    if (quote) {
      normalized += char;

      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      normalized += char;
      continue;
    }

    if (char === ' ' || char === '\t') {
      continue;
    }

    normalized += char;
  }

  return normalized;
}

export function normalizeAnswer(answer: string, options: AnswerValidationOptions = {}) {
  const normalizedLines = trimBlankEdges(answer.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'))
    .map(normalizeLineWhitespace);

  const normalized = normalizedLines.join('\n');

  return options.caseSensitive ? normalized : normalized.toLowerCase();
}

export function validateAnswer(
  answer: string,
  acceptedAnswers: string[],
  options: AnswerValidationOptions = {},
): AnswerValidationResult {
  const normalizedAnswer = normalizeAnswer(answer, options);
  const normalizedAcceptedAnswers = acceptedAnswers.map((acceptedAnswer) => normalizeAnswer(acceptedAnswer, options));
  const matchedIndex = normalizedAcceptedAnswers.findIndex((acceptedAnswer) => acceptedAnswer === normalizedAnswer);

  return {
    isCorrect: matchedIndex >= 0,
    normalizedAnswer,
    normalizedAcceptedAnswers,
    matchedAnswer: matchedIndex >= 0 ? acceptedAnswers[matchedIndex] : undefined,
  };
}
