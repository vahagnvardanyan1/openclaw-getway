import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { updateTask, getTaskById, insertTaskEvent } from '../db/client.js';
import type { CompleteTaskInput, ToolContext } from '../types.js';

export function completeTaskHandler(db: Database.Database) {
  return async (params: Record<string, unknown>, context: ToolContext) => {
    const input = params as unknown as CompleteTaskInput;

    if (!input.task_id) {
      return { error: 'task_id is required' };
    }

    const existing = getTaskById(db, input.task_id);
    if (!existing) {
      return { error: `Task ${input.task_id} not found` };
    }

    if (existing.status === 'completed') {
      return { error: `Task ${input.task_id} is already completed` };
    }

    const now = new Date().toISOString();
    const task = updateTask(db, input.task_id, {
      status: 'completed',
      completed_at: now,
      completion_summary: input.summary || null,
    });

    insertTaskEvent(db, {
      id: randomUUID(),
      task_id: input.task_id,
      event_type: 'completed',
      agent_id: context.agentId,
      data: JSON.stringify({ summary: input.summary }),
      created_at: now,
    });

    return { success: true, task };
  };
}
