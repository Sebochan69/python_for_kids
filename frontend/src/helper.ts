import type { Lesson, MissionValidationResult } from './types';
import type { StoryCard } from './story';
import { conceptLabel } from './validation';

export type HelperAction = 'explain' | 'hint';

export type HelperResponse = {
  title: string;
  message: string;
};

export function explainStoryStep(storyCard: StoryCard | null): HelperResponse {
  if (!storyCard) {
    return {
      title: 'Pick a story step',
      message: 'Click a story card, then I can explain that part.',
    };
  }

  if (storyCard.kind === 'memory') {
    return {
      title: 'Memory box',
      message: 'Python made a memory box and put a value inside it.',
    };
  }

  if (storyCard.kind === 'change') {
    return {
      title: 'Changed memory box',
      message: 'Python used the old value to make a new value for the same memory box.',
    };
  }

  if (storyCard.kind === 'say') {
    return {
      title: 'Python spoke',
      message: 'print() sends words or numbers to the output box.',
    };
  }

  if (storyCard.kind === 'error') {
    return {
      title: 'Python got stuck',
      message: 'This step shows where Python needed help. Look at the matching code line.',
    };
  }

  return {
    title: storyCard.title,
    message: storyCard.detail,
  };
}

export function giveMissionHint(
  lesson: Lesson,
  validationResult: MissionValidationResult,
): HelperResponse {
  if (validationResult.status === 'complete') {
    return {
      title: 'Nice work',
      message: 'You completed this quest. Try the next one when you are ready.',
    };
  }

  if (validationResult.concepts.missing.length > 0) {
    const missingConcept = validationResult.concepts.missing[0];

    return {
      title: `Try ${conceptLabel(missingConcept)}`,
      message: `This quest wants you to practice ${conceptLabel(missingConcept)}. Look at the quest goal and try adding that idea.`,
    };
  }

  if (validationResult.actualOutput.trim().length > 0) {
    return {
      title: 'Check what Python said',
      message: 'Python said something, but it is not the mission answer yet. Compare it with the Goal text.',
    };
  }

  return {
    title: 'Small hint',
    message: lesson.hints[0] ?? 'Try running the starter code, then change one small thing.',
  };
}
