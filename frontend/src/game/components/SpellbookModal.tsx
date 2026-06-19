import HTMLFlipBook from 'react-pageflip';
import { useEffect } from 'react';
import type { GameChapterData, GameSpellData, GameSpellbookPage } from '../battle/types';

type SpellbookModalProps = {
  chapter: GameChapterData;
  selectedSpell?: GameSpellData;
  isOpen: boolean;
  onClose: () => void;
};

function CodeExample({ page, pageNumber }: { page: GameSpellbookPage; pageNumber: number }) {
  return (
    <article className="spellbook-page">
      <span className="spellbook-page__number">Page {pageNumber}</span>
      <h3>{page.title}</h3>
      <p>{page.body}</p>
      <pre>
        <code>{page.codeExample}</code>
      </pre>
      <strong>{page.remember}</strong>
    </article>
  );
}

export function SpellbookModal({ chapter, isOpen, onClose }: SpellbookModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop modal-backdrop--book-only" role="presentation" onPointerDown={onClose}>
      <section
        className="spellbook-modal spellbook-modal--book-only"
        role="dialog"
        aria-modal="true"
        aria-label={`${chapter.topic ?? 'Variables'} spellbook`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="spellbook-modal__book" aria-label="Spellbook pages">
          <HTMLFlipBook
            key={`${chapter.id}-spellbook`}
            className="spellbook-flip"
            style={{}}
            startPage={0}
            size="stretch"
            width={360}
            height={430}
            minWidth={260}
            maxWidth={390}
            minHeight={340}
            maxHeight={500}
            drawShadow
            flippingTime={820}
            usePortrait
            startZIndex={1}
            autoSize
            maxShadowOpacity={0.34}
            showCover={false}
            mobileScrollSupport
            clickEventForward={false}
            useMouseEvents
            swipeDistance={24}
            showPageCorners
            disableFlipByClick={false}
            renderOnlyPageLengthChange
          >
            {chapter.spellbookPages.map((page, index) => (
              <div className="spellbook-flip-page" key={page.id}>
                <CodeExample page={page} pageNumber={index + 1} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </section>
    </div>
  );
}
