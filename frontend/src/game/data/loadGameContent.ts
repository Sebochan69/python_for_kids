import chapterOneJson from '../../../../lessons/game/chapter-1-mana-crystals.json';
import type { BattleEncounterData, GameChapterData, GameSideQuestData, GameSpellData } from '../battle/types';

const chapterOne = chapterOneJson as unknown as GameChapterData;

export function loadChapterOne() {
  return chapterOne;
}

export function getChapterOneEncounter(index = 0): BattleEncounterData {
  const encounter = chapterOne.battles[index];

  if (!encounter) {
    throw new Error(`Chapter 1 encounter ${index} was not found.`);
  }

  return encounter;
}

export function getSpellById(spellId: string): GameSpellData | undefined {
  return chapterOne.spells.find((spell) => spell.id === spellId);
}

export function getChapterOneSideQuest(questId: string): GameSideQuestData | undefined {
  return chapterOne.sideQuests.find((quest) => quest.id === questId);
}

export function getChapterOneBossFight(): BattleEncounterData {
  return chapterOne.bossFight;
}
