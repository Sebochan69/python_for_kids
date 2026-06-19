import { useEffect, useState, type SyntheticEvent } from 'react';

type CompanionHintProps = {
  challengeId: string;
  spellId: string | null;
  hints: string[];
};

const COMPANION_WINGS_DOWN_ASSET = '/assets/companions/owl/companion_wings_down.png';
const COMPANION_WINGS_UP_ASSET = '/assets/companions/owl/companion_wings_up.png';

function hideMissingAsset(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0';
}

export function CompanionHint({ challengeId, spellId, hints }: CompanionHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);

  useEffect(() => {
    setIsOpen(false);
    setHintIndex(-1);
  }, [challengeId, spellId]);

  function showNextHint() {
    setIsOpen(true);
    setHintIndex((currentIndex) => Math.min(currentIndex + 1, hints.length - 1));
  }

  const currentHint = hintIndex >= 0 ? hints[hintIndex] : undefined;
  const hasMoreHints = hintIndex < hints.length - 1;

  return (
    <div className={`companion-hint ${isOpen ? 'is-open' : ''}`} aria-label="Companion hints">
      <div className="companion-hint__portrait">
        <img src={isOpen ? COMPANION_WINGS_UP_ASSET : COMPANION_WINGS_DOWN_ASSET} alt="Owl companion" onError={hideMissingAsset} />
      </div>
      <div className="companion-hint__body">
        <span className="section-kicker">Owl Guide</span>
        <p>
          {currentHint
            ? currentHint
            : 'I can give one small clue at a time. Try the spell first, then ask me if you want a nudge.'}
        </p>
        <button className="utility-button" type="button" onClick={showNextHint} disabled={hints.length === 0}>
          {currentHint ? (hasMoreHints ? 'Next Hint' : 'Last Hint') : 'Ask for Hint'}
        </button>
      </div>
    </div>
  );
}
