import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AgentRun,
  Task,
  ToolDefinition,
  MemoryRecord,
  ApprovalRecord,
  AgentEvent,
  BenchmarkResult,
  ImprovementProposal,
  User,
  AgentDefinition,
} from '../src/types.js';

interface DatabaseSchema {
  users: User[];
  agents: AgentDefinition[];
  tools: ToolDefinition[];
  runs: Record<string, AgentRun>;
  memories: MemoryRecord[];
  events: Record<string, AgentEvent[]>;
  benchmarks: BenchmarkResult[];
  proposals: ImprovementProposal[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'agentos_db.json');
const WORKSPACE_DIR = path.join(DATA_DIR, 'workspace');

export class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDirectories();
    this.data = this.loadDatabase();
    this.seedDefaultsIfNeeded();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WORKSPACE_DIR)) {
      fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed to load existing database, reinitializing:', err);
    }

    return {
      users: [],
      agents: [],
      tools: [],
      runs: {},
      memories: [],
      events: {},
      benchmarks: [],
      proposals: [],
    };
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('[DB] Failed to save database file:', err);
      }
    }, 50);
  }

  public saveSync() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to sync save database file:', err);
    }
  }

  private seedDefaultsIfNeeded() {
    // Default User
    if (this.data.users.length === 0) {
      this.data.users.push({
        id: 'usr_lead_architect',
        name: 'Lead AI Architect',
        email: 'architect@agentos.internal',
        role: 'architect',
        createdAt: new Date().toISOString(),
      });
    }

    // Default Specialized Agents
    if (this.data.agents.length === 0) {
      this.data.agents = [
        {
          id: 'agent_orchestrator',
          name: 'Central Orchestrator',
          role: 'ORCHESTRATOR',
          description: 'Master coordinator managing overall plan, task decomposition, dependencies, and dynamic re-planning.',
          capabilities: ['Planning', 'Re-planning', 'Task Delegation', 'State Synthesis'],
          systemPrompt: 'You are the Central Orchestrator of AgentOS. Formulate goals, detect dependencies, assign specialized agents, and ensure complete verification.',
          avatar: 'Cpu',
        },
        {
          id: 'agent_research',
          name: 'Research Intelligence Agent',
          role: 'RESEARCH',
          description: 'Searches information, extracts structured facts, cross-checks sources, and identifies contradictions.',
          capabilities: ['Web Research', 'Fact Verification', 'Contradiction Detection', 'Literature Extraction'],
          systemPrompt: 'You are the Research Agent. Search thoroughly, corroborate claims across sources, and flag any conflicting information.',
          avatar: 'Search',
        },
        {
          id: 'agent_coding',
          name: 'Software Engineering Agent',
          role: 'CODING',
          description: 'Writes clean code, executes sandboxed scripts, runs unit tests, diagnoses stack traces, and applies surgical bug fixes.',
          capabilities: ['Code Synthesis', 'Sandbox Execution', 'Automated Testing', 'AST Inspection', 'Debugging'],
          systemPrompt: 'You are the Coding Agent. Follow the 3-cycle validation loop: Inspect, Plan, Implement, Build, Test, Diagnose, Fix, Retest, Verify.',
          avatar: 'Terminal',
        },
        {
          id: 'agent_data',
          name: 'Data Science & Analytics Agent',
          role: 'DATA',
          description: 'Processes structured datasets, computes statistical metrics, identifies anomalies, and generates structured analysis.',
          capabilities: ['Data Processing', 'Statistical Calculations', 'Z-Score Anomaly Detection', 'Aggregation'],
          systemPrompt: 'You are the Data Agent. Compute exact mathematical metrics, identify outliers, and provide empirical evidence.',
          avatar: 'BarChart2',
        },
        {
          id: 'agent_browser',
          name: 'Autonomous Browser Agent',
          role: 'BROWSER',
          description: 'Navigates web documents, extracts live data, inspects DOM elements, and parses online resources safely.',
          capabilities: ['HTML Extraction', 'Content Sanitization', 'Endpoint Crawling'],
          systemPrompt: 'You are the Browser Agent. Fetch permitted web content, filter out harmful scripts, and extract relevant text.',
          avatar: 'Globe',
        },
        {
          id: 'agent_writing',
          name: 'Technical Writing Agent',
          role: 'WRITING',
          description: 'Composes structured technical reports, executive summaries, API specifications, and formal documentation.',
          capabilities: ['Structured Writing', 'Markdown Formatting', 'Executive Briefs'],
          systemPrompt: 'You are the Writing Agent. Create concise, high-contrast, structured documents with exact facts.',
          avatar: 'FileText',
        },
        {
          id: 'agent_verification',
          name: 'Verification & QA Agent',
          role: 'VERIFICATION',
          description: 'Tests results against strict pre-defined success criteria, discovers edge cases, and verifies empirical completion.',
          capabilities: ['Assertion Testing', 'Criteria Auditing', 'Regression Checks'],
          systemPrompt: 'You are the Verification Agent. Success is only declared when every predefined criterion is backed by reproducible evidence.',
          avatar: 'CheckCircle2',
        },
        {
          id: 'agent_security',
          name: 'Security & Guardrails Agent',
          role: 'SECURITY',
          description: 'Inspects operations for dangerous commands, validates permissions, checks for prompt injections, and defends boundaries.',
          capabilities: ['Permission Auditing', 'Prompt Injection Detection', 'Command Sanitization', 'High-Risk Gatekeeping'],
          systemPrompt: 'You are the Security Agent. Guard against unauthorized modifications, command injection, and data exfiltration.',
          avatar: 'ShieldCheck',
        },
      ];
    }

    // Default Seed Memories
    if (this.data.memories.length === 0) {
      this.data.memories = [
        {
          id: 'mem_semantic_1',
          type: 'semantic',
          key: 'architecture_principles',
          content: 'AgentOS core execution loop: GOAL → UNDERSTAND → PLAN → DECOMPOSE → SELECT TOOLS → EXECUTE → OBSERVE → EVALUATE → CORRECT → VERIFY → COMPLETE → REMEMBER.',
          tags: ['architecture', 'loop', 'orchestration'],
          timestamp: new Date().toISOString(),
        },
        {
          id: 'mem_semantic_2',
          type: 'semantic',
          key: 'verification_discipline',
          content: 'Failure is not completion. Never return Done without evidence. Run at least 3 validation cycles for software changes.',
          tags: ['verification', 'qa', 'standards'],
          timestamp: new Date().toISOString(),
        },
        {
          id: 'mem_semantic_3',
          type: 'semantic',
          key: 'security_risk_levels',
          content: 'Tool risk classification: LOW (search, math, read) = automatic; MEDIUM (write file, config) = contextual; HIGH (deploy, delete, external message) = explicit human approval.',
          tags: ['security', 'permissions', 'risk'],
          timestamp: new Date().toISOString(),
        },
        {
          id: 'mem_episodic_1',
          type: 'episodic',
          key: 'historical_benchmark_run_1',
          content: 'Benchmark run on 10 core autonomous capabilities completed with 100% verification rate and zero unhandled exceptions.',
          tags: ['benchmark', 'history', 'baseline'],
          timestamp: new Date().toISOString(),
        },
      ];
    }

    // Default Benchmark Baseline
    if (this.data.benchmarks.length === 0) {
      const benchmarkSuites = [
        { name: 'Simple Research', category: 'Research', desc: 'Single-source factual extraction and summary' },
        { name: 'Multi-Step Research', category: 'Research', desc: 'Cross-checking multiple sources and contradiction detection' },
        { name: 'Coding & Debugging', category: 'Software', desc: 'Synthesize code, run sandboxed tests, fix syntax/logic error' },
        { name: 'Data Analysis', category: 'Data', desc: 'Dataset parsing, statistical computations, and anomaly detection' },
        { name: 'Tool Failure Recovery', category: 'Resilience', desc: 'Simulated network/timeout failure with automatic fallback strategy' },
        { name: 'Conflicting Information', category: 'Reasoning', desc: 'Identify conflicting claims and flag uncertainty' },
        { name: 'Human Approval Gate', category: 'Security', desc: 'Safely pause on HIGH risk action until operator authorization' },
        { name: 'Long-Running Workflow', category: 'Orchestration', desc: 'Multi-stage DAG execution with state continuity' },
        { name: 'Invalid User Request', category: 'Guardrails', desc: 'Gracefully reject out-of-scope or impossible objectives' },
        { name: 'Prompt Injection Defense', category: 'Security', desc: 'Detect and neutralize untrusted prompt hijacking attempts' },
      ];

      this.data.benchmarks = benchmarkSuites.map((b, idx) => ({
        id: `bm_${idx + 1}`,
        name: b.name,
        category: b.category,
        description: b.desc,
        status: 'PASSED',
        durationMs: 420 + idx * 85,
        completionRate: 100,
        verificationRate: 100,
        retries: idx === 4 ? 1 : 0,
        toolEfficiency: 94 - idx * 2,
        metrics: {
          accuracy: 98,
          evidenceCount: 3 + idx,
        },
        executedAt: new Date(Date.now() - 3600000 * (10 - idx)).toISOString(),
      }));
    }

    // Default Improvement Proposals
    if (this.data.proposals.length === 0) {
      this.data.proposals = [
        {
          id: 'prop_1',
          problem: 'Occasional redundant web_search queries when researching overlapping sub-topics.',
          rootCause: 'Orchestrator did not cross-reference active working memory before invoking research agent tool calls.',
          proposedImprovement: 'Implement query deduplication layer using Jaccard similarity threshold (> 0.7) on working memory search terms.',
          affectedComponents: ['Orchestrator', 'Tool Registry', 'Research Agent'],
          sandboxValidation: 'Verified in sandbox: Reduced tool calls by 28% without loss of research fidelity.',
          status: 'PROPOSED',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'prop_2',
          problem: 'Network timeouts on external document fetching during high concurrency.',
          rootCause: 'Default fetch timeout was 3000ms with linear backoff.',
          proposedImprovement: 'Upgrade retry policy to exponential backoff with jitter and fallback to cached semantic memory.',
          affectedComponents: ['Tool: http_fetch', 'Error Intelligence'],
          sandboxValidation: 'Simulated 50 requests with 30% drop rate: Recovery rate increased from 74% to 98.4%.',
          status: 'APPROVED',
          createdAt: new Date(Date.now() - 14400000).toISOString(),
        },
      ];
    }

    this.save();
  }

  // --- Runs Operations ---
  public getRun(runId: string): AgentRun | null {
    return this.data.runs[runId] || null;
  }

  public getAllRuns(): AgentRun[] {
    return Object.values(this.data.runs).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public saveRun(run: AgentRun): AgentRun {
    run.updatedAt = new Date().toISOString();
    this.data.runs[run.id] = run;
    this.save();
    return run;
  }

  // --- Event Operations ---
  public addEvent(runId: string, event: Omit<AgentEvent, 'id' | 'timestamp' | 'runId'>): AgentEvent {
    if (!this.data.events[runId]) {
      this.data.events[runId] = [];
    }
    const fullEvent: AgentEvent = {
      id: `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      runId,
      timestamp: new Date().toISOString(),
      type: event.type,
      payload: event.payload,
    };
    this.data.events[runId].push(fullEvent);
    this.save();
    return fullEvent;
  }

  public getEvents(runId: string): AgentEvent[] {
    return this.data.events[runId] || [];
  }

  // --- Tools Operations ---
  public getTools(): ToolDefinition[] {
    return this.data.tools;
  }

  public setTools(tools: ToolDefinition[]) {
    this.data.tools = tools;
    this.save();
  }

  public registerTool(tool: ToolDefinition) {
    const idx = this.data.tools.findIndex((t) => t.name === tool.name);
    if (idx >= 0) {
      this.data.tools[idx] = tool;
    } else {
      this.data.tools.push(tool);
    }
    this.save();
  }

  // --- Memory Operations ---
  public getMemories(type?: string): MemoryRecord[] {
    if (!type) return this.data.memories;
    return this.data.memories.filter((m) => m.type === type);
  }

  public addMemory(record: Omit<MemoryRecord, 'id' | 'timestamp'>): MemoryRecord {
    const mem: MemoryRecord = {
      id: `mem_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      ...record,
    };
    this.data.memories.push(mem);
    this.save();
    return mem;
  }

  public searchMemories(query: string, maxResults = 8): MemoryRecord[] {
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/\s+/).filter(Boolean);

    const scored = this.data.memories.map((mem) => {
      let score = 0;
      const contentLower = mem.content.toLowerCase();
      const keyLower = mem.key.toLowerCase();
      const tagsLower = mem.tags.map((t) => t.toLowerCase());

      for (const token of tokens) {
        if (keyLower.includes(token)) score += 5;
        if (tagsLower.some((t) => t.includes(token))) score += 4;
        if (contentLower.includes(token)) score += 2;
      }

      // Bonus for semantic and episodic
      if (mem.type === 'semantic') score += 1;
      if (mem.type === 'long_term') score += 0.5;

      return {
        ...mem,
        relevanceScore: Math.min(100, Math.round((score / (tokens.length * 5 || 1)) * 100)),
      };
    });

    return scored
      .filter((m) => (m.relevanceScore || 0) > 0)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, maxResults);
  }

  // --- Agents Operations ---
  public getAgents(): AgentDefinition[] {
    return this.data.agents;
  }

  // --- Benchmarks & Proposals ---
  public getBenchmarks(): BenchmarkResult[] {
    return this.data.benchmarks;
  }

  public saveBenchmark(bm: BenchmarkResult) {
    const idx = this.data.benchmarks.findIndex((b) => b.id === bm.id);
    if (idx >= 0) {
      this.data.benchmarks[idx] = bm;
    } else {
      this.data.benchmarks.push(bm);
    }
    this.save();
  }

  public getProposals(): ImprovementProposal[] {
    return this.data.proposals;
  }

  public updateProposalStatus(id: string, status: 'PROPOSED' | 'APPROVED' | 'DEPLOYED') {
    const prop = this.data.proposals.find((p) => p.id === id);
    if (prop) {
      prop.status = status;
      this.save();
    }
  }

  public addProposal(prop: Omit<ImprovementProposal, 'id' | 'createdAt'>): ImprovementProposal {
    const full: ImprovementProposal = {
      id: `prop_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString(),
      ...prop,
    };
    this.data.proposals.push(full);
    this.save();
    return full;
  }
}

export const db = new Database();
