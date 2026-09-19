import { MemoryRecord, MemoryType } from '../src/types.js';
import { db } from './db.js';

export class MemoryManager {
  /**
   * Retrieve relevant memories based on goal and keywords
   */
  public getRelevantMemories(goal: string, maxItems = 6): MemoryRecord[] {
    return db.searchMemories(goal, maxItems);
  }

  /**
   * Store working memory item for a run
   */
  public saveWorkingMemory(runId: string, key: string, content: string, tags: string[] = []): MemoryRecord {
    return db.addMemory({
      type: 'working',
      runId,
      key,
      content,
      tags: ['working_memory', ...tags],
    });
  }

  /**
   * Store episodic memory of a completed run with its outcome & lessons learned
   */
  public saveEpisodicMemory(
    runId: string,
    goal: string,
    outcome: string,
    tasksCount: number,
    retriesCount: number,
    lessonsLearned: string
  ): MemoryRecord {
    const summary = `Run ${runId}: Goal "${goal}". Outcome: ${outcome}. Completed ${tasksCount} tasks with ${retriesCount} retries. Lessons: ${lessonsLearned}`;
    return db.addMemory({
      type: 'episodic',
      runId,
      key: `run_episode_${runId}`,
      content: summary,
      tags: ['episodic', 'run_outcome', outcome.toLowerCase()],
    });
  }

  /**
   * Store verified semantic fact
   */
  public saveSemanticFact(key: string, content: string, tags: string[] = []): MemoryRecord {
    return db.addMemory({
      type: 'semantic',
      key,
      content,
      tags: ['semantic', 'verified_fact', ...tags],
    });
  }

  /**
   * Store long-term knowledge
   */
  public saveLongTermMemory(key: string, content: string, tags: string[] = []): MemoryRecord {
    return db.addMemory({
      type: 'long_term',
      key,
      content,
      tags: ['long_term', ...tags],
    });
  }

  /**
   * Query all memories by type
   */
  public getMemoriesByType(type?: MemoryType): MemoryRecord[] {
    return db.getMemories(type);
  }
}

export const memoryManager = new MemoryManager();
