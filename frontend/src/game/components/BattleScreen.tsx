import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import {
  applyEnemyTurn,
  initializeBattle,
  submitAnswer,
} from '../battle/battleEngine';
import type {
  AnswerValidationResult,
  BattleChallengeData,
  BattleEncounterData,
  BattleState,
  EnemyIntent,
  GameChapterData,
} from '../battle/types';
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
const FLOATING_SPELLBOOK_ASSET = '/assets/ui/spellbook/spellbook_open.png';
const GLOW_ATTACK_ASSET = '/assets/effects/glow_attack/glow_attack.png';
const GLOW_EXPLOSION_ASSET = '/assets/effects/glow_attack/glow_explosion.png';
const SKELETON_SOLDIER_ASSETS = {
  idle: '/assets/enemies/skeleton_soldier/skeleten_idle.png',
  hurt: '/assets/enemies/skeleton_soldier/skeleton_hurt.png',
  attack: '/assets/enemies/skeleton_soldier/skeleton_attack.png',
  defeated: '/assets/enemies/skeleton_soldier/skeleton_defeated.png',
  victory: '/assets/enemies/skeleton_soldier/skeleton_victory.png',
};
const CAST_POSE_DURATION_MS = 900;
const PROJECTILE_FLIGHT_DURATION_MS = 760;
const PROJECTILE_IMPACT_DURATION_MS = 260;
const ENEMY_COUNTER_DELAY_MS = 780;
const ENEMY_ATTACK_WINDUP_MS = 520;
const ENEMY_HURT_FLASH_DURATION_MS = 420;
const HURT_POSE_DURATION_MS = 1400;
const DEFAULT_POSE_DURATION_MS = 1100;
const WRONG_ANSWER_DAMAGE_MULTIPLIER = 2;

type WizardPose = 'idle' | 'cast' | 'hurt' | 'victory';
type EnemyPose = 'idle' | 'hurt' | 'attack' | 'defeated' | 'victory';
type EnemyAnimation = Extract<EnemyPose, 'idle' | 'hurt' | 'attack'>;
type EnemyAssetSet = Record<EnemyPose, string> & {
  className: string;
};
type SpellProjectileState = {
  id: number;
  phase: 'flying' | 'impact';
} | null;

const ENEMY_ASSETS: Record<'slime' | 'skeletonSoldier', EnemyAssetSet> = {
  slime: {
    className: 'enemy-sprite--slime',
    idle: SLIME_IDLE_ASSET,
    hurt: SLIME_IDLE_ASSET,
    attack: SLIME_IDLE_ASSET,
    defeated: SLIME_IDLE_ASSET,
    victory: SLIME_IDLE_ASSET,
  },
  skeletonSoldier: {
    className: 'enemy-sprite--skeleton-soldier',
    ...SKELETON_SOLDIER_ASSETS,
  },
};

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

function getEnemyTurnIntent(state: BattleState, hadCorrectAnswer: boolean): EnemyIntent {
  if (hadCorrectAnswer) {
    return state.enemyIntent;
  }

  return {
    ...state.enemyIntent,
    amount: Math.max(0, Math.trunc(state.enemyIntent.amount * WRONG_ANSWER_DAMAGE_MULTIPLIER)),
    text: `${state.enemy.name} uses the missed chant opening.`,
  };
}

function normalizeEnemyAssetKey(value: string) {
  return value.toLowerCase().replace(/[\s_]+/g, '-');
}

function getEnemyAssetSet(enemy: BattleState['enemy']) {
  const assetKey = normalizeEnemyAssetKey(`${enemy.id} ${enemy.name}`);

  if (assetKey.includes('skeleton')) {
    return ENEMY_ASSETS.skeletonSoldier;
  }

  return ENEMY_ASSETS.slime;
}

function getEnemyPose(state: BattleState, enemyAnimation: EnemyAnimation): EnemyPose {
  if (state.outcome === 'victory') {
    return 'defeated';
  }

  if (state.outcome === 'defeat') {
    return 'victory';
  }

  return enemyAnimation;
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
  const [isResolvingTurn, setIsResolvingTurn] = useState(false);
  const [wizardPose, setWizardPose] = useState<WizardPose>('idle');
  const [enemyAnimation, setEnemyAnimation] = useState<EnemyAnimation>('idle');
  const [spellProjectile, setSpellProjectile] = useState<SpellProjectileState>(null);
  const animationTimer = useRef<number | null>(null);
  const enemyTurnTimer = useRef<number | null>(null);
  const projectileFlightTimer = useRef<number | null>(null);
  const projectileImpactTimer = useRef<number | null>(null);

  const selectedSpell = chapter.spells.find((spell) => spell.id === (battleState.selectedSpellId ?? battleState.challenge.spellEffect.spellId));
  const requiredSpellId = battleState.challenge.spellEffect.spellId;
  const battleEnded = battleState.outcome !== 'in_progress';
  const spellAmount = battleState.challenge.spellEffect.fixedValue ?? battleState.challenge.spellEffect.amount ?? 0;
  const enemyAssetSet = getEnemyAssetSet(battleState.enemy);
  const enemyPose = getEnemyPose(battleState, enemyAnimation);

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        window.clearTimeout(animationTimer.current);
      }

      if (enemyTurnTimer.current) {
        window.clearTimeout(enemyTurnTimer.current);
      }

      if (projectileFlightTimer.current) {
        window.clearTimeout(projectileFlightTimer.current);
      }

      if (projectileImpactTimer.current) {
        window.clearTimeout(projectileImpactTimer.current);
      }
    };
  }, []);

  function resetAnimationSoon(
    nextWizardPose: WizardPose = 'idle',
    delayMs = DEFAULT_POSE_DURATION_MS,
    afterReset?: () => void,
  ) {
    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    animationTimer.current = window.setTimeout(() => {
      setWizardPose(nextWizardPose);
      setEnemyAnimation('idle');
      afterReset?.();
    }, delayMs);
  }

  function clearTurnTimers() {
    if (animationTimer.current) {
      window.clearTimeout(animationTimer.current);
    }

    if (enemyTurnTimer.current) {
      window.clearTimeout(enemyTurnTimer.current);
    }

    if (projectileFlightTimer.current) {
      window.clearTimeout(projectileFlightTimer.current);
    }

    if (projectileImpactTimer.current) {
      window.clearTimeout(projectileImpactTimer.current);
    }

    setSpellProjectile(null);
  }

  function scheduleEnemyTurn(playerResolvedState: BattleState, hadCorrectAnswer: boolean, delayMs: number) {
    if (enemyTurnTimer.current) {
      window.clearTimeout(enemyTurnTimer.current);
    }

    enemyTurnTimer.current = window.setTimeout(() => {
      setEnemyAnimation('attack');

      enemyTurnTimer.current = window.setTimeout(() => {
        const enemyResolvedState = applyEnemyTurn(
          {
            ...playerResolvedState,
            phase: 'enemy_turn',
          },
          getEnemyTurnIntent(playerResolvedState, hadCorrectAnswer),
        );
        const playerTookDamage = enemyResolvedState.player.hp < playerResolvedState.player.hp;

        setBattleState(enemyResolvedState);
        setEnemyAnimation('idle');

        if (playerTookDamage) {
          setWizardPose('hurt');
          resetAnimationSoon('idle', HURT_POSE_DURATION_MS, () => setIsResolvingTurn(false));
          return;
        }

        setWizardPose('idle');
        setIsResolvingTurn(false);
      }, ENEMY_ATTACK_WINDUP_MS);
    }, delayMs);
  }

  function commitCorrectSpellResolution(resultState: BattleState, enemyWasHit: boolean) {
    setSpellProjectile((currentProjectile) => (
      currentProjectile
        ? { ...currentProjectile, phase: 'impact' }
        : null
    ));
    setBattleState(resultState);
    setEnemyAnimation(enemyWasHit ? 'hurt' : 'idle');

    projectileImpactTimer.current = window.setTimeout(() => {
      setSpellProjectile(null);
    }, PROJECTILE_IMPACT_DURATION_MS);

    if (resultState.outcome === 'victory') {
      onBattleComplete?.(encounter.id);
      setWizardPose('victory');
      resetAnimationSoon('victory', DEFAULT_POSE_DURATION_MS, () => setIsResolvingTurn(false));
      return;
    }

    setWizardPose('idle');

    if (enemyWasHit) {
      resetAnimationSoon('idle', ENEMY_HURT_FLASH_DURATION_MS);
    }

    scheduleEnemyTurn(resultState, true, ENEMY_COUNTER_DELAY_MS);
  }

  function previewAcceptedChant(validation: AnswerValidationResult) {
    setBattleState((currentState) => ({
      ...currentState,
      phase: 'feedback',
      feedback: {
        kind: 'correct',
        message: 'Correct. The fire spell launches!',
      },
      lastValidation: validation,
    }));
  }

  function handleCast() {
    if (isResolvingTurn || battleEnded) {
      return;
    }

    clearTurnTimers();
    setIsResolvingTurn(true);

    const result = submitAnswer(battleState, answer, {
      enemyActsAfterPlayer: false,
    });
    const hadCorrectAnswer = result.validation.isCorrect;
    const enemyWasHit = result.events.some((event) => event.type === 'spell_effect_applied' && event.effectKind === 'damage');

    if (hadCorrectAnswer) {
      setAnswer('');
      setWizardPose('cast');
      setEnemyAnimation('idle');
      previewAcceptedChant(result.validation);

      if (enemyWasHit) {
        setSpellProjectile({ id: Date.now(), phase: 'flying' });
        projectileFlightTimer.current = window.setTimeout(() => {
          commitCorrectSpellResolution(result.state, enemyWasHit);
        }, PROJECTILE_FLIGHT_DURATION_MS);
        return;
      }

      projectileFlightTimer.current = window.setTimeout(() => {
        commitCorrectSpellResolution(result.state, enemyWasHit);
      }, CAST_POSE_DURATION_MS);
      return;
    }

    setBattleState(result.state);
    setEnemyAnimation('idle');
    scheduleEnemyTurn(result.state, hadCorrectAnswer, DEFAULT_POSE_DURATION_MS);
  }

  function handleRestart() {
    clearTurnTimers();
    setBattleState(initializeBattle(encounter));
    setAnswer('');
    setIsResolvingTurn(false);
    setWizardPose('idle');
    setEnemyAnimation('idle');
    setSpellProjectile(null);
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
              disabled={battleEnded || isResolvingTurn}
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
              <img className="floating-spellbook__image" src={FLOATING_SPELLBOOK_ASSET} alt="" onError={hideMissingAsset} />
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

        {spellProjectile ? (
          <div key={spellProjectile.id} className={`spell-projectile spell-projectile--${spellProjectile.phase}`} aria-hidden="true">
            <img
              className="spell-projectile__image"
              src={spellProjectile.phase === 'impact' ? GLOW_EXPLOSION_ASSET : GLOW_ATTACK_ASSET}
              alt=""
              onError={hideMissingAsset}
            />
          </div>
        ) : null}

        <div className="fighter-area fighter-area--enemy">
          <div className="character-hud character-hud--enemy">
            <strong>{battleState.enemy.name}</strong>
            <MiniBar label="HP" value={battleState.enemy.hp} maxValue={battleState.enemy.maxHp} />
            <small>Intent: {battleState.enemyIntent.text ?? `Attack for ${battleState.enemyIntent.amount}`}</small>
          </div>
          <div className={`sprite-shell enemy-sprite ${enemyAssetSet.className} enemy-sprite--${enemyPose}`}>
            <img src={enemyAssetSet[enemyPose]} alt={battleState.enemy.name} onError={hideMissingAsset} />
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
