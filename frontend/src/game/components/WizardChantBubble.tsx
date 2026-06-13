import type { BattleChallengeData, BattleFeedbackKind } from '../battle/types';

type WizardChantBubbleProps = {
  challenge: BattleChallengeData;
  answer: string;
  disabled?: boolean;
  feedbackKind?: BattleFeedbackKind;
  onAnswerChange: (answer: string) => void;
  onCast: () => void;
};

export function WizardChantBubble({
  challenge,
  answer,
  disabled = false,
  feedbackKind,
  onAnswerChange,
  onCast,
}: WizardChantBubbleProps) {
  const answerFieldId = `wizard-chant-answer-${challenge.id}`;
  const bubbleMood = feedbackKind ? `wizard-chant-bubble--${feedbackKind}` : '';

  return (
    <form
      className={`wizard-chant-bubble ${bubbleMood}`}
      autoComplete="off"
      aria-label="Wizard code chant"
      onSubmit={(event) => {
        event.preventDefault();

        if (!disabled && answer.trim().length > 0) {
          onCast();
        }
      }}
    >
      <label className="wizard-chant-bubble__label" htmlFor={answerFieldId}>
        Chant the missing code
      </label>
      {challenge.answerMode === 'full_code' ? (
        <textarea
          id={answerFieldId}
          className="wizard-chant-bubble__input wizard-chant-bubble__textarea"
          value={answer}
          placeholder="Type the guided code"
          rows={3}
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
          className="wizard-chant-bubble__input"
          type="text"
          value={answer}
          placeholder="Type the blank"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => onAnswerChange(event.target.value)}
        />
      )}
      <button className="wizard-chant-bubble__cast cast-button" type="submit" disabled={disabled || answer.trim().length === 0}>
        Cast
      </button>
    </form>
  );
}
