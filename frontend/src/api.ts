import type { RunCodeResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8001';

export async function runCode(code: string): Promise<RunCodeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      file_name: 'main.py',
    }),
  });

  if (!response.ok) {
    throw new Error('Python did not answer. Try again in a moment.');
  }

  return response.json() as Promise<RunCodeResponse>;
}
