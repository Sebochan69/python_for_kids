import { useState } from 'react';
import { runCode } from './api';
import { buildStoryCards } from './story';
import type { RunCodeResponse } from './types';

const STARTER_CODE = 'x = 1\nx = x + 1\nprint(x)';

export function App() {
  const [code, setCode] = useState(STARTER_CODE);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const storyCards = runResult ? buildStoryCards(runResult.events) : [];
  const codeLines = code.split('\n');

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
          <h1>Tiny Python Mission</h1>
        </div>
        <button type="button" onClick={() => setCode(STARTER_CODE)}>
          Reset Code
        </button>
      </header>

      <section className="workspace-grid" aria-label="Python mission workspace">
        <section className="mission-card" aria-labelledby="mission-title">
          <span>Mission</span>
          <h2 id="mission-title">Make Python count to 2</h2>
          <p>
            Run this code and watch Python remember a number, change it, and say
            the answer.
          </p>
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
        </section>

        <section className="output-card" aria-labelledby="output-title">
          <h2 id="output-title">Python Says</h2>
          <pre>{runResult?.stdout || '(nothing yet)'}</pre>
          {runResult?.stderr && <p className="error-message">{runResult.stderr}</p>}
        </section>
      </section>
    </main>
  );
}
