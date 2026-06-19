import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';

type OwlCompanionProps = {
  challengeId: string;
  spellId: string | null;
  hints: string[];
};

const COMPANION_WINGS_DOWN_ASSET = '/assets/companions/owl/companion_wings_down.png';
const COMPANION_WINGS_UP_ASSET = '/assets/companions/owl/companion_wings_up.png';
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
  const hintBubble = isHintVisible ? (
    <div className="owl-companion__bubble" role="status">
      <span className="section-kicker">Owl Hint</span>
      <p>{currentHint}</p>
    </div>
  ) : null;

  return (
    <>
      <div className="owl-companion" aria-label="Owl companion">
        <button
          className={`owl-companion__button ${isHintVisible ? 'is-speaking' : ''}`}
          type="button"
          onClick={showNextHint}
          disabled={hints.length === 0}
          aria-label="Ask the owl companion for a hint"
        >
          <span className="owl-companion__sprite" aria-hidden="true">
            <img
              className="owl-companion__sprite-frame owl-companion__sprite-frame--down"
              src={COMPANION_WINGS_DOWN_ASSET}
              alt=""
              onError={hideMissingAsset}
            />
            <img
              className="owl-companion__sprite-frame owl-companion__sprite-frame--up"
              src={COMPANION_WINGS_UP_ASSET}
              alt=""
              onError={hideMissingAsset}
            />
          </span>
        </button>
      </div>
      {hintBubble ? createPortal(hintBubble, document.body) : null}
    </>
  );
}
