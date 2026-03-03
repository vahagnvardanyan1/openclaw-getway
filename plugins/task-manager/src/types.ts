export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completion_summary: string | null;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  event_type: string;
  agent_id: string;
  data: string;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee?: string;
}

export interface UpdateTaskInput {
  task_id: string;
  status?: TaskStatus;
  description?: string;
  assignee?: string;
  priority?: TaskPriority;
}

export interface ListTasksInput {
  status?: TaskStatus;
  assignee?: string;
  priority?: TaskPriority;
}

export interface CompleteTaskInput {
  task_id: string;
  summary?: string;
}

export interface PluginContext {
  registerTool(name: string, handler: ToolHandler): void;
  getConfig(): Record<string, string>;
  log(level: 'info' | 'warn' | 'error', message: string): void;
}

export type ToolHandler = (params: Record<string, unknown>, context: ToolContext) => Promise<unknown>;

export interface ToolContext {
  agentId: string;
  sessionId: string;
}
