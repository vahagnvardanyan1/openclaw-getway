import Database from 'better-sqlite3';
import { initializeSchema } from './schema.js';
import type { Task, TaskEvent } from '../types.js';

let db: Database.Database | null = null;

export function getDb(dbPath: string): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

export function insertTask(db: Database.Database, task: Omit<Task, 'updated_at'>): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, assignee, created_by, created_at, completed_at, completion_summary)
    VALUES (@id, @title, @description, @status, @priority, @assignee, @created_by, @created_at, @completed_at, @completion_summary)
  `);
  stmt.run(task);
  return getTaskById(db, task.id)!;
}

export function updateTask(db: Database.Database, id: string, updates: Partial<Task>): Task | null {
  const fields: string[] = [];
  const values: Record<string, unknown> = { id };

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && value !== undefined) {
      fields.push(`${key} = @${key}`);
      values[key] = value;
    }
  }

  if (fields.length === 0) return getTaskById(db, id);

  fields.push("updated_at = datetime('now')");

  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = @id`);
  stmt.run(values);
  return getTaskById(db, id);
}

export function getTaskById(db: Database.Database, id: string): Task | null {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return (stmt.get(id) as Task) ?? null;
}

export function listTasks(
  db: Database.Database,
  filters: { status?: string; assignee?: string; priority?: string }
): Task[] {
  const conditions: string[] = [];
  const values: Record<string, string> = {};

  if (filters.status) {
    conditions.push('status = @status');
    values.status = filters.status;
  }
  if (filters.assignee) {
    conditions.push('assignee = @assignee');
    values.assignee = filters.assignee;
  }
  if (filters.priority) {
    conditions.push('priority = @priority');
    values.priority = filters.priority;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`);
  return stmt.all(values) as Task[];
}

export function insertTaskEvent(db: Database.Database, event: TaskEvent): void {
  const stmt = db.prepare(`
    INSERT INTO task_events (id, task_id, event_type, agent_id, data, created_at)
    VALUES (@id, @task_id, @event_type, @agent_id, @data, @created_at)
  `);
  stmt.run(event);
}
