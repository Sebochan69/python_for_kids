import type { SyntheticEvent } from 'react';
import type { GameChapterData } from '../battle/types';
import type { GameProgress } from '../progress/progressStore';
import { getBossUnlockSummary } from '../progress/progressStore';
import './WorldMap.css';

type WorldMapProps = {
  chapter: GameChapterData;
  progress: GameProgress;
  onStartChapter: () => void;
  onStartBattle: () => void;
  onStartSideQuest: (questId: string) => void;
  onStartBoss: () => void;
};

const MAP_ASSETS = {
  base: '/assets/map/world_map_base.png',
  unlocked: '/assets/map/chapter_node_unlocked.png',
  locked: '/assets/map/chapter_node_locked.png',
  completed: '/assets/map/chapter_node_completed.png',
  sideQuest: '/assets/map/sidequest_node.png',
  boss: '/assets/map/boss_node.png',
  guildCity: '/assets/map/guild_city_locked_preview.png',
};

const FUTURE_CHAPTERS = [
  'Chapter 2: Rune Forest — If Statements',
  'Chapter 3: Spell Shrine — Functions',
  'Chapter 4: Loop Cavern — Loops',
  'Chapter 5: Array Harbor — Lists',
  'Chapter 6: Dictionary Market — Dictionaries',
  'Chapter 7: Debugging Dungeon — Errors',
  'Chapter 8: Class Castle — OOP',
];

function hideMissingAsset(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0';
}

export function WorldMap({
  chapter,
  progress,
  onStartChapter,
  onStartBattle,
  onStartSideQuest,
  onStartBoss,
}: WorldMapProps) {
  const unlockSummary = getBossUnlockSummary(progress);
  const chapterCompleted = progress.bossDefeated;
  const battleComplete = chapter.battles.some((battle) => progress.completedBattles.includes(battle.id));

  return (
    <main className="world-map-screen">
      <header className="world-map-header">
        <div>
          <span className="section-kicker">World Map</span>
          <h1>Python Wizard RPG</h1>
          <p>Choose a path, finish side quests, and unlock the tower boss.</p>
        </div>
      </header>

      <section className="world-map-layout">
        <div className="world-map-board" aria-label="JRPG world map">
          <img className="world-map-board__base" src={MAP_ASSETS.base} alt="" onError={hideMissingAsset} />

          <button className="map-node map-node--chapter" type="button" onClick={onStartChapter}>
            <img src={chapterCompleted ? MAP_ASSETS.completed : MAP_ASSETS.unlocked} alt="" onError={hideMissingAsset} />
            <span>Chapter 1</span>
            <strong>{chapter.title}</strong>
            <small>{progress.completedTutorial ? 'Tutorial complete' : 'Start tutorial'}</small>
          </button>

          <button className="map-node map-node--battle" type="button" onClick={onStartBattle}>
            <img src={battleComplete ? MAP_ASSETS.completed : MAP_ASSETS.unlocked} alt="" onError={hideMissingAsset} />
            <span>Battle</span>
            <strong>{chapter.battles[0]?.title ?? 'Mana Battle'}</strong>
            <small>{battleComplete ? 'Complete' : 'Practice variables'}</small>
          </button>

          <div className="map-side-quest-lane" aria-label="Chapter 1 side quests">
            {chapter.sideQuests.map((quest) => {
              const isComplete = progress.completedSideQuests.includes(quest.id);

              return (
                <button className="map-node map-node--sidequest" type="button" key={quest.id} onClick={() => onStartSideQuest(quest.id)}>
                  <img src={isComplete ? MAP_ASSETS.completed : MAP_ASSETS.sideQuest} alt="" onError={hideMissingAsset} />
                  <span>Side Quest</span>
                  <strong>{quest.title}</strong>
                  <small>{isComplete ? 'Complete' : quest.giverName}</small>
                </button>
              );
            })}
          </div>

          <button
            className={`map-node map-node--boss ${unlockSummary.isUnlocked ? '' : 'is-locked'}`}
            type="button"
            onClick={onStartBoss}
            disabled={!unlockSummary.isUnlocked}
          >
            <img src={MAP_ASSETS.boss} alt="" onError={hideMissingAsset} />
            <span>Boss</span>
            <strong>Locked Tower Core</strong>
            <small>{progress.bossDefeated ? 'Defeated' : unlockSummary.isUnlocked ? 'Unlocked' : 'Locked'}</small>
          </button>
        </div>

        <aside className="world-map-panel">
          <section className="map-progress-card">
            <span className="section-kicker">Boss Door</span>
            <h2>{unlockSummary.isUnlocked ? 'Unlocked' : 'Locked'}</h2>
            <ul>
              <li className={unlockSummary.completedTutorial ? 'is-complete' : ''}>Tutorial complete</li>
              <li className={unlockSummary.normalBattlesComplete >= unlockSummary.requiredNormalBattles ? 'is-complete' : ''}>
                1 normal battle complete
              </li>
              <li className={unlockSummary.sideQuestsComplete >= unlockSummary.requiredSideQuests ? 'is-complete' : ''}>
                3 side quests complete
              </li>
            </ul>
          </section>

          <section className="map-progress-card">
            <span className="section-kicker">Locked Previews</span>
            <h2>Coming Paths</h2>
            <div className="locked-chapter-list">
              {FUTURE_CHAPTERS.map((futureChapter) => (
                <div className="locked-preview" key={futureChapter}>
                  <img src={MAP_ASSETS.locked} alt="" onError={hideMissingAsset} />
                  <span>{futureChapter}</span>
                </div>
              ))}
              <div className="locked-preview locked-preview--guild">
                <img src={MAP_ASSETS.guildCity} alt="" onError={hideMissingAsset} />
                <span>Advanced Route: Guild City — Files, Modules, Imports, Party Members</span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
