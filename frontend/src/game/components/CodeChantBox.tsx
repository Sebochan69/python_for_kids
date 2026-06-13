import type { BattleChallengeData } from '../battle/types';

type CodeChantBoxProps = {
  challenge: BattleChallengeData;
  answer: string;
  disabled?: boolean;
  showInput?: boolean;
  onAnswerChange: (answer: string) => void;
  onCast: () => void;
};

function renderStarterCode(challenge: BattleChallengeData) {
  const blankToken = challenge.blankToken ?? '___';
  const [beforeBlank, afterBlank] = challenge.starterCode.split(blankToken);

  if (challenge.challengeType !== 'fill_blank' || afterBlank === undefined) {
    return <code>{challenge.starterCode}</code>;
  }

  return (
    <code>
      {beforeBlank}
      <span className="code-blank">{blankToken}</span>
      {afterBlank}
    </code>
  );
}

export function CodeChantBox({
  challenge,
  answer,
  disabled = false,
  showInput = true,
  onAnswerChange,
  onCast,
}: CodeChantBoxProps) {
  const answerFieldId = `code-chant-answer-${challenge.id}`;

  return (
    <section className="code-chant" aria-labelledby="code-chant-title">
      <div className="section-heading">
        <span className="section-kicker">Code Chant</span>
        <h2 id="code-chant-title">{challenge.title}</h2>
      </div>
      <p>{challenge.prompt}</p>
      <pre className="code-chant__code">{renderStarterCode(challenge)}</pre>
      {showInput ? (
        <>
          <label className="code-chant__label" htmlFor={answerFieldId}>
            Missing code for ___
          </label>
          <p className="code-chant__helper">
            Pick the spell card, then type only the code that belongs in the blank.
          </p>
          <form
            className="code-chant__row"
            autoComplete="off"
            onSubmit={(event) => {
              event.preventDefault();

              if (!disabled && answer.trim().length > 0) {
                onCast();
              }
            }}
          >
            {challenge.answerMode === 'full_code' ? (
              <textarea
                id={answerFieldId}
                className="code-chant__input code-chant__textarea"
                value={answer}
                placeholder="Type the guided code"
                rows={5}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(event) => onAnswerChange(event.target.value)}
              />
            ) : (
              <input
                id={answerFieldId}
                className="code-chant__input"
                type="text"
                value={answer}
                placeholder="Type the missing code"
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(event) => onAnswerChange(event.target.value)}
              />
            )}
            <button className="cast-button" type="submit" disabled={disabled || answer.trim().length === 0}>
              Cast
            </button>
          </form>
        </>
      ) : (
        <p className="code-chant__helper">
          Type the missing code in the wizard&apos;s chant bubble, then cast the spell.
        </p>
      )}
    </section>
  );
}
