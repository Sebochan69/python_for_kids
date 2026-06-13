import type {
  BattleEnemyData,
  BattleEncounterData,
  BattleEvent,
  BattleFeedback,
  BattleInitOptions,
  BattleState,
  EnemyIntent,
  SpellEffectConfig,
  SubmitAnswerOptions,
  SubmitAnswerResult,
  SupportedSpellEffectType,
} from './types';
import { validateAnswer } from './validateAnswer';

const DEFAULT_PLAYER_MAX_HP = 10;
const DEFAULT_PLAYER_MAX_MANA = 5;
const DEFAULT_ENEMY_ATTACK = 1;
const DEFAULT_WRONG_ANSWER_DAMAGE_MULTIPLIER = 2;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function safeWholeNumber(value: number | undefined, fallback = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(value));
}

function safeMultiplier(value: number | undefined, fallback = 1) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
}

function getEnemyData(encounter: BattleEncounterData): BattleEnemyData {
  const enemy = encounter.enemy ?? encounter.boss;

  if (!enemy) {
    throw new Error(`Battle encounter "${encounter.id}" is missing enemy data.`);
  }

  return enemy;
}

function getEnemyIntent(enemy: BattleEnemyData, override?: EnemyIntent): EnemyIntent {
  if (override) {
    return {
      ...override,
      amount: safeWholeNumber(override.amount),
    };
  }

  if (enemy.intent) {
    return {
      ...enemy.intent,
      amount: safeWholeNumber(enemy.intent.amount),
    };
  }

  return {
    type: 'attack',
    amount: safeWholeNumber(enemy.attack, DEFAULT_ENEMY_ATTACK),
    text: `${enemy.name} prepares a small attack.`,
  };
}

function appendEvents(state: BattleState, events: BattleEvent[]) {
  return {
    ...state,
    history: [...state.history, ...events],
  };
}

function getEffectAmount(effect: SpellEffectConfig) {
  const rawAmount = safeWholeNumber(effect.fixedValue ?? effect.amount);
  const cap = getConfiguredEffectCap(effect);

  if (cap === null) {
    return rawAmount;
  }

  return clamp(rawAmount, 0, cap);
}

function getConfiguredEffectCap(effect: SpellEffectConfig) {
  const cap = effect.maxAmount ?? effect.cap;

  if (typeof cap !== 'number' || !Number.isFinite(cap)) {
    return null;
  }

  return safeWholeNumber(cap);
}

function normalizeEffectKind(effectKind: SpellEffectConfig['effectKind']): SupportedSpellEffectType | null {
  if (effectKind === 'boss_damage') {
    return 'damage';
  }

  if (effectKind === 'shield') {
    return 'block';
  }

  if (effectKind === 'unlock') {
    return null;
  }

  return effectKind;
}

function resolveBattleOutcome(state: BattleState) {
  if (state.enemy.hp <= 0) {
    return appendEvents(
      {
        ...state,
        phase: 'victory',
        outcome: 'victory',
        feedback: {
          kind: 'correct',
          message: state.victoryText,
        },
      },
      [
        {
          type: 'victory',
          message: state.victoryText,
        },
      ],
    );
  }

  if (state.player.hp <= 0) {
    return appendEvents(
      {
        ...state,
        phase: 'defeat',
        outcome: 'defeat',
        feedback: {
          kind: 'wrong',
          message: 'Your wizard needs a rest. Try the battle again.',
        },
      },
      [
        {
          type: 'defeat',
          message: 'Player HP reached 0.',
        },
      ],
    );
  }

  return state;
}

export function initializeBattle(
  encounter: BattleEncounterData,
  options: BattleInitOptions = {},
): BattleState {
  const enemyData = getEnemyData(encounter);
  const playerMaxHp = safeWholeNumber(options.playerMaxHp, DEFAULT_PLAYER_MAX_HP) || DEFAULT_PLAYER_MAX_HP;
  const playerMaxMana = safeWholeNumber(options.playerMaxMana, DEFAULT_PLAYER_MAX_MANA) || DEFAULT_PLAYER_MAX_MANA;
  const enemyMaxHp = safeWholeNumber(enemyData.maxHp, safeWholeNumber(enemyData.hp, 1)) || 1;
  const selectedSpellId = options.selectedSpellId ?? encounter.challenge.spellEffect.spellId ?? null;

  return {
    encounterId: encounter.id,
    title: encounter.title,
    setupText: encounter.setupText,
    victoryText: encounter.victoryText,
    phase: 'player_turn',
    outcome: 'in_progress',
    currentTurn: 1,
    selectedSpellId,
    challenge: encounter.challenge,
    player: {
      id: 'player',
      name: options.playerName ?? 'Python Wizard',
      hp: clamp(safeWholeNumber(options.playerHp, playerMaxHp), 0, playerMaxHp),
      maxHp: playerMaxHp,
      mana: clamp(safeWholeNumber(options.playerMana, playerMaxMana), 0, playerMaxMana),
      maxMana: playerMaxMana,
      block: 0,
    },
    enemy: {
      id: enemyData.id,
      name: enemyData.name,
      hp: clamp(safeWholeNumber(enemyData.hp, enemyMaxHp), 0, enemyMaxHp),
      maxHp: enemyMaxHp,
      description: enemyData.description,
    },
    enemyIntent: getEnemyIntent(enemyData, options.enemyIntent),
    feedback: null,
    lastValidation: null,
    history: [
      {
        type: 'battle_started',
        message: encounter.setupText,
      },
    ],
  };
}

export function selectSpell(state: BattleState, spellId: string): BattleState {
  return appendEvents(
    {
      ...state,
      selectedSpellId: spellId,
      feedback: {
        kind: 'info',
        message: `Selected spell: ${spellId}.`,
      },
    },
    [
      {
        type: 'spell_selected',
        spellId,
        message: `Selected spell: ${spellId}.`,
      },
    ],
  );
}

export function applySpellEffect(state: BattleState, effect: SpellEffectConfig): BattleState {
  if (state.outcome !== 'in_progress') {
    return state;
  }

  const effectKind = normalizeEffectKind(effect.effectKind);

  if (!effectKind) {
    return {
      ...state,
      phase: 'feedback',
      feedback: {
        kind: 'correct',
        message: effect.successText ?? 'Correct code worked.',
      },
    };
  }

  const amount = getEffectAmount(effect);
  let nextState: BattleState = {
    ...state,
    phase: 'feedback',
    feedback: {
      kind: 'correct',
      message: effect.successText ?? 'Correct code casts the spell.',
    },
  };

  if (effectKind === 'damage') {
    nextState = {
      ...nextState,
      enemy: {
        ...nextState.enemy,
        hp: clamp(nextState.enemy.hp - amount, 0, nextState.enemy.maxHp),
      },
    };
  }

  if (effectKind === 'heal') {
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        hp: clamp(nextState.player.hp + amount, 0, nextState.player.maxHp),
      },
    };
  }

  if (effectKind === 'block') {
    const maxBlock = getConfiguredEffectCap(effect) ?? nextState.player.maxHp;

    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        block: clamp(nextState.player.block + amount, 0, maxBlock),
      },
    };
  }

  if (effectKind === 'manaGain') {
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        mana: clamp(nextState.player.mana + amount, 0, nextState.player.maxMana),
      },
    };
  }

  nextState = appendEvents(nextState, [
    {
      type: 'spell_effect_applied',
      effectKind,
      amount,
      message: effect.successText ?? `${effectKind} applied for ${amount}.`,
    },
  ]);

  return resolveBattleOutcome(nextState);
}

export function applyEnemyTurn(state: BattleState, intentOverride?: EnemyIntent): BattleState {
  if (state.outcome !== 'in_progress') {
    return state;
  }

  const attackIntent = intentOverride ?? state.enemyIntent;
  const rawDamage = safeWholeNumber(attackIntent.amount);
  const blockedDamage = Math.min(safeWholeNumber(state.player.block), rawDamage);
  const finalDamage = Math.max(0, rawDamage - blockedDamage);
  const nextHp = clamp(state.player.hp - finalDamage, 0, state.player.maxHp);
  const attackMessage = `${state.enemy.name} attacks for ${finalDamage} damage.`;
  const feedbackMessage = state.feedback
    ? `${state.feedback.message} ${attackMessage}`
    : attackMessage;

  const nextState = appendEvents(
    {
      ...state,
      phase: nextHp <= 0 ? 'defeat' : 'player_turn',
      currentTurn: state.currentTurn + 1,
      player: {
        ...state.player,
        hp: nextHp,
        mana: clamp(state.player.mana, 0, state.player.maxMana),
        block: 0,
      },
      feedback: {
        kind: state.feedback?.kind ?? (finalDamage > 0 ? 'wrong' : 'info'),
        message: feedbackMessage,
        hint: state.feedback?.hint,
      },
    },
    [
      {
        type: 'enemy_attack',
        rawDamage,
        blockedDamage,
        finalDamage,
        message: attackMessage,
      },
    ],
  );

  return resolveBattleOutcome(nextState);
}

function getWrongAnswerEnemyIntent(state: BattleState, damageMultiplier: number): EnemyIntent {
  const baseDamage = safeWholeNumber(state.enemyIntent.amount);
  const boostedDamage = safeWholeNumber(baseDamage * damageMultiplier);

  return {
    ...state.enemyIntent,
    amount: boostedDamage,
    text: `${state.enemy.name} uses the missed chant opening.`,
  };
}

function wrongAnswerFeedback(state: BattleState): BattleFeedback {
  return {
    kind: 'wrong',
    message: 'That answer did not cast the spell yet. The enemy hits harder after a missed chant.',
    hint: state.challenge.hints[0],
  };
}

export function submitAnswer(
  state: BattleState,
  answer: string,
  options: SubmitAnswerOptions = {},
): SubmitAnswerResult {
  const historyStart = state.history.length;
  const validation = validateAnswer(answer, state.challenge.acceptedAnswers, {
    caseSensitive: options.caseSensitive ?? false,
  });

  let nextState = appendEvents(
    {
      ...state,
      phase: 'feedback',
      lastValidation: validation,
      feedback: validation.isCorrect
        ? {
            kind: 'correct',
            message: 'Correct. The spell is ready.',
          }
        : wrongAnswerFeedback(state),
    },
    [
      {
        type: 'answer_checked',
        isCorrect: validation.isCorrect,
        message: validation.isCorrect ? 'Accepted answer matched.' : 'Accepted answer did not match.',
      },
    ],
  );

  if (validation.isCorrect) {
    nextState = applySpellEffect(nextState, state.challenge.spellEffect);
  }

  const enemyActsAfterPlayer = validation.isCorrect
    ? options.enemyActsOnCorrectAnswer ?? options.enemyActsAfterPlayer ?? true
    : options.enemyActsOnWrongAnswer ?? options.enemyActsAfterPlayer ?? true;

  if (nextState.outcome === 'in_progress' && enemyActsAfterPlayer) {
    const wrongAnswerDamageMultiplier = safeMultiplier(
      options.wrongAnswerDamageMultiplier,
      DEFAULT_WRONG_ANSWER_DAMAGE_MULTIPLIER,
    );
    const enemyIntent = validation.isCorrect
      ? nextState.enemyIntent
      : getWrongAnswerEnemyIntent(nextState, wrongAnswerDamageMultiplier);

    nextState = applyEnemyTurn(
      {
        ...nextState,
        phase: 'enemy_turn',
      },
      enemyIntent,
    );
  }

  return {
    state: nextState,
    validation,
    events: nextState.history.slice(historyStart),
  };
}
