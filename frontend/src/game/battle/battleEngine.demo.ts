import chapterOneJson from '../../../../lessons/game/chapter-1-mana-crystals.json';
import { initializeBattle, selectSpell, submitAnswer } from './battleEngine';
import type { GameChapterData } from './types';

const chapterOne = chapterOneJson as unknown as GameChapterData;
const firstBattle = chapterOne.battles[0];

const selectedFirstBattle = selectSpell(
  initializeBattle(firstBattle, {
    enemyIntent: {
      type: 'attack',
      amount: 1,
      text: 'The Dim Rune flickers at the wizard.',
    },
  }),
  firstBattle.challenge.spellEffect.spellId,
);

export const correctAnswerStateTransition = submitAnswer(selectedFirstBattle, '"Glow"');

export const wrongAnswerStateTransition = submitAnswer(selectedFirstBattle, 'Glow');

export const defeatStateTransition = submitAnswer(
  initializeBattle(firstBattle, {
    playerHp: 1,
    enemyIntent: {
      type: 'attack',
      amount: 2,
      text: 'The Dim Rune bumps the wizard.',
    },
  }),
  'Glow',
);
