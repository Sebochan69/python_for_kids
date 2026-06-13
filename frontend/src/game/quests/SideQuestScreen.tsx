import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import type { GameSideQuestData } from '../battle/types';
import { validateAnswer } from '../battle/validateAnswer';
import { CodeChantBox } from '../components/CodeChantBox';
import { CompanionHint } from '../components/CompanionHint';
import '../components/BattleScreen.css';
import './SideQuestScreen.css';

const WIZARD_ASSETS = {
  idle: '/assets/characters/wizard/wizard_idle.png',
  cast: '/assets/characters/wizard/wizard_cast.png',
  hurt: '/assets/characters/wizard/wizard_hurt.png',
  victory: '/assets/characters/wizard/wizard_victory.png',
};

const TRAINING_DUMMY_ASSET = '/assets/enemies/training-dummy/dummy_idle.png';

function hideMissingAsset(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0';
}

type SideQuestScreenProps = {
  quest: GameSideQuestData;
  isComplete: boolean;
  onComplete: (questId: string) => void;
  onReturnToMap: () => void;
};

export function SideQuestScreen({ quest, isComplete, onComplete, onReturnToMap }: SideQuestScreenProps) {
  const [answer, setAnswer] = useState('');
  const [wizardPose, setWizardPose] = useState<'idle' | 'cast' | 'hurt' | 'victory'>(isComplete ? 'victory' : 'idle');
  const [dummyAnimation, setDummyAnimation] = useState<'idle' | 'hurt'>(isComplete ? 'hurt' : 'idle');
  const [feedback, setFeedback] = useState(
    isComplete ? `${quest.rewardText} You can still practice this dojo drill.` : 'Train with the dummy: finish the code chant, then cast.',
  );
  const animationTimer = useRef<number | null>(null);

  useEffect(() => {
    setAnswer('');
    setWizardPose(isComplete ? 'victory' : 'idle');
    setDummyAnimation(isComplete ? 'hurt' : 'idle');
    setFeedback(isComplete ? `${quest.rewardText} You can still practice this dojo drill.` : 'Train with the dummy: finish the code chant, then cast.');
  }, [isComplete, quest]);

  function resetAnimationSoon(nextWizardPose: typeof wizardPose = 'idle') {
    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    animationTimer.current = window.setTimeout(() => {
      setWizardPose(nextWizardPose);
      setDummyAnimation('idle');
    }, 700);
  }

  function handleSubmit() {
    const result = validateAnswer(answer, quest.challenge.acceptedAnswers);

    if (result.isCorrect) {
      setFeedback(`${quest.challenge.spellEffect.successText ?? 'Nice cast.'} ${quest.rewardText}`);
      setWizardPose('victory');
      setDummyAnimation('hurt');
      setAnswer('');
      onComplete(quest.id);
      return;
    }

    setFeedback(`The dummy blocks that chant. Try this clue: ${quest.challenge.hints[0]}`);
    setWizardPose('hurt');
    resetAnimationSoon('idle');
  }

  return (
    <main className="side-quest-screen">
      <div className="battle-action-strip" aria-label="Side quest menu">
        <button className="utility-button" type="button" onClick={onReturnToMap}>
          Map
        </button>
      </div>

      <section className="side-quest-stage" aria-label="Dojo training stage">
        <div className="dojo-banner">
          <span className="section-kicker">Side Quest Dojo</span>
          <h1>{quest.title}</h1>
          <p>{quest.summary}</p>
        </div>

        <div className="fighter-area fighter-area--player">
          <div className="character-hud character-hud--player">
            <strong>Python Wizard</strong>
            <small>Training with {quest.giverName}</small>
          </div>
          <div className={`sprite-shell wizard-sprite wizard-sprite--${wizardPose}`}>
            <img src={WIZARD_ASSETS[wizardPose]} alt="Young Python wizard" onError={hideMissingAsset} />
          </div>
        </div>

        <div className={`side-quest-feedback-card ${isComplete ? 'is-complete' : ''}`} role="status">
          <span className="battle-outcome">{isComplete ? 'complete' : 'training'}</span>
          <p>{feedback}</p>
        </div>

        <div className="fighter-area fighter-area--enemy">
          <div className="character-hud character-hud--enemy">
            <strong>Training Dummy</strong>
            <small>Practice target: safe dojo drill</small>
          </div>
          <div className={`sprite-shell training-dummy-sprite training-dummy-sprite--${dummyAnimation}`}>
            <img src={TRAINING_DUMMY_ASSET} alt="Training dummy" onError={hideMissingAsset} />
          </div>
        </div>
      </section>

      <section className="side-quest-controls" aria-label="Dojo training commands">
        <article className="side-quest-story">
          <span className="section-kicker">{quest.giverName}</span>
          <h2>Dojo Drill</h2>
          <p>{quest.summary}</p>
          <strong>{quest.rewardText}</strong>
        </article>

        <CodeChantBox
          challenge={quest.challenge}
          answer={answer}
          disabled={false}
          onAnswerChange={setAnswer}
          onCast={handleSubmit}
        />

        <aside className="side-quest-helper">
          <CompanionHint
            challengeId={quest.challenge.id}
            spellId={quest.challenge.spellEffect.spellId}
            hints={quest.challenge.hints}
          />
        </aside>
      </section>
    </main>
  );
}
