import type {
  AlgorithmRequest,
  AlgorithmResponse,
  AlgorithmSuccessResponse,
  AlgorithmWarningResponse,
} from './algorithmTypes';
import { runFallback } from './fallback';

export interface AlgorithmClientResult {
  response: AlgorithmSuccessResponse | AlgorithmWarningResponse;
  usedFallback: boolean;
}

export async function callAlgorithm(request: AlgorithmRequest): Promise<AlgorithmClientResult> {
  try {
    const res = await fetch('/api/togather/algorithm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Algorithm service returned ${res.status}`);
    }

    const data: AlgorithmResponse = await res.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    return { response: data, usedFallback: false };
  } catch {
    const response = runFallback(request);
    return { response, usedFallback: true };
  }
}
