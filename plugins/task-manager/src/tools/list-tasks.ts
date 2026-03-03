import type Database from 'better-sqlite3';
import { listTasks } from '../db/client.js';
import type { ListTasksInput, ToolContext } from '../types.js';

export function listTasksHandler(db: Database.Database) {
  return async (params: Record<string, unknown>, _context: ToolContext) => {
    const input = params as unknown as ListTasksInput;

    const tasks = listTasks(db, {
      status: input.status,
      assignee: input.assignee,
      priority: input.priority,
    });

    return { success: true, tasks, count: tasks.length };
  };
}
