type HintBoxProps = {
  hint?: string;
};

export function HintBox({ hint }: HintBoxProps) {
  return (
    <div className="hint-box" aria-label="Learning helpers">
      <button className="utility-button" type="button" disabled>
        Hint coming soon
      </button>
      <button className="utility-button" type="button" disabled>
        Spellbook coming soon
      </button>
      {hint ? <p>{hint}</p> : <p>Hints and spellbook pages will open here in a later ticket.</p>}
    </div>
  );
}
