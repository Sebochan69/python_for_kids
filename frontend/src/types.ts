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
