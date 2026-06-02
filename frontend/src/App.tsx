import { useState } from 'react';
import { runCode } from './api';
import { LESSONS } from './lessons';
import { buildStoryCards } from './story';
import { conceptLabel, validateMission } from './validation';
import type { RunCodeResponse } from './types';

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
  const storyCards = runResult ? buildStoryCards(runResult.events) : [];
  const validationResult = validateMission(activeLesson, runResult, code);
  const codeLines = code.split('\n');

  function loadLesson(lessonId: string) {
    const lesson = LESSONS.find((candidate) => candidate.id === lessonId) ?? LESSONS[0];

    setActiveLessonId(lesson.id);
    setCode(lesson.starter_code);
    setRunResult(null);
    setRunError(null);
    setHighlightedLine(null);
  }

  function resetMission() {
    setCode(activeLesson.starter_code);
    setRunResult(null);
    setRunError(null);
    setHighlightedLine(null);
  }

  async function handleRunMission() {
    setIsRunning(true);
    setRunError(null);
    setHighlightedLine(null);

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
      <header className="top-bar">
        <div>
          <p className="eyebrow">Python for Kids</p>
          <h1>{activeLesson.title}</h1>
        </div>
        <button type="button" onClick={resetMission}>
          Reset Code
        </button>
      </header>

      <section className="workspace-grid" aria-label="Python mission workspace">
        <section className="mission-card" aria-labelledby="mission-title">
          <span>Mission</span>
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
          <textarea
            aria-label="Python code"
            spellCheck={false}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setHighlightedLine(null);
            }}
          />
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
          {runError && <p className="error-message">{runError}</p>}
          {!runResult && !runError && (
            <p className="empty-message">Press Run Mission to see Python's story.</p>
          )}
          {runResult && (
            <ol className="story-list">
              {storyCards.map((card, index) => (
                <li
                  key={card.id}
                  className={`story-step story-step--${card.kind} ${
                    card.lineNumber !== null && highlightedLine === card.lineNumber ? 'is-selected' : ''
                  }`}
                  onBlur={() => setHighlightedLine(null)}
                  onFocus={() => setHighlightedLine(card.lineNumber)}
                  onMouseEnter={() => setHighlightedLine(card.lineNumber)}
                  onMouseLeave={() => setHighlightedLine(null)}
                  tabIndex={0}
                >
                  <span>Story Step {index + 1}</span>
                  <strong>{card.title}</strong>
                  <p>{card.detail}</p>
                  {card.lineNumber && <em>Code line {card.lineNumber}</em>}
                </li>
              ))}
            </ol>
          )}
          {validationResult.status === 'complete' && nextLesson && (
            <button type="button" onClick={() => loadLesson(nextLesson.id)}>
              Next Mission: {nextLesson.title}
            </button>
          )}
        </section>

        <section className="output-card" aria-labelledby="output-title">
          <h2 id="output-title">Python Says</h2>
          <pre>{runResult?.stdout || '(nothing yet)'}</pre>
          {runResult?.stderr && <p className="error-message">{runResult.stderr}</p>}
          <div className={`validation-card validation-card--${validationResult.status}`}>
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
              <span>Skill badges</span>
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
