import type {
  TasksResponse,
  TaskDetailResponse,
  HealthResponse,
  SessionResponse,
  SessionsResponse,
  ChatHistoryResponse,
} from './types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health(): Promise<HealthResponse> {
    return request('/health');
  },

  sendMessage(sessionId: string, message: string) {
    return request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message }),
    });
  },

  getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
    return request(`/chat/history?session_id=${encodeURIComponent(sessionId)}`);
  },

  listTasks(filters?: { status?: string; assignee?: string; priority?: string }): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.assignee) params.set('assignee', filters.assignee);
    if (filters?.priority) params.set('priority', filters.priority);
    const query = params.toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },

  getTask(id: string): Promise<TaskDetailResponse> {
    return request(`/tasks/${encodeURIComponent(id)}`);
  },

  createSession(): Promise<SessionResponse> {
    return request('/sessions', { method: 'POST' });
  },

  listSessions(): Promise<SessionsResponse> {
    return request('/sessions');
  },
};
