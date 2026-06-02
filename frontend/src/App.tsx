import { useState, type KeyboardEvent } from 'react';
import { runCode } from './api';
import { explainStoryStep, giveMissionHint, type HelperResponse } from './helper';
import { LESSONS } from './lessons';
import { buildStoryCards, type StoryCard } from './story';
import { conceptLabel, validateMission } from './validation';
import type { RunCodeResponse } from './types';

const STORY_BADGES: Record<StoryCard['kind'], string> = {
  start: 'Go',
  memory: 'Box',
  change: 'Swap',
  say: 'Talk',
  error: 'Fix',
  finish: 'Done',
};

export function App() {
  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id);
  const activeLessonIndex = LESSONS.findIndex((lesson) => lesson.id === activeLessonId);
  const activeLesson = LESSONS[activeLessonIndex] ?? LESSONS[0];
  const nextLesson = LESSONS[activeLessonIndex + 1];
  const [code, setCode] = useState(activeLesson.starter_code);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [codeScrollTop, setCodeScrollTop] = useState(0);
  const [selectedStoryCardId, setSelectedStoryCardId] = useState<string | null>(null);
  const [helperResponse, setHelperResponse] = useState<HelperResponse | null>(null);
  const storyCards = runResult ? buildStoryCards(runResult.events) : [];
  const selectedStoryCard = storyCards.find((card) => card.id === selectedStoryCardId) ?? null;
  const validationResult = validateMission(activeLesson, runResult, code);
  const codeLines = code.split('\n');

  function loadLesson(lessonId: string) {
    const lesson = LESSONS.find((candidate) => candidate.id === lessonId) ?? LESSONS[0];

    setActiveLessonId(lesson.id);
    setCode(lesson.starter_code);
    setRunResult(null);
    setRunError(null);
    setHighlightedLine(null);
    setCodeScrollTop(0);
    setSelectedStoryCardId(null);
    setHelperResponse(null);
  }

  function resetMission() {
    setCode(activeLesson.starter_code);
    setRunResult(null);
    setRunError(null);
    setHighlightedLine(null);
    setCodeScrollTop(0);
    setSelectedStoryCardId(null);
    setHelperResponse(null);
  }

  function selectStoryCard(card: StoryCard) {
    setHighlightedLine(card.lineNumber);
    setSelectedStoryCardId(card.id);
  }

  function handleStoryCardKeyDown(event: KeyboardEvent<HTMLLIElement>, card: StoryCard) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectStoryCard(card);
    }
  }

  async function handleRunMission() {
    setIsRunning(true);
    setRunError(null);
    setHighlightedLine(null);
    setSelectedStoryCardId(null);
    setHelperResponse(null);

    try {
      const result = await runCode(code);
      setRunResult(result);
    } catch (error) {
      setRunResult(null);
      setRunError(error instanceof Error ? error.message : 'Python did not answer.');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#code-title">
        Skip to code
      </a>
      <header className="top-bar">
        <div>
          <p className="eyebrow">Python for Kids</p>
          <h1>{activeLesson.title}</h1>
          <p className="app-subtitle">Write tiny code. Run it. Watch Python's story.</p>
          <div className="adventure-trail" aria-label="Mission path">
            <span>Pick</span>
            <span>Code</span>
            <span>Run</span>
            <span>Learn</span>
          </div>
        </div>
        <button type="button" onClick={resetMission}>
          Reset Code
        </button>
      </header>

      <section className="workspace-grid" aria-label="Python mission workspace">
        <section className="mission-card" aria-labelledby="mission-title">
          <span className="section-kicker">Mission</span>
          <label className="mission-picker">
            <strong>Choose a mission</strong>
            <select value={activeLesson.id} onChange={(event) => loadLesson(event.target.value)}>
              {LESSONS.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </label>
          <h2 id="mission-title">{activeLesson.mission_prompt}</h2>
          <p>{activeLesson.summary}</p>
          <div className="mission-meta" aria-label="Mission details">
            <span>{activeLesson.difficulty}</span>
            <span>{activeLesson.topic}</span>
            <span>Ages {activeLesson.age_range}</span>
          </div>
          <div className="mission-badge-strip" aria-label="Mission rewards">
            {activeLesson.required_concepts.map((concept) => (
              <span key={concept}>{conceptLabel(concept)}</span>
            ))}
          </div>
          <ul>
            {activeLesson.learning_goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </section>

        <section className="code-card" aria-labelledby="code-title">
          <div className="card-header">
            <h2 id="code-title">Your Code</h2>
            <button type="button" onClick={handleRunMission} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Mission'}
            </button>
          </div>
          <p id="code-help" className="code-help">
            Change the code, then run the mission to see what Python does.
          </p>
          {isRunning && (
            <p className="run-status" role="status" aria-live="polite">
              Python is trying the mission now...
            </p>
          )}
          <div className="editor-frame">
            <div className="editor-line-numbers" aria-hidden="true">
              <ol style={{ transform: `translateY(-${codeScrollTop}px)` }}>
                {codeLines.map((_, index) => (
                  <li key={index + 1}>{index + 1}</li>
                ))}
              </ol>
            </div>
            <textarea
              aria-label="Python code"
              aria-describedby="code-help"
              spellCheck={false}
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setHighlightedLine(null);
              }}
              onScroll={(event) => setCodeScrollTop(event.currentTarget.scrollTop)}
            />
          </div>
          <div className="code-map" aria-label="Code line map">
            <span>Code Map</span>
            <ol>
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightedLine === lineNumber;

                return (
                  <li key={`${lineNumber}-${line}`} className={isHighlighted ? 'is-highlighted' : ''}>
                    <em>{lineNumber}</em>
                    <code>{line || ' '}</code>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="story-card" aria-labelledby="story-title">
          <h2 id="story-title">What Python Did</h2>
          {runError && (
            <p className="error-message" role="alert">
              {runError}
            </p>
          )}
          {isRunning && (
            <p className="empty-message" role="status" aria-live="polite">
              Python is making the story steps...
            </p>
          )}
          {!runResult && !runError && !isRunning && (
            <p className="empty-message">Press Run Mission to see Python's story.</p>
          )}
          {runResult && (
            <ol className="story-list" aria-live="polite">
              {storyCards.map((card, index) => (
                <li
                  key={card.id}
                  className={`story-step story-step--${card.kind} ${
                    card.lineNumber !== null && highlightedLine === card.lineNumber ? 'is-selected' : ''
                  }`}
                  aria-label={`${card.title}. ${card.detail}`}
                  aria-selected={selectedStoryCardId === card.id}
                  onBlur={() => setHighlightedLine(null)}
                  onClick={() => selectStoryCard(card)}
                  onFocus={() => {
                    setHighlightedLine(card.lineNumber);
                    setSelectedStoryCardId(card.id);
                  }}
                  onKeyDown={(event) => handleStoryCardKeyDown(event, card)}
                  onMouseEnter={() => setHighlightedLine(card.lineNumber)}
                  onMouseLeave={() => setHighlightedLine(null)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="story-step-shell">
                    <span className={`story-icon story-icon--${card.kind}`}>{STORY_BADGES[card.kind]}</span>
                    <div>
                      <span>Story Step {index + 1}</span>
                      <strong>{card.title}</strong>
                      <p>{card.detail}</p>
                      {card.lineNumber && <em>Code line {card.lineNumber}</em>}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {validationResult.status === 'complete' && (
            <div className="celebration-banner" role="status" aria-live="polite">
              <span>Mission unlocked</span>
              <strong>You earned today&apos;s coding badge.</strong>
              <p>Nice work. You made Python follow the mission from code to output.</p>
            </div>
          )}
          {validationResult.status === 'complete' && nextLesson && (
            <button type="button" onClick={() => loadLesson(nextLesson.id)}>
              Next Mission: {nextLesson.title}
            </button>
          )}
          <div className="helper-card" aria-label="Mission helper">
            <div className="helper-heading">
              <span className="buddy-face" aria-hidden="true">Hi</span>
              <div>
                <span>Code Buddy</span>
                <p>Small clues, no full answers.</p>
              </div>
            </div>
            <div className="helper-actions">
              <button type="button" onClick={() => setHelperResponse(explainStoryStep(selectedStoryCard))}>
                Explain Step
              </button>
              <button type="button" onClick={() => setHelperResponse(giveMissionHint(activeLesson, validationResult))}>
                Hint Please
              </button>
            </div>
            {helperResponse ? (
              <div className="helper-response" aria-live="polite">
                <strong>{helperResponse.title}</strong>
                <p>{helperResponse.message}</p>
              </div>
            ) : (
              <p className="empty-message">Need help? Try a hint or pick a story step.</p>
            )}
          </div>
        </section>

        <section className="output-card" aria-labelledby="output-title">
          <h2 id="output-title">Python Says</h2>
          <pre aria-live="polite">{isRunning ? 'Python is thinking...' : runResult?.stdout || '(nothing yet)'}</pre>
          {runResult?.stderr && (
            <p className="error-message" role="alert">
              {runResult.stderr}
            </p>
          )}
          <div
            className={`validation-card validation-card--${validationResult.status}`}
            role="status"
            aria-live="polite"
          >
            <span>Mission Check</span>
            <strong>{validationResult.title}</strong>
            <p>{validationResult.message}</p>
            {runResult && (
              <dl>
                <div>
                  <dt>Goal</dt>
                  <dd>{validationResult.expectedOutput || '(nothing)'}</dd>
                </div>
                <div>
                  <dt>Python said</dt>
                  <dd>{validationResult.actualOutput || '(nothing)'}</dd>
                </div>
              </dl>
            )}
            <div className="concept-badges" aria-label="Mission skill badges">
              <span>Badge Room</span>
              <ul>
                {validationResult.concepts.required.map((concept) => {
                  const isFound = validationResult.concepts.found.includes(concept);

                  return (
                    <li key={concept} className={isFound ? 'is-earned' : 'is-waiting'}>
                      {conceptLabel(concept)}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
