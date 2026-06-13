import type { GameChapterData, GameSpellData } from '../battle/types';

type SpellbookReferenceScreenProps = {
  chapter: GameChapterData;
  featuredSpell?: GameSpellData;
  onStartBattle: () => void;
};

export function SpellbookReferenceScreen({
  chapter,
  featuredSpell,
  onStartBattle,
}: SpellbookReferenceScreenProps) {
  return (
    <main className="chapter-screen chapter-screen--spellbook">
      <section className="chapter-panel" aria-labelledby="spellbook-reference-title">
        <span className="section-kicker">Spellbook</span>
        <h1 id="spellbook-reference-title">{chapter.topic ?? 'Variables'}</h1>
        <p className="chapter-lede">
          Before the battle, read the spellbook. These notes are your magic map for the code chant.
        </p>

        <div className="spellbook-metaphor">
          <h2>{featuredSpell?.name ?? 'Mana Crystal Notes'}</h2>
          <p>
            {featuredSpell?.metaphor
              ?? 'A variable is like a mana crystal with a label. It remembers one useful bit of magic.'}
          </p>
        </div>

        <div className="spellbook-pages">
          {chapter.spellbookPages.map((page) => (
            <article className="spellbook-page" key={page.id}>
              <h3>{page.title}</h3>
              <p>{page.body}</p>
              <pre>
                <code>{page.codeExample}</code>
              </pre>
              <strong>{page.remember}</strong>
            </article>
          ))}
        </div>

        <div className="chapter-actions">
          <button className="cast-button" type="button" onClick={onStartBattle}>
            Start Battle
          </button>
        </div>
      </section>
    </main>
  );
}
