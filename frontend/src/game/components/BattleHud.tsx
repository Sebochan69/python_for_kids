import type { BattleEnemyState, BattlePlayerState, EnemyIntent } from '../battle/types';

type BattleHudProps = {
  player: BattlePlayerState;
  enemy: BattleEnemyState;
  enemyIntent: EnemyIntent;
};

function StatBar({ label, value, maxValue }: { label: string; value: number; maxValue: number }) {
  const percent = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

  return (
    <div className="stat-bar" aria-label={`${label}: ${value} of ${maxValue}`}>
      <div className="stat-bar__label">
        <span>{label}</span>
        <span>
          {value}/{maxValue}
        </span>
      </div>
      <div className="stat-bar__track">
        <span className="stat-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function BattleHud({ player, enemy, enemyIntent }: BattleHudProps) {
  return (
    <section className="battle-hud" aria-label="Battle stats">
      <div className="battle-hud__panel">
        <h2>{player.name}</h2>
        <StatBar label="HP" value={player.hp} maxValue={player.maxHp} />
        <StatBar label="Mana" value={player.mana} maxValue={player.maxMana} />
        <p className="battle-hud__note">Block: {player.block}</p>
      </div>
      <div className="battle-hud__panel battle-hud__panel--enemy">
        <h2>{enemy.name}</h2>
        <StatBar label="HP" value={enemy.hp} maxValue={enemy.maxHp} />
        <p className="battle-hud__note">
          Intent: {enemyIntent.text ?? `Attack for ${enemyIntent.amount}`} ({enemyIntent.amount})
        </p>
      </div>
    </section>
  );
}
