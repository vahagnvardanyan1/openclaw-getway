import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { insertTask, insertTaskEvent } from '../db/client.js';
import type { CreateTaskInput, ToolContext } from '../types.js';

export function createTaskHandler(db: Database.Database) {
  return async (params: Record<string, unknown>, context: ToolContext) => {
    const input = params as unknown as CreateTaskInput;

    if (!input.title) {
      return { error: 'title is required' };
    }

    const taskId = randomUUID();
    const now = new Date().toISOString();

    const task = insertTask(db, {
      id: taskId,
      title: input.title,
      description: input.description || '',
      status: 'pending',
      priority: input.priority || 'medium',
      assignee: input.assignee || null,
      created_by: context.agentId,
      created_at: now,
      completed_at: null,
      completion_summary: null,
    });

    insertTaskEvent(db, {
      id: randomUUID(),
      task_id: taskId,
      event_type: 'created',
      agent_id: context.agentId,
      data: JSON.stringify({ title: input.title, priority: input.priority }),
      created_at: now,
    });

    return { success: true, task };
  };
}
