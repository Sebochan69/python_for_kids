import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
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
const PYTHON_TOKEN_PATTERN =
  /(#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|for|in|if|else|elif|return|True|False|None|range)\b|\b(?:print|len|str|int|float|list|dict|sum)\b|\b\d+(?:\.\d+)?\b|[()+\-*/=<>:,.])/g;
const PYTHON_KEYWORDS = new Set(['def', 'for', 'in', 'if', 'else', 'elif', 'return', 'True', 'False', 'None', 'range']);
const PYTHON_BUILTINS = new Set(['print', 'len', 'str', 'int', 'float', 'list', 'dict', 'sum']);
type BuddyAction = 'explain' | 'hint' | null;

function tokenClassName(token: string) {
  if (token.startsWith('#')) {
    return 'syntax-token syntax-comment';
  }

  if (token.startsWith('"') || token.startsWith("'")) {
    return 'syntax-token syntax-string';
  }

  if (/^\d/.test(token)) {
    return 'syntax-token syntax-number';
  }

  if (PYTHON_KEYWORDS.has(token)) {
    return 'syntax-token syntax-keyword';
  }

  if (PYTHON_BUILTINS.has(token)) {
    return 'syntax-token syntax-builtin';
  }

  return 'syntax-token syntax-operator';
}

function highlightPythonLine(line: string): ReactNode[] {
  const highlightedLine: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(PYTHON_TOKEN_PATTERN)) {
    const token = match[0];
    const tokenIndex = match.index ?? 0;

    if (tokenIndex > lastIndex) {
      highlightedLine.push(line.slice(lastIndex, tokenIndex));
    }

    highlightedLine.push(
      <span key={`${token}-${tokenIndex}`} className={tokenClassName(token)}>
        {token}
      </span>,
    );
    lastIndex = tokenIndex + token.length;
  }

  if (lastIndex < line.length) {
    highlightedLine.push(line.slice(lastIndex));
  }

  return highlightedLine;
}

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
  const [isBuddyOpen, setIsBuddyOpen] = useState(false);
  const [buddyAction, setBuddyAction] = useState<BuddyAction>(null);
  const [helperResponse, setHelperResponse] = useState<HelperResponse | null>(null);
  const storyCards = runResult ? buildStoryCards(runResult.events) : [];
  const selectedStoryCard = storyCards.find((card) => card.id === selectedStoryCardId) ?? null;
  const validationResult = validateMission(activeLesson, runResult, code);
  const codeLines = code.split('\n');
  const activeQuestNumber = activeLessonIndex + 1;
  const buddyState = (() => {
    if (isRunning) {
      return 'thinking';
    }

    if (validationResult.status === 'complete') {
      return 'celebrating';
    }

    if (runError || runResult?.status === 'error' || runResult?.status === 'timeout') {
      return 'encouraging';
    }

    if (buddyAction === 'hint') {
      return 'hinting';
    }

    if (buddyAction === 'explain') {
      return 'explaining';
    }

    if (selectedStoryCard) {
      return 'explaining';
    }

    return 'idle';
  })();
  const buddyCopy = {
    idle: {
      title: 'Ready for a quest',
      message: 'Write a tiny bit of Python, then run it to see the adventure log.',
    },
    thinking: {
      title: 'Checking the code',
      message: 'I am watching what Python does, one step at a time.',
    },
    celebrating: {
      title: 'You got it',
      message: 'Great job. You solved the quest from code to output.',
    },
    encouraging: {
      title: 'Are you sure about that?',
      message: 'Something surprised Python. Check the Fix step and try one small change.',
    },
    explaining: {
      title: 'Step selected',
      message: 'Press Explain Step and I will talk about this part of Python.',
    },
    hinting: {
      title: 'Hint mode',
      message: 'I will give a clue, not the full answer. You still get to solve it.',
    },
  }[buddyState];
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
    setIsBuddyOpen(false);
    setBuddyAction(null);
    setHelperResponse(null);
  }

  function resetMission() {
    setCode(activeLesson.starter_code);
    setRunResult(null);
    setRunError(null);
    setHighlightedLine(null);
    setCodeScrollTop(0);
    setSelectedStoryCardId(null);
    setIsBuddyOpen(false);
    setBuddyAction(null);
    setHelperResponse(null);
  }

  function selectStoryCard(card: StoryCard) {
    setHighlightedLine(card.lineNumber);
    setSelectedStoryCardId(card.id);
  }

  function previewStoryCardLine(card: StoryCard) {
    setHighlightedLine(card.lineNumber);
  }

  function restoreSelectedStoryCardLine() {
    setHighlightedLine(selectedStoryCard?.lineNumber ?? null);
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

  function handleExplainStep() {
    setHelperResponse(explainStoryStep(selectedStoryCard));
    setBuddyAction('explain');
    setIsBuddyOpen(true);
  }

  function handleHintRequest() {
    setHelperResponse(giveMissionHint(activeLesson, validationResult));
    setBuddyAction('hint');
    setIsBuddyOpen(true);
  }

  async function handleRunMission() {
    setIsRunning(true);
    setRunError(null);
    setHighlightedLine(null);
    setSelectedStoryCardId(null);
    setIsBuddyOpen(true);
    setBuddyAction(null);
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
          <h1>Python for Kids</h1>
          <p className="app-subtitle">A playful coding lab for classroom Python foundations.</p>
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
          <ul>
            {activeLesson.learning_goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </section>

        <section className="coding-station" aria-label="Coding station">
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
              <div className="editor-code-layer">
                <pre className="syntax-highlight" aria-hidden="true" style={{ transform: `translateY(-${codeScrollTop}px)` }}>
                  {codeLines.map((line, index) => (
                    <span className="syntax-line" key={`${index}-${line}`}>
                      {highlightPythonLine(line)}
                      {index < codeLines.length - 1 ? '\n' : null}
                    </span>
                  ))}
                </pre>
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
            </div>
          </section>

          <section className="output-card" aria-labelledby="output-title">
            <h2 id="output-title">Python Printed</h2>
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
                    <dt>Python printed</dt>
                    <dd>{validationResult.actualOutput || '(nothing)'}</dd>
                  </div>
                </dl>
              )}
            </div>
          </section>
        </section>

        <section className="story-card" aria-labelledby="story-title">
          <h2 id="story-title">Adventure Log</h2>
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
                  className={`story-step story-step--${card.kind} ${selectedStoryCardId === card.id ? 'is-selected' : ''}`}
                  aria-label={`${card.title}. ${card.detail}`}
                  aria-selected={selectedStoryCardId === card.id}
                  onBlur={restoreSelectedStoryCardLine}
                  onClick={() => selectStoryCard(card)}
                  onFocus={() => previewStoryCardLine(card)}
                  onKeyDown={(event) => handleStoryCardKeyDown(event, card)}
                  onMouseEnter={() => previewStoryCardLine(card)}
                  onMouseLeave={restoreSelectedStoryCardLine}
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
          {validationResult.status === 'complete' && nextLesson && (
            <button type="button" onClick={() => loadLesson(nextLesson.id)}>
              Next Quest: {nextLesson.title}
            </button>
          )}
        </section>

      </section>
      <aside className={`floating-buddy floating-buddy--${buddyState}`} aria-label="Code Buddy helper">
        {isBuddyOpen && (
          <div className="buddy-bubble" role="dialog" aria-label="Code Buddy message">
            <button
              type="button"
              className="buddy-close"
              aria-label="Close Code Buddy message"
              onClick={() => setIsBuddyOpen(false)}
            >
              Close
            </button>
            <span className="buddy-label">Code Buddy</span>
            {helperResponse ? (
              <div className="helper-response" aria-live="polite">
                <strong>{helperResponse.title}</strong>
                <p>{helperResponse.message}</p>
              </div>
            ) : (
              <div className="buddy-context" aria-live="polite">
                <strong>{buddyCopy.title}</strong>
                <p>{buddyCopy.message}</p>
              </div>
            )}
            <div className="helper-actions">
              <button type="button" onClick={handleExplainStep}>
                Explain Step
              </button>
              <button type="button" onClick={handleHintRequest}>
                Hint Please
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className="robot-button"
          aria-label={isBuddyOpen ? 'Hide Code Buddy tips' : 'Ask Code Buddy for help'}
          aria-expanded={isBuddyOpen}
          onClick={() => {
            setIsBuddyOpen((isOpen) => !isOpen);
            if (isBuddyOpen) {
              setHelperResponse(null);
              setBuddyAction(null);
            }
          }}
        >
          <span className="robot-guide" aria-hidden="true">
            <span className="robot-signal">!</span>
            <span className="robot-antenna" />
            <span className="robot-head">
              <span className="robot-brow robot-brow--left" />
              <span className="robot-brow robot-brow--right" />
              <span className="robot-eye robot-eye--left" />
              <span className="robot-eye robot-eye--right" />
              <span className="robot-mouth" />
            </span>
            <span className="robot-arm robot-arm--left" />
            <span className="robot-arm robot-arm--right" />
            <span className="robot-body">
              <span />
              <span />
            </span>
          </span>
          <span>Help</span>
        </button>
      </aside>
    </main>
  );
}
