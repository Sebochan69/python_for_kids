import { useState } from 'react';
import { getChapterOneBossFight, getChapterOneEncounter, getChapterOneSideQuest, loadChapterOne } from './data/loadGameContent';
import { BattleScreen } from './components/BattleScreen';
import { ChapterFlow } from './chapter/ChapterFlow';
import { WorldMap } from './map/WorldMap';
import { SideQuestScreen } from './quests/SideQuestScreen';
import {
  canUnlockChapterOneBoss,
  loadProgress,
  markBattleComplete,
  markBossDefeated,
  markSideQuestComplete,
  markTutorialComplete,
  setCurrentChapter,
  type GameProgress,
} from './progress/progressStore';

type GameRoute =
  | { view: 'map' }
  | { view: 'chapter' }
  | { view: 'battle' }
  | { view: 'sideQuest'; questId: string }
  | { view: 'boss' };

export function GameApp() {
  const chapter = loadChapterOne();
  const [route, setRoute] = useState<GameRoute>({ view: 'map' });
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());

  function saveProgress(nextProgress: GameProgress) {
    setProgress(nextProgress);
  }

  function goToMap() {
    setProgress((currentProgress) => ({ ...currentProgress, bossUnlocked: currentProgress.bossUnlocked || canUnlockChapterOneBoss(currentProgress) }));
    setRoute({ view: 'map' });
  }

  function startChapter() {
    saveProgress(setCurrentChapter(progress, chapter.id));
    setRoute({ view: 'chapter' });
  }

  function startBattle() {
    saveProgress(setCurrentChapter(progress, chapter.id));
    setRoute({ view: 'battle' });
  }

  function startSideQuest(questId: string) {
    saveProgress(setCurrentChapter(progress, chapter.id));
    setRoute({ view: 'sideQuest', questId });
  }

  function startBoss() {
    if (!progress.bossUnlocked && !canUnlockChapterOneBoss(progress)) {
      return;
    }

    saveProgress(setCurrentChapter(progress, chapter.id));
    setRoute({ view: 'boss' });
  }

  function completeTutorial() {
    setProgress((currentProgress) => markTutorialComplete(currentProgress));
  }

  function completeBattle(encounterId: string) {
    setProgress((currentProgress) => markBattleComplete(currentProgress, encounterId));
  }

  function completeBoss() {
    setProgress((currentProgress) => markBossDefeated(currentProgress, chapter));
  }

  function completeSideQuest(questId: string) {
    setProgress((currentProgress) => markSideQuestComplete(currentProgress, questId));
  }

  if (route.view === 'chapter') {
    return (
      <ChapterFlow
        onTutorialComplete={completeTutorial}
        onBattleComplete={completeBattle}
        onReturnToMap={goToMap}
      />
    );
  }

  if (route.view === 'battle') {
    return (
      <BattleScreen
        chapter={chapter}
        encounter={getChapterOneEncounter(0)}
        onBattleComplete={completeBattle}
        onReturnToMap={goToMap}
      />
    );
  }

  if (route.view === 'sideQuest') {
    const quest = getChapterOneSideQuest(route.questId);

    if (!quest) {
      return (
        <WorldMap
          chapter={chapter}
          progress={progress}
          onStartChapter={startChapter}
          onStartBattle={startBattle}
          onStartSideQuest={startSideQuest}
          onStartBoss={startBoss}
        />
      );
    }

    return (
      <SideQuestScreen
        quest={quest}
        isComplete={progress.completedSideQuests.includes(quest.id)}
        onComplete={completeSideQuest}
        onReturnToMap={goToMap}
      />
    );
  }

  if (route.view === 'boss') {
    return (
      <BattleScreen
        chapter={chapter}
        encounter={getChapterOneBossFight()}
        onBattleComplete={completeBoss}
        onReturnToMap={goToMap}
      />
    );
  }

  return (
    <WorldMap
      chapter={chapter}
      progress={progress}
      onStartChapter={startChapter}
      onStartBattle={startBattle}
      onStartSideQuest={startSideQuest}
      onStartBoss={startBoss}
    />
  );
}
