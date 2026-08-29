export interface AlgorithmRequest {
  session: {
    groupCount: number;
    maxGroupSize: number;
    idealTeamSize?: number;
    minTeamSize?: number;
  };
  participants: {
    id: string;
    willingToCoach: boolean;
    childId?: string;
  }[];
  affinities: {
    fromId: string;
    toId: string;
    weight: number;
  }[];
}

export interface AlgorithmGroupResult {
  id: string;
  memberIds: string[];
  headCoachId: string | null;
}

export interface AlgorithmMeta {
  satisfactionScore: number;
  coachCoverage: number;
}

export interface AlgorithmSuccessResponse {
  status: 'ok';
  groups: AlgorithmGroupResult[];
  meta: AlgorithmMeta;
}

export interface AlgorithmWarningResponse {
  status: 'coach_coverage_warning';
  availableCoaches: number;
  requiredCoaches: number;
  groups: AlgorithmGroupResult[];
  meta: AlgorithmMeta;
}

export interface AlgorithmErrorResponse {
  status: 'error';
  code: 'invalid_input' | 'infeasible';
  message: string;
}

export type AlgorithmResponse =
  | AlgorithmSuccessResponse
  | AlgorithmWarningResponse
  | AlgorithmErrorResponse;
