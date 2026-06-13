import { useMemo, useState } from 'react';
import { BattleScreen } from '../components/BattleScreen';
import { SpellbookReferenceScreen } from '../components/SpellbookReferenceScreen';
import { SpellbookModal } from '../components/SpellbookModal';
import { TutorialScreen } from '../components/TutorialScreen';
import { getChapterOneEncounter, getSpellById, loadChapterOne } from '../data/loadGameContent';
import './ChapterFlow.css';

type ChapterStep = 'intro' | 'tutorial' | 'spellbook' | 'battle';

type ChapterFlowProps = {
  onTutorialComplete?: () => void;
  onBattleComplete?: (encounterId: string) => void;
  onReturnToMap?: () => void;
};

export function ChapterFlow({ onTutorialComplete, onBattleComplete, onReturnToMap }: ChapterFlowProps) {
  const chapter = loadChapterOne();
  const encounter = useMemo(() => getChapterOneEncounter(0), []);
  const [step, setStep] = useState<ChapterStep>('intro');
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const introSpell = getSpellById(encounter.challenge.spellEffect.spellId);

  if (step === 'intro') {
    return (
      <main className="chapter-screen chapter-screen--intro">
        <section className="chapter-panel" aria-labelledby="chapter-title">
          <span className="section-kicker">Chapter {chapter.chapterNumber ?? 1}</span>
          <h1 id="chapter-title">{chapter.title}</h1>
          <p className="chapter-lede">{chapter.summary}</p>
          <div className="chapter-story-card">
            <h2>Story Intro</h2>
            <p>
              The tower gates are dim. Your first magic lesson is to store spell words and mana numbers in crystals
              so Python can remember them.
            </p>
          </div>
          <div className="chapter-actions">
            <button className="cast-button" type="button" onClick={() => setStep('tutorial')}>
              Start Tutorial
            </button>
            {onReturnToMap ? (
              <button className="utility-button" type="button" onClick={onReturnToMap}>
                World Map
              </button>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  if (step === 'tutorial') {
    return (
      <>
        <TutorialScreen
          chapter={chapter}
          onOpenSpellbook={() => setIsSpellbookOpen(true)}
          onContinue={() => {
            onTutorialComplete?.();
            setStep('spellbook');
          }}
        />
        <SpellbookModal
          chapter={chapter}
          selectedSpell={introSpell}
          isOpen={isSpellbookOpen}
          onClose={() => setIsSpellbookOpen(false)}
        />
      </>
    );
  }

  if (step === 'spellbook') {
    return (
      <SpellbookReferenceScreen
        chapter={chapter}
        featuredSpell={introSpell}
        onStartBattle={() => setStep('battle')}
      />
    );
  }

  return (
    <BattleScreen
      chapter={chapter}
      encounter={encounter}
      onBattleComplete={onBattleComplete}
      onReturnToMap={onReturnToMap}
    />
  );
}
