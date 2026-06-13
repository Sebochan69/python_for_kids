import type { GameChapterData } from '../battle/types';

const STORAGE_KEY = 'python-wizard-rpg-progress-v1';
const CHAPTER_ONE_ID = 'chapter-1-mana-crystals';
const REQUIRED_SIDE_QUESTS_FOR_BOSS = 3;

export type GameProgress = {
  currentChapter: string;
  unlockedChapters: string[];
  completedTutorial: boolean;
  completedBattles: string[];
  completedSideQuests: string[];
  bossUnlocked: boolean;
  bossDefeated: boolean;
};

export function createDefaultProgress(): GameProgress {
  return {
    currentChapter: CHAPTER_ONE_ID,
    unlockedChapters: [CHAPTER_ONE_ID],
    completedTutorial: false,
    completedBattles: [],
    completedSideQuests: [],
    bossUnlocked: false,
    bossDefeated: false,
  };
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeProgress(value: Partial<GameProgress> | null | undefined): GameProgress {
  const defaults = createDefaultProgress();

  return {
    currentChapter: typeof value?.currentChapter === 'string' ? value.currentChapter : defaults.currentChapter,
    unlockedChapters: unique(Array.isArray(value?.unlockedChapters) ? value.unlockedChapters : defaults.unlockedChapters),
    completedTutorial: Boolean(value?.completedTutorial),
    completedBattles: unique(Array.isArray(value?.completedBattles) ? value.completedBattles : []),
    completedSideQuests: unique(Array.isArray(value?.completedSideQuests) ? value.completedSideQuests : []),
    bossUnlocked: Boolean(value?.bossUnlocked),
    bossDefeated: Boolean(value?.bossDefeated),
  };
}

export function canUnlockChapterOneBoss(progress: GameProgress) {
  return (
    progress.completedTutorial
    && progress.completedBattles.length >= 1
    && progress.completedSideQuests.length >= REQUIRED_SIDE_QUESTS_FOR_BOSS
  );
}

export function applyBossUnlockRules(progress: GameProgress): GameProgress {
  return {
    ...progress,
    bossUnlocked: progress.bossUnlocked || canUnlockChapterOneBoss(progress),
  };
}

export function loadProgress(): GameProgress {
  if (typeof window === 'undefined') {
    return createDefaultProgress();
  }

  try {
    const storedProgress = window.localStorage.getItem(STORAGE_KEY);

    if (!storedProgress) {
      return createDefaultProgress();
    }

    return applyBossUnlockRules(normalizeProgress(JSON.parse(storedProgress) as Partial<GameProgress>));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: GameProgress) {
  const nextProgress = applyBossUnlockRules(normalizeProgress(progress));

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
  }

  return nextProgress;
}

export function updateProgress(updater: (progress: GameProgress) => GameProgress) {
  return saveProgress(updater(loadProgress()));
}

export function markTutorialComplete(progress: GameProgress) {
  return saveProgress({
    ...progress,
    completedTutorial: true,
  });
}

export function markBattleComplete(progress: GameProgress, battleId: string) {
  return saveProgress({
    ...progress,
    completedBattles: unique([...progress.completedBattles, battleId]),
  });
}

export function markSideQuestComplete(progress: GameProgress, questId: string) {
  return saveProgress({
    ...progress,
    completedSideQuests: unique([...progress.completedSideQuests, questId]),
  });
}

export function markBossDefeated(progress: GameProgress, chapter: GameChapterData) {
  return saveProgress({
    ...progress,
    currentChapter: chapter.id,
    unlockedChapters: unique([...progress.unlockedChapters, chapter.id]),
    bossUnlocked: true,
    bossDefeated: true,
  });
}

export function setCurrentChapter(progress: GameProgress, chapterId: string) {
  return saveProgress({
    ...progress,
    currentChapter: chapterId,
    unlockedChapters: unique([...progress.unlockedChapters, chapterId]),
  });
}

export function getBossUnlockSummary(progress: GameProgress) {
  return {
    completedTutorial: progress.completedTutorial,
    normalBattlesComplete: progress.completedBattles.length,
    sideQuestsComplete: progress.completedSideQuests.length,
    requiredNormalBattles: 1,
    requiredSideQuests: REQUIRED_SIDE_QUESTS_FOR_BOSS,
    isUnlocked: progress.bossUnlocked || canUnlockChapterOneBoss(progress),
  };
}
