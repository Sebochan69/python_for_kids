import HTMLFlipBook from 'react-pageflip';
import { useEffect, useRef, useState } from 'react';
import type { GameChapterData, GameSpellData, GameSpellbookPage } from '../battle/types';

type SpellbookModalProps = {
  chapter: GameChapterData;
  selectedSpell?: GameSpellData;
  isOpen: boolean;
  onClose: () => void;
};

type PageFlipHandle = {
  pageFlip: () => {
    flipNext: (corner?: 'top' | 'bottom') => void;
    flipPrev: (corner?: 'top' | 'bottom') => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
  };
};

type FlipEvent = {
  data: number | string;
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

export function SpellbookModal({ chapter, selectedSpell, isOpen, onClose }: SpellbookModalProps) {
  const bookRef = useRef<PageFlipHandle | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const pageCount = chapter.spellbookPages.length;
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < pageCount - 1;

  function handleFlip(event: FlipEvent) {
    const nextPage = Number(event.data);
    setCurrentPage(Number.isFinite(nextPage) ? nextPage : 0);
  }

  function flipPrevious() {
    bookRef.current?.pageFlip().flipPrev('bottom');
  }

  function flipNext() {
    bookRef.current?.pageFlip().flipNext('bottom');
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="spellbook-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spellbook-title"
      >
        <div className="spellbook-modal__header">
          <div>
            <span className="section-kicker">Spellbook</span>
            <h2 id="spellbook-title">{chapter.topic ?? 'Variables'}</h2>
          </div>
          <button className="utility-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="spellbook-metaphor">
          <h3>{selectedSpell?.name ?? 'Mana Crystal Notes'}</h3>
          <p>
            {selectedSpell?.metaphor
              ?? 'A variable is like a mana crystal with a label. It remembers one useful bit of magic.'}
          </p>
        </div>

        <div className="spellbook-modal__book" aria-label="Spellbook pages">
          <HTMLFlipBook
            key={`${chapter.id}-spellbook`}
            ref={bookRef}
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
            showPageCorners={false}
            disableFlipByClick={false}
            renderOnlyPageLengthChange
            onFlip={handleFlip}
          >
            {chapter.spellbookPages.map((page, index) => (
              <div className="spellbook-flip-page" key={page.id}>
                <CodeExample page={page} pageNumber={index + 1} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        <div className="spellbook-modal__nav">
          <button className="utility-button" type="button" onClick={flipPrevious} disabled={!canGoBack}>
            Previous Page
          </button>
          <span>
            Page {Math.min(currentPage + 1, pageCount)} of {pageCount}
          </span>
          <button className="utility-button" type="button" onClick={flipNext} disabled={!canGoForward}>
            Next Page
          </button>
        </div>
      </section>
    </div>
  );
}
