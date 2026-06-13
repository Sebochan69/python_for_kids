import { useEffect, useRef, useState, type SyntheticEvent } from 'react';

type OwlCompanionProps = {
  challengeId: string;
  spellId: string | null;
  hints: string[];
};

const COMPANION_IDLE_ASSET = '/assets/companions/owl/companion_idle.png';
const COMPANION_PORTRAIT_ASSET = '/assets/companions/owl/companion_portrait.png';
const HINT_VISIBLE_MS = 5000;

function hideMissingAsset(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0';
}

export function OwlCompanion({ challengeId, spellId, hints }: OwlCompanionProps) {
  const [hintIndex, setHintIndex] = useState(-1);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const hideHintTimer = useRef<number | null>(null);

  useEffect(() => {
    setHintIndex(-1);
    setIsHintVisible(false);

    if (hideHintTimer.current) {
      window.clearTimeout(hideHintTimer.current);
    }
  }, [challengeId, spellId]);

  useEffect(() => {
    if (!isHintVisible) {
      return undefined;
    }

    if (hideHintTimer.current) {
      window.clearTimeout(hideHintTimer.current);
    }

    hideHintTimer.current = window.setTimeout(() => {
      setIsHintVisible(false);
    }, HINT_VISIBLE_MS);

    return () => {
      if (hideHintTimer.current) {
        window.clearTimeout(hideHintTimer.current);
      }
    };
  }, [isHintVisible, hintIndex]);

  function showNextHint() {
    if (hints.length === 0) {
      return;
    }

    setHintIndex((currentIndex) => Math.min(currentIndex + 1, hints.length - 1));
    setIsHintVisible(true);
  }

  const currentHint = hintIndex >= 0 ? hints[hintIndex] : 'Need a clue? Click me for one small nudge.';

  return (
    <div className="owl-companion" aria-label="Owl companion">
      {isHintVisible ? (
        <div className="owl-companion__bubble" role="status">
          <span className="section-kicker">Owl Hint</span>
          <p>{currentHint}</p>
        </div>
      ) : null}
      <button className="owl-companion__button" type="button" onClick={showNextHint} disabled={hints.length === 0}>
        <img
          src={isHintVisible ? COMPANION_PORTRAIT_ASSET : COMPANION_IDLE_ASSET}
          alt="Owl companion"
          onError={hideMissingAsset}
        />
        <span>Hint</span>
      </button>
    </div>
  );
}
