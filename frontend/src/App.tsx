import { useRef, useState, type KeyboardEvent } from 'react';
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

const INDENT = '    ';

export function App() {
  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id);
  const activeLessonIndex = LESSONS.findIndex((lesson) => lesson.id === activeLessonId);
  const activeLesson = LESSONS[activeLessonIndex] ?? LESSONS[0];
  const nextLesson = LESSONS[activeLessonIndex + 1];
  const [code, setCode] = useState(activeLesson.starter_code);
  const codeEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [codeScrollTop, setCodeScrollTop] = useState(0);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [selectedStoryCardId, setSelectedStoryCardId] = useState<string | null>(null);
  const [helperResponse, setHelperResponse] = useState<HelperResponse | null>(null);
  const storyCards = runResult ? buildStoryCards(runResult.events) : [];
  const selectedStoryCard = storyCards.find((card) => card.id === selectedStoryCardId) ?? null;
  const selectedStoryCardIndex = selectedStoryCard
    ? storyCards.findIndex((card) => card.id === selectedStoryCard.id)
    : -1;
  const validationResult = validateMission(activeLesson, runResult, code);
  const codeLines = code.split('\n');
  const activeQuestNumber = activeLessonIndex + 1;
  const earnedBadgeText = validationResult.concepts.found.map(conceptLabel).join(', ') || 'Quest Badge';
  const tryNextMessage = (() => {
    if (validationResult.status === 'not_run') {
      return 'Start by reading the goal, then press Run Quest.';
    }

    if (validationResult.status === 'complete') {
      return nextLesson ? 'Try the next quest when you are ready.' : 'You cleared every quest in this pack.';
    }

    if (runResult?.status === 'error') {
      return 'Pick the Fix step in the Adventure Log and check the matching code line.';
    }

    if (validationResult.concepts.missing.length > 0) {
      return `Try adding ${conceptLabel(validationResult.concepts.missing[0])}.`;
    }

    if (validationResult.actualOutput.trim().length > 0) {
      return 'Compare Python said with the Goal, then change one small thing.';
    }

    return 'Run the starter code first, then change one small thing.';
  })();

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

  function setCodeAndCursor(nextCode: string, selectionStart: number, selectionEnd = selectionStart) {
    setCode(nextCode);
    setHighlightedLine(null);

    window.requestAnimationFrame(() => {
      const editor = codeEditorRef.current;

      if (editor) {
        editor.selectionStart = selectionStart;
        editor.selectionEnd = selectionEnd;
      }
    });
  }

  function handleCodeKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab') {
      return;
    }

    event.preventDefault();

    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const currentCode = editor.value;

    if (event.shiftKey) {
      const lineStart = currentCode.lastIndexOf('\n', start - 1) + 1;
      const line = currentCode.slice(lineStart);
      const removableIndent = line.startsWith(INDENT)
        ? INDENT.length
        : Math.min(line.match(/^ +/)?.[0].length ?? 0, INDENT.length);

      if (removableIndent === 0) {
        return;
      }

      const nextCode = `${currentCode.slice(0, lineStart)}${currentCode.slice(lineStart + removableIndent)}`;
      const nextStart = Math.max(lineStart, start - removableIndent);
      const nextEnd = Math.max(nextStart, end - removableIndent);

      setCodeAndCursor(nextCode, nextStart, nextEnd);
      return;
    }

    const nextCode = `${currentCode.slice(0, start)}${INDENT}${currentCode.slice(end)}`;
    const nextCursor = start + INDENT.length;

    setCodeAndCursor(nextCode, nextCursor);
  }

  async function handleRunMission() {
    setIsRunning(true);
    setRunError(null);
    setHighlightedLine(null);
    setSelectedStoryCardId(null);
    setHelperResponse(null);

    try {
      const result = await runCode(code);
      const nextValidationResult = validateMission(activeLesson, result, code);

      setRunResult(result);

      if (nextValidationResult.status === 'complete') {
        setCompletedQuestIds((currentIds) => (
          currentIds.includes(activeLesson.id) ? currentIds : [...currentIds, activeLesson.id]
        ));
      }
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
          <p className="eyebrow">Classroom Coding Lab</p>
          <h1>Python for Kids</h1>
          <p className="app-subtitle">A playful coding lab for classroom Python foundations.</p>
          <div className="adventure-trail" aria-label="Mission path">
            <span>Pick</span>
            <span>Code</span>
            <span>Run</span>
            <span>Learn</span>
          </div>
          <nav className="quest-map" aria-label="Quest map">
            <span>
              Quest {activeQuestNumber} of {LESSONS.length}
            </span>
            <div>
              {LESSONS.map((lesson, index) => {
                const isActive = lesson.id === activeLesson.id;
                const isComplete = completedQuestIds.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    className={`quest-map-button ${isActive ? 'is-active' : ''} ${isComplete ? 'is-complete' : ''}`}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Quest ${index + 1}: ${lesson.title}${isComplete ? ', cleared' : ''}`}
                    onClick={() => loadLesson(lesson.id)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
        <button type="button" onClick={resetMission}>
          Reset Quest
        </button>
      </header>

      <section className="workspace-grid" aria-label="Python mission workspace">
        <section className="mission-card" aria-labelledby="mission-title">
          <span className="section-kicker">Quest</span>
          <div className="current-quest">
            <span>Current quest</span>
            <strong>{activeLesson.title}</strong>
          </div>
          <h2 id="mission-title">{activeLesson.mission_prompt}</h2>
          <div className="goal-box" aria-label="Quest goal">
            <span>Your Goal</span>
            <strong>Make Python say:</strong>
            <code>{activeLesson.expected_stdout || '(nothing)'}</code>
          </div>
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
            <h2 id="code-title">Code Box</h2>
            <button type="button" onClick={handleRunMission} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Quest'}
            </button>
          </div>
          <p id="code-help" className="code-help">
            Change the code, then run the quest to see what Python does.
          </p>
          {isRunning && (
            <p className="run-status" role="status" aria-live="polite">
              Python is trying the quest now...
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
              ref={codeEditorRef}
              aria-label="Python code"
              aria-describedby="code-help"
              spellCheck={false}
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setHighlightedLine(null);
              }}
              onKeyDown={handleCodeKeyDown}
              onScroll={(event) => setCodeScrollTop(event.currentTarget.scrollTop)}
            />
          </div>
        </section>

        <section className="story-card" aria-labelledby="story-title">
          <h2 id="story-title">Adventure Log</h2>
          <div className="selected-step-note" aria-live="polite">
            {selectedStoryCard ? (
              <>
                <span>Looking at Step {selectedStoryCardIndex + 1}</span>
                <strong>{selectedStoryCard.title}</strong>
                {selectedStoryCard.lineNumber && <em>This step uses code line {selectedStoryCard.lineNumber}.</em>}
              </>
            ) : (
              <>
                <span>Pick a step</span>
                <strong>Hover, tap, or focus a story step to see its code line.</strong>
              </>
            )}
          </div>
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
            <p className="empty-message">Press Run Quest to see Python's story.</p>
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
                  onMouseEnter={() => selectStoryCard(card)}
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
              <span>Quest cleared</span>
              <strong>Badge earned: {earnedBadgeText}</strong>
              <p>Nice work. You made Python follow the quest from code to output.</p>
            </div>
          )}
          {validationResult.status === 'complete' && nextLesson && (
            <button type="button" onClick={() => loadLesson(nextLesson.id)}>
              Next Quest: {nextLesson.title}
            </button>
          )}
          <div className="helper-card" aria-label="Mission helper">
            <div className="helper-heading">
              <span className="buddy-face" aria-hidden="true">Hi</span>
              <div>
                <span>Guide Message</span>
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
            <span>Quest Check</span>
            <strong>{validationResult.title}</strong>
            <p>{validationResult.message}</p>
            <p className="try-next">
              <span>Try next</span>
              {tryNextMessage}
            </p>
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
