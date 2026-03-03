import type { AgentId } from './agent';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId?: AgentId;
  agentName?: string;
  timestamp: string;
  streaming?: boolean;
}

export interface ChatSession {
  id: string;
  createdAt: string;
  lastMessage?: string;
}
