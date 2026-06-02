import type { KidRuntimeEvent } from './types';

export type StoryCard = {
  id: string;
  title: string;
  detail: string;
  lineNumber: number | null;
  kind: 'start' | 'memory' | 'change' | 'say' | 'error' | 'finish';
};

function storyCard(card: StoryCard): StoryCard[] {
  return [card];
}

function valueText(value: unknown) {
  if (value === null || value === undefined) {
    return 'nothing';
  }

  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

export function buildStoryCards(events: KidRuntimeEvent[]): StoryCard[] {
  return events.flatMap((event) => {
    if (event.type === 'line_executed') {
      return [];
    }

    if (event.type === 'execution_started') {
      return storyCard(
        {
          id: event.id,
          title: 'Python wakes up',
          detail: 'The mission starts.',
          lineNumber: null,
          kind: 'start',
        },
      );
    }

    if (event.type === 'variable_remembered') {
      const name = String(event.payload.name ?? 'a memory box');
      const value = valueText(event.payload.value);

      return storyCard(
        {
          id: event.id,
          title: `Python remembers ${name}`,
          detail: `${name} starts as ${value}.`,
          lineNumber: event.line_number,
          kind: 'memory',
        },
      );
    }

    if (event.type === 'variable_changed') {
      const name = String(event.payload.name ?? 'a memory box');
      const oldValue = valueText(event.payload.old_value);
      const newValue = valueText(event.payload.new_value);

      return storyCard(
        {
          id: event.id,
          title: `Python changes ${name}`,
          detail: `${name} changes from ${oldValue} to ${newValue}.`,
          lineNumber: event.line_number,
          kind: 'change',
        },
      );
    }

    if (event.type === 'printed_output') {
      return storyCard(
        {
          id: event.id,
          title: 'Python says something',
          detail: `Python says ${valueText(event.payload.text)}.`,
          lineNumber: event.line_number,
          kind: 'say',
        },
      );
    }

    if (event.type === 'error') {
      return storyCard(
        {
          id: event.id,
          title: 'Python got stuck',
          detail: String(event.payload.message ?? event.message),
          lineNumber: event.line_number,
          kind: 'error',
        },
      );
    }

    return storyCard(
      {
        id: event.id,
        title: 'Python is done',
        detail: 'The mission stops.',
        lineNumber: null,
        kind: 'finish',
      },
    );
  });
}
