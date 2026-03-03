import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { getDb } from './db/client.js';
import { createTaskHandler } from './tools/create-task.js';
import { updateTaskHandler } from './tools/update-task.js';
import { listTasksHandler } from './tools/list-tasks.js';
import { completeTaskHandler } from './tools/complete-task.js';
import type { PluginContext } from './types.js';

export default function register(ctx: PluginContext): void {
  const config = ctx.getConfig();
  const dbPath = config.TASK_DB_PATH || resolve(process.cwd(), 'data', 'tasks.sqlite');

  // Ensure data directory exists
  const dataDir = resolve(dbPath, '..');
  mkdirSync(dataDir, { recursive: true });

  const db = getDb(dbPath);

  ctx.log('info', `Task manager plugin initialized with DB at ${dbPath}`);

  ctx.registerTool('create-task', createTaskHandler(db));
  ctx.registerTool('update-task', updateTaskHandler(db));
  ctx.registerTool('list-tasks', listTasksHandler(db));
  ctx.registerTool('complete-task', completeTaskHandler(db));
}
