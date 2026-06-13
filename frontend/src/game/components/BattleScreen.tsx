import { useMemo, useRef, useState, type SyntheticEvent } from 'react';
import {
  initializeBattle,
  submitAnswer,
} from '../battle/battleEngine';
import type { BattleChallengeData, BattleEncounterData, GameChapterData } from '../battle/types';
import { getChapterOneEncounter, loadChapterOne } from '../data/loadGameContent';
import { OwlCompanion } from './OwlCompanion';
import { SpellbookModal } from './SpellbookModal';
import { WizardChantBubble } from './WizardChantBubble';
import './BattleScreen.css';

const WIZARD_ASSETS = {
  idle: '/assets/characters/wizard/wizard_idle.png',
  cast: '/assets/characters/wizard/wizard_cast.png',
  hurt: '/assets/characters/wizard/wizard_hurt.png',
  victory: '/assets/characters/wizard/wizard_victory.png',
};

const WIZARD_PORTRAIT_ASSET = '/assets/characters/wizard/wizard_portrait.png';
const SLIME_IDLE_ASSET = '/assets/enemies/slime/slime_idle.png';

function hideMissingAsset(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0';
}

function MiniBar({ label, value, maxValue }: { label: string; value: number; maxValue: number }) {
  const percent = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

  return (
    <div className={`mini-bar mini-bar--${label.toLowerCase()}`} aria-label={`${label}: ${value} of ${maxValue}`}>
      <div className="mini-bar__label">
        <span>{label}</span>
        <span>
          {value}/{maxValue}
        </span>
      </div>
      <div className="mini-bar__track">
        <span className="mini-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function PlayerStatusOverlay({
  hp,
  maxHp,
  mana,
  maxMana,
}: {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
}) {
  const hpPercent = maxHp > 0 ? Math.round((hp / maxHp) * 100) : 0;
  const manaPercent = maxMana > 0 ? Math.round((mana / maxMana) * 100) : 0;

  return (
    <aside className="player-status-overlay" aria-label="Wizard status">
      <div className="player-status-portrait">
        <img src={WIZARD_PORTRAIT_ASSET} alt="Wizard portrait" onError={hideMissingAsset} />
      </div>
      <div className="player-status-name">
        <span className="section-kicker">Player</span>
        <strong>Python Wizard</strong>
      </div>
      <div className="ornate-stat-bar ornate-stat-bar--hp" aria-label={`HP: ${hp} of ${maxHp}`}>
        <span className="ornate-stat-bar__icon" aria-hidden="true">HP</span>
        <div className="ornate-stat-bar__body">
          <span className="ornate-stat-bar__label">
            <strong>HP</strong>
            <span>{hp}/{maxHp}</span>
          </span>
          <span className="ornate-stat-bar__track">
            <span className="ornate-stat-bar__fill" style={{ width: `${hpPercent}%` }} />
          </span>
        </div>
      </div>
      <div className="ornate-stat-bar ornate-stat-bar--mana" aria-label={`Mana: ${mana} of ${maxMana}`}>
        <span className="ornate-stat-bar__icon" aria-hidden="true">MP</span>
        <div className="ornate-stat-bar__body">
          <span className="ornate-stat-bar__label">
            <strong>Mana</strong>
            <span>{mana}/{maxMana}</span>
          </span>
          <span className="ornate-stat-bar__track">
            <span className="ornate-stat-bar__fill" style={{ width: `${manaPercent}%` }} />
          </span>
        </div>
      </div>
    </aside>
  );
}

function renderCodePreview(challenge: BattleChallengeData) {
  const blankToken = challenge.blankToken ?? '___';
  const [beforeBlank, afterBlank] = challenge.starterCode.split(blankToken);

  if (challenge.challengeType !== 'fill_blank' || afterBlank === undefined) {
    return <code>{challenge.starterCode}</code>;
  }

  return (
    <code>
      {beforeBlank}
      <span className="code-blank">{blankToken}</span>
      {afterBlank}
    </code>
  );
}

type BattleScreenProps = {
  chapter?: GameChapterData;
  encounter?: BattleEncounterData;
  onBattleComplete?: (encounterId: string) => void;
  onReturnToMap?: () => void;
};

export function BattleScreen({
  chapter: providedChapter,
  encounter: providedEncounter,
  onBattleComplete,
  onReturnToMap,
}: BattleScreenProps) {
  const chapter = providedChapter ?? loadChapterOne();
  const encounter = useMemo(() => providedEncounter ?? getChapterOneEncounter(0), [providedEncounter]);
  const [battleState, setBattleState] = useState(() => initializeBattle(encounter));
  const [answer, setAnswer] = useState('');
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const [wizardPose, setWizardPose] = useState<'idle' | 'cast' | 'hurt' | 'victory'>('idle');
  const [enemyAnimation, setEnemyAnimation] = useState<'idle' | 'hurt'>('idle');
  const animationTimer = useRef<number | null>(null);

  const selectedSpell = chapter.spells.find((spell) => spell.id === (battleState.selectedSpellId ?? battleState.challenge.spellEffect.spellId));
  const requiredSpellId = battleState.challenge.spellEffect.spellId;
  const battleEnded = battleState.outcome !== 'in_progress';
  const spellAmount = battleState.challenge.spellEffect.fixedValue ?? battleState.challenge.spellEffect.amount ?? 0;

  function resetAnimationSoon(nextWizardPose: typeof wizardPose = 'idle') {
    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    animationTimer.current = window.setTimeout(() => {
      setWizardPose(nextWizardPose);
      setEnemyAnimation('idle');
    }, 700);
  }

  function handleCast() {
    const result = submitAnswer(battleState, answer);
    const hadCorrectAnswer = result.validation.isCorrect;
    const enemyWasHit = result.events.some((event) => event.type === 'spell_effect_applied' && event.effectKind === 'damage');
    const playerWasHit = result.events.some((event) => event.type === 'enemy_attack' && event.finalDamage > 0);

    setBattleState(result.state);

    if (result.state.outcome === 'victory') {
      onBattleComplete?.(encounter.id);
    }

    if (hadCorrectAnswer) {
      setAnswer('');
      setWizardPose(result.state.outcome === 'victory' ? 'victory' : 'cast');
      setEnemyAnimation(enemyWasHit ? 'hurt' : 'idle');
      resetAnimationSoon(result.state.outcome === 'victory' ? 'victory' : 'idle');
      return;
    }

    if (playerWasHit) {
      setWizardPose('hurt');
      resetAnimationSoon('idle');
    }
  }

  function handleRestart() {
    setBattleState(initializeBattle(encounter));
    setAnswer('');
    setWizardPose('idle');
    setEnemyAnimation('idle');
  }

  return (
    <main className="battle-screen">
      <div className="battle-action-strip" aria-label="Battle menu">
        <span className="turn-badge">Turn {battleState.currentTurn}</span>
        <button className="utility-button" type="button" onClick={handleRestart}>
          Restart
        </button>
        {onReturnToMap ? (
          <button className="utility-button" type="button" onClick={onReturnToMap}>
            Map
          </button>
        ) : null}
      </div>

      <section className="battle-stage" aria-label="Battle stage">
        <div className="battle-next-turn" aria-label="Next turn">
          <span className="section-kicker">Next Turn</span>
          <strong>{battleState.enemy.name}</strong>
          <small>{battleState.enemyIntent.text ?? `Attack for ${battleState.enemyIntent.amount}`}</small>
        </div>

        <div className="fighter-area fighter-area--player">
          <div className="wizard-stage-cluster">
            <WizardChantBubble
              challenge={battleState.challenge}
              answer={answer}
              disabled={battleEnded}
              feedbackKind={battleState.feedback?.kind}
              onAnswerChange={setAnswer}
              onCast={handleCast}
            />
            <OwlCompanion
              challengeId={battleState.challenge.id}
              spellId={battleState.selectedSpellId}
              hints={battleState.challenge.hints}
            />
            <button className="floating-spellbook" type="button" onClick={() => setIsSpellbookOpen(true)} aria-label="Open spellbook">
              <span className="floating-spellbook__book" aria-hidden="true">
                <span />
                <span />
              </span>
              Spellbook
            </button>
            <div className={`sprite-shell wizard-sprite wizard-sprite--${wizardPose}`}>
              <img src={WIZARD_ASSETS[wizardPose]} alt="Young Python wizard" onError={hideMissingAsset} />
            </div>
          </div>
        </div>

        <div className="battle-status-card">
          <span className={`battle-outcome battle-outcome--${battleState.outcome}`}>{battleState.outcome}</span>
          <p>{battleState.feedback?.message ?? 'Type the missing code in the chant bubble, then cast.'}</p>
          {battleEnded ? <strong>{battleState.outcome === 'victory' ? encounter.victoryText : 'Try again when ready.'}</strong> : null}
        </div>

        <div className="fighter-area fighter-area--enemy">
          <div className="character-hud character-hud--enemy">
            <strong>{battleState.enemy.name}</strong>
            <MiniBar label="HP" value={battleState.enemy.hp} maxValue={battleState.enemy.maxHp} />
            <small>Intent: {battleState.enemyIntent.text ?? `Attack for ${battleState.enemyIntent.amount}`}</small>
          </div>
          <div className={`sprite-shell enemy-sprite enemy-sprite--${enemyAnimation}`}>
            <img src={SLIME_IDLE_ASSET} alt={battleState.enemy.name} onError={hideMissingAsset} />
          </div>
        </div>

        <aside className="battle-command-overlay" aria-label="Battle commands">
          <div className="command-header">
            <span className="section-kicker">Spell</span>
            <strong>{selectedSpell?.name ?? 'Glow'}</strong>
            <small>{spellAmount} fixed damage</small>
          </div>
          <div className="command-spell-list" aria-label="Available spells">
            {chapter.spells.map((spell) => {
              const isUnlocked = spell.id === requiredSpellId;

              return (
                <div className={`command-spell-row ${isUnlocked ? 'is-active' : 'is-locked'}`} key={spell.id}>
                  <span aria-hidden="true">{isUnlocked ? '>' : ''}</span>
                  <strong>{isUnlocked ? spell.name : '????'}</strong>
                  <small>{isUnlocked ? `${spellAmount} dmg` : 'Locked'}</small>
                </div>
              );
            })}
          </div>
          <pre className="command-code">{renderCodePreview(battleState.challenge)}</pre>
          <p>{battleState.challenge.prompt}</p>
          <div className="command-help-row">
            <span>Type in the wizard bubble.</span>
            <span>Owl gives hints.</span>
          </div>
        </aside>

        <PlayerStatusOverlay
          hp={battleState.player.hp}
          maxHp={battleState.player.maxHp}
          mana={battleState.player.mana}
          maxMana={battleState.player.maxMana}
        />
      </section>

      <SpellbookModal
        chapter={chapter}
        selectedSpell={selectedSpell}
        isOpen={isSpellbookOpen}
        onClose={() => setIsSpellbookOpen(false)}
      />
    </main>
  );
}
