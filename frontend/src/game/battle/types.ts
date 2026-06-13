export type BattlePhase = 'player_turn' | 'feedback' | 'enemy_turn' | 'victory' | 'defeat';

export type BattleOutcome = 'in_progress' | 'victory' | 'defeat';

export type BattleChallengeType = 'fill_blank' | 'guided_typing';

export type BattleAnswerMode = 'blank' | 'full_code';

export type SupportedSpellEffectType = 'damage' | 'heal' | 'block' | 'manaGain';

export type LessonSpellEffectType =
  | SupportedSpellEffectType
  | 'boss_damage'
  | 'shield'
  | 'unlock';

export type SpellEffectTarget = 'enemy' | 'boss' | 'player' | 'scene';

export type BattleFeedbackKind = 'correct' | 'wrong' | 'info';

export type EnemyIntentType = 'attack';

export type AnswerValidationOptions = {
  caseSensitive?: boolean;
};

export type AnswerValidationResult = {
  isCorrect: boolean;
  normalizedAnswer: string;
  normalizedAcceptedAnswers: string[];
  matchedAnswer?: string;
};

export type SpellEffectConfig = {
  spellId: string;
  effectKind: LessonSpellEffectType;
  target: SpellEffectTarget;
  fixedValue?: number;
  amount?: number;
  maxAmount?: number;
  cap?: number;
  animationKey?: string;
  successText?: string;
};

export type GameSpellData = {
  id: string;
  name: string;
  description: string;
  metaphor: string;
  baseEffect: SpellEffectConfig;
};

export type GameTutorialStep = {
  id: string;
  title: string;
  narration: string;
  focusCode?: string;
  callout?: string;
};

export type GameSpellbookPage = {
  id: string;
  title: string;
  body: string;
  codeExample: string;
  remember: string;
};

export type BattleChallengeData = {
  id: string;
  challengeType: BattleChallengeType;
  answerMode: BattleAnswerMode;
  title: string;
  prompt: string;
  starterCode: string;
  blankToken?: string;
  expectedStdout: string;
  acceptedAnswers: string[];
  hints: string[];
  requiredConcepts: string[];
  validationNotes?: string;
  spellEffect: SpellEffectConfig;
};

export type EnemyIntent = {
  type: EnemyIntentType;
  amount: number;
  text?: string;
};

export type BattleEnemyData = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  description?: string;
  intent?: EnemyIntent;
  attack?: number;
};

export type BattleEncounterData = {
  id: string;
  type?: string;
  title: string;
  enemy?: BattleEnemyData;
  boss?: BattleEnemyData;
  setupText: string;
  victoryText: string;
  challenge: BattleChallengeData;
};

export type GameSideQuestData = {
  id: string;
  title: string;
  summary: string;
  giverName: string;
  rewardText: string;
  challenge: BattleChallengeData;
};

export type GameChapterData = {
  id: string;
  title: string;
  gameTitle?: string;
  chapterNumber?: number;
  summary?: string;
  topic?: string;
  learningGoals?: string[];
  concepts?: string[];
  tutorial: GameTutorialStep[];
  spellbookPages: GameSpellbookPage[];
  spells: GameSpellData[];
  battles: BattleEncounterData[];
  sideQuests: GameSideQuestData[];
  bossFight: BattleEncounterData;
};

export type BattleActorState = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
};

export type BattlePlayerState = BattleActorState & {
  mana: number;
  maxMana: number;
  block: number;
};

export type BattleEnemyState = BattleActorState & {
  description?: string;
};

export type BattleFeedback = {
  kind: BattleFeedbackKind;
  message: string;
  hint?: string;
};

export type BattleEvent =
  | {
      type: 'battle_started';
      message: string;
    }
  | {
      type: 'spell_selected';
      spellId: string;
      message: string;
    }
  | {
      type: 'answer_checked';
      isCorrect: boolean;
      message: string;
    }
  | {
      type: 'spell_effect_applied';
      effectKind: SupportedSpellEffectType;
      amount: number;
      message: string;
    }
  | {
      type: 'enemy_attack';
      rawDamage: number;
      blockedDamage: number;
      finalDamage: number;
      message: string;
    }
  | {
      type: 'victory';
      message: string;
    }
  | {
      type: 'defeat';
      message: string;
    };

export type BattleState = {
  encounterId: string;
  title: string;
  setupText: string;
  victoryText: string;
  phase: BattlePhase;
  outcome: BattleOutcome;
  currentTurn: number;
  selectedSpellId: string | null;
  challenge: BattleChallengeData;
  player: BattlePlayerState;
  enemy: BattleEnemyState;
  enemyIntent: EnemyIntent;
  feedback: BattleFeedback | null;
  lastValidation: AnswerValidationResult | null;
  history: BattleEvent[];
};

export type BattleInitOptions = {
  playerName?: string;
  playerHp?: number;
  playerMaxHp?: number;
  playerMana?: number;
  playerMaxMana?: number;
  enemyIntent?: EnemyIntent;
  selectedSpellId?: string | null;
};

export type SubmitAnswerOptions = AnswerValidationOptions & {
  enemyActsAfterPlayer?: boolean;
  enemyActsOnCorrectAnswer?: boolean;
  enemyActsOnWrongAnswer?: boolean;
  wrongAnswerDamageMultiplier?: number;
};

export type SubmitAnswerResult = {
  state: BattleState;
  validation: AnswerValidationResult;
  events: BattleEvent[];
};
