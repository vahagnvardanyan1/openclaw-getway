import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config.js';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    mkdirSync(dirname(config.taskDbPath), { recursive: true });
    db = new Database(config.taskDbPath);
    db.pragma('journal_mode = WAL');
    // Create tables if they don't exist (plugin may not have run yet)
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        assignee TEXT,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        completion_summary TEXT
      );
      CREATE TABLE IF NOT EXISTS task_events (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id),
        event_type TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        data TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return db;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completion_summary: string | null;
}

export function listAllTasks(filters?: {
  status?: string;
  assignee?: string;
  priority?: string;
}): TaskRow[] {
  const database = getDb();
  const conditions: string[] = [];
  const values: Record<string, string> = {};

  if (filters?.status) {
    conditions.push('status = @status');
    values.status = filters.status;
  }
  if (filters?.assignee) {
    conditions.push('assignee = @assignee');
    values.assignee = filters.assignee;
  }
  if (filters?.priority) {
    conditions.push('priority = @priority');
    values.priority = filters.priority;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const stmt = database.prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`);
    return stmt.all(values) as TaskRow[];
  } catch {
    // Table may not exist yet if plugin hasn't run
    return [];
  }
}

export function getTaskById(id: string): TaskRow | null {
  const database = getDb();
  try {
    const stmt = database.prepare('SELECT * FROM tasks WHERE id = ?');
    return (stmt.get(id) as TaskRow) ?? null;
  } catch {
    return null;
  }
}

export function getTaskEvents(taskId: string) {
  const database = getDb();
  try {
    const stmt = database.prepare(
      'SELECT * FROM task_events WHERE task_id = ? ORDER BY created_at ASC'
    );
    return stmt.all(taskId);
  } catch {
    return [];
  }
}
