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
