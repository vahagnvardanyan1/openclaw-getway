import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { updateTask, getTaskById, insertTaskEvent } from '../db/client.js';
import type { UpdateTaskInput, ToolContext } from '../types.js';

export function updateTaskHandler(db: Database.Database) {
  return async (params: Record<string, unknown>, context: ToolContext) => {
    const input = params as unknown as UpdateTaskInput;

    if (!input.task_id) {
      return { error: 'task_id is required' };
    }

    const existing = getTaskById(db, input.task_id);
    if (!existing) {
      return { error: `Task ${input.task_id} not found` };
    }

    const updates: Record<string, unknown> = {};
    if (input.status) updates.status = input.status;
    if (input.description) updates.description = input.description;
    if (input.assignee) updates.assignee = input.assignee;
    if (input.priority) updates.priority = input.priority;

    const task = updateTask(db, input.task_id, updates);

    insertTaskEvent(db, {
      id: randomUUID(),
      task_id: input.task_id,
      event_type: 'updated',
      agent_id: context.agentId,
      data: JSON.stringify(updates),
      created_at: new Date().toISOString(),
    });

    return { success: true, task };
  };
}
