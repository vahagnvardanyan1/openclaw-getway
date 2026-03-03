import type { Task, TaskEvent } from '../types/task';
import type { ChatMessage } from '../types/chat';

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface TasksResponse {
  tasks: Task[];
  count: number;
}

export interface TaskDetailResponse {
  task: Task;
  events: TaskEvent[];
}

export interface ChatHistoryResponse {
  success: boolean;
  history: ChatMessage[];
}

export interface SessionResponse {
  success: boolean;
  session: { id: string; sessionKey?: string; createdAt: string };
}

export interface SessionsResponse {
  success: boolean;
  sessions: Array<{ id: string; createdAt: string }>;
}

export interface HealthResponse {
  status: string;
  gateway: 'connected' | 'disconnected';
  frontendClients: number;
  timestamp: string;
}

export interface WsEvent {
  type: string;
  data: Record<string, unknown>;
}
