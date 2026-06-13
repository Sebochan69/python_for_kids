import type { GameChapterData } from '../battle/types';

type TutorialScreenProps = {
  chapter: GameChapterData;
  onContinue: () => void;
  onOpenSpellbook: () => void;
};

export function TutorialScreen({ chapter, onContinue, onOpenSpellbook }: TutorialScreenProps) {
  const firstStep = chapter.tutorial[0];

  return (
    <main className="chapter-screen chapter-screen--tutorial">
      <section className="chapter-panel tutorial-panel" aria-labelledby="tutorial-title">
        <span className="section-kicker">{chapter.gameTitle ?? 'Python Wizard RPG'}</span>
        <h1 id="tutorial-title">{chapter.title}</h1>
        <p className="chapter-lede">{chapter.summary}</p>

        <div className="tutorial-card">
          <span className="section-kicker">Concept</span>
          <h2>{chapter.topic ?? 'Variables'}</h2>
          <p>{firstStep?.narration ?? 'A variable is a name that remembers a value.'}</p>
        </div>

        <div className="tutorial-steps" aria-label="Tutorial steps">
          {chapter.tutorial.map((step) => (
            <article className="tutorial-step-card" key={step.id}>
              <h3>{step.title}</h3>
              <p>{step.narration}</p>
              {step.focusCode ? (
                <pre>
                  <code>{step.focusCode}</code>
                </pre>
              ) : null}
              {step.callout ? <strong>{step.callout}</strong> : null}
            </article>
          ))}
        </div>

        <div className="chapter-actions">
          <button className="utility-button" type="button" onClick={onOpenSpellbook}>
            Open Spellbook
          </button>
          <button className="cast-button" type="button" onClick={onContinue}>
            Continue to Spellbook
          </button>
        </div>
      </section>
    </main>
  );
}
