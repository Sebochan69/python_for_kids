import type { GameSpellData } from '../battle/types';

type SpellCardProps = {
  spell: GameSpellData;
  isSelected: boolean;
  isLocked?: boolean;
  onSelect: (spellId: string) => void;
};

function describeEffect(spell: GameSpellData) {
  const effect = spell.baseEffect;
  const amount = effect.fixedValue ?? effect.amount ?? 0;

  if (effect.effectKind === 'boss_damage') {
    return `${amount} boss damage`;
  }

  if (effect.effectKind === 'shield') {
    return `${amount} block`;
  }

  if (effect.effectKind === 'manaGain') {
    return `gain ${amount} mana`;
  }

  return `${amount} ${effect.effectKind}`;
}

export function SpellCard({ spell, isSelected, isLocked = false, onSelect }: SpellCardProps) {
  return (
    <button
      className={`spell-card ${isSelected ? 'is-selected' : ''} ${isLocked ? 'is-locked' : ''}`}
      type="button"
      onClick={() => onSelect(spell.id)}
      disabled={isLocked}
      aria-pressed={isSelected}
    >
      <span className="spell-card__cursor" aria-hidden="true">
        {isSelected ? '>' : ''}
      </span>
      <span className="spell-card__name">{isLocked ? '????' : spell.name}</span>
      <span className="spell-card__effect">{isLocked ? 'Locked' : describeEffect(spell)}</span>
      <span className="spell-card__description">{isLocked ? 'Later spell' : spell.description}</span>
    </button>
  );
}
