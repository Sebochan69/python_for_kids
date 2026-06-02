export type RunStatus = 'ok' | 'error' | 'timeout';

export type KidRuntimeEvent = {
  id: string;
  type:
    | 'execution_started'
    | 'line_executed'
    | 'variable_remembered'
    | 'variable_changed'
    | 'printed_output'
    | 'error'
    | 'execution_finished';
  step: number;
  line_number: number | null;
  message: string;
  payload: Record<string, unknown>;
};

export type RunError = {
  type: string;
  message: string;
  line_number: number | null;
};

export type RunCodeResponse = {
  status: RunStatus;
  events: KidRuntimeEvent[];
  stdout: string;
  stderr: string;
  errors: RunError[];
  timed_out: boolean;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  difficulty: 'starter' | 'easy';
  topic: string;
  age_range: string;
  mission_prompt: string;
  starter_code: string;
  expected_stdout: string;
  required_concepts: string[];
  learning_goals: string[];
  hints: string[];
  adult_guidance?: string;
};

export type MissionValidationStatus = 'not_run' | 'complete' | 'almost' | 'try_again';

export type MissionValidationResult = {
  status: MissionValidationStatus;
  title: string;
  message: string;
  expectedOutput: string;
  actualOutput: string;
  concepts: {
    required: string[];
    found: string[];
    missing: string[];
  };
};
