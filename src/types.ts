export type AgentRole =
  | 'ORCHESTRATOR'
  | 'RESEARCH'
  | 'CODING'
  | 'DATA'
  | 'BROWSER'
  | 'WRITING'
  | 'VERIFICATION'
  | 'SECURITY';

export type TaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'SKIPPED'
  | 'WAITING_APPROVAL';

export type RunStatus =
  | 'PLANNING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'PAUSED'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'PARTIALLY_COMPLETED'
  | 'BLOCKED'
  | 'FAILED';

export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskLevel = ToolRiskLevel;

export type ErrorClassification =
  | 'Syntax'
  | 'Runtime'
  | 'Network'
  | 'Authentication'
  | 'Permission'
  | 'Database'
  | 'API'
  | 'Validation'
  | 'Dependency'
  | 'Logic'
  | 'Performance'
  | 'Security'
  | 'Unknown';

export type MemoryType =
  | 'short_term'
  | 'working'
  | 'long_term'
  | 'episodic'
  | 'semantic';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'architect' | 'operator';
  createdAt: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  avatar: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  version: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  permissions: string[];
  timeout: number;
  retry_policy: {
    max_retries: number;
    backoff_factor: number;
  };
  risk_level: ToolRiskLevel;
}

export interface Task {
  id: string;
  runId: string;
  title: string;
  description: string;
  assignedAgent: AgentRole;
  requiredTools: string[];
  dependencies: string[];
  status: TaskStatus;
  order: number;
  canParallel: boolean;
  requiresApproval: boolean;
  retryCount: number;
  maxRetries: number;
  startTime?: string;
  endTime?: string;
  output?: any;
  error?: string;
  diagnostics?: string;
}

export interface VerificationCriterion {
  id: string;
  criterion: string;
  expectedResult: string;
  actualResult?: string;
  passed?: boolean;
  evidence?: string;
}

export interface ToolCallRecord {
  id: string;
  runId: string;
  taskId: string;
  agentRole: AgentRole;
  toolName: string;
  input: Record<string, any>;
  output?: any;
  error?: string;
  durationMs: number;
  riskLevel: ToolRiskLevel;
  approved?: boolean;
  timestamp: string;
}

export interface ObservationRecord {
  id: string;
  runId: string;
  taskId: string;
  content: string;
  data?: any;
  timestamp: string;
}

export interface ErrorRecord {
  id: string;
  runId: string;
  taskId?: string;
  classification: ErrorClassification;
  message: string;
  stack?: string;
  recoveryStrategy: string;
  retryAttempt: number;
  maxRetries: number;
  resolved: boolean;
  resolutionDetails?: string;
  timestamp: string;
}

export interface ApprovalRecord {
  id: string;
  runId: string;
  taskId: string;
  toolName: string;
  actionDetails: string;
  riskLevel: ToolRiskLevel;
  parameters: Record<string, any>;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedBy?: string;
  decidedAt?: string;
  timestamp: string;
}

export interface ReflectionRecord {
  id: string;
  runId: string;
  taskId?: string;
  supposedToHappen: string;
  actuallyHappened: string;
  succeeded: boolean;
  evidence: string;
  nextAction: string;
  conciseSummary: string;
  timestamp: string;
}

export interface MemoryRecord {
  id: string;
  type: MemoryType;
  runId?: string;
  key: string;
  content: string;
  tags: string[];
  relevanceScore?: number;
  timestamp: string;
}

export interface AgentRunBudget {
  maxTimeSeconds: number;
  maxIterations: number;
  maxToolCalls: number;
  maxModelCalls: number;
  maxTokenUsage: number;
}

export interface AgentRun {
  id: string;
  goal: string;
  context?: string;
  status: RunStatus;
  plan: {
    objective: string;
    missingInfoIdentified: string[];
    strategy: string;
    successCriteria: VerificationCriterion[];
  };
  tasks: Task[];
  activeTaskId?: string;
  activeAgent: AgentRole;
  toolCalls: ToolCallRecord[];
  observations: ObservationRecord[];
  errors: ErrorRecord[];
  reflections: ReflectionRecord[];
  approvals: ApprovalRecord[];
  verifications: VerificationCriterion[];
  memoriesRetrieved: MemoryRecord[];
  budget: AgentRunBudget;
  metrics: {
    iterations: number;
    toolCallCount: number;
    modelCallCount: number;
    tokensUsed: number;
    elapsedTimeSeconds: number;
    retriesCount: number;
  };
  finalResult?: {
    status: 'COMPLETED' | 'VERIFIED' | 'PARTIALLY_COMPLETED' | 'BLOCKED' | 'FAILED';
    summary: string;
    artifacts: Array<{ name: string; type: string; content: string }>;
    evidence: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentEvent {
  id: string;
  runId: string;
  type:
    | 'AGENT_STARTED'
    | 'PLAN_CREATED'
    | 'TASK_STARTED'
    | 'TOOL_CALLED'
    | 'TOOL_COMPLETED'
    | 'TASK_COMPLETED'
    | 'TASK_FAILED'
    | 'RETRY_STARTED'
    | 'PLAN_CHANGED'
    | 'APPROVAL_REQUIRED'
    | 'APPROVAL_GRANTED'
    | 'APPROVAL_REJECTED'
    | 'VERIFICATION_STARTED'
    | 'VERIFICATION_COMPLETED'
    | 'AGENT_COMPLETED'
    | 'AGENT_PAUSED'
    | 'AGENT_RESUMED'
    | 'AGENT_STOPPED'
    | 'AGENT_FAILED';
  payload: any;
  timestamp: string;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'SKIPPED';
  durationMs: number;
  completionRate: number;
  verificationRate: number;
  retries: number;
  toolEfficiency: number;
  metrics: Record<string, any>;
  runId?: string;
  executedAt: string;
}

export interface ImprovementProposal {
  id: string;
  problem: string;
  rootCause: string;
  proposedImprovement: string;
  affectedComponents: string[];
  sandboxValidation: string;
  status: 'PROPOSED' | 'APPROVED' | 'DEPLOYED';
  createdAt: string;
}
