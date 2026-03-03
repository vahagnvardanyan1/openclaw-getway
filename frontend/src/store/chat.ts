import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '../types/chat';
import type { AgentId, AgentInfo } from '../types/agent';

const DEFAULT_AGENTS: Record<AgentId, AgentInfo> = {
  pm: { id: 'pm', name: 'Product Manager', status: 'idle' },
  fe: { id: 'fe', name: 'Frontend Engineer', status: 'idle' },
  qa: { id: 'qa', name: 'QA Engineer', status: 'idle' },
};

interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  agents: Record<AgentId, AgentInfo>;
  isStreaming: boolean;
  streamingContent: string;

  addMessage: (message: ChatMessage) => void;
  updateStreamingContent: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  updateAgentStatus: (agentId: AgentId, status: AgentInfo['status']) => void;
  setActiveSession: (sessionId: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  sessions: [],
  activeSessionId: null,
  agents: { ...DEFAULT_AGENTS },
  isStreaming: false,
  streamingContent: '',

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateStreamingContent: (content) =>
    set((state) => ({ streamingContent: state.streamingContent + content })),

  setStreaming: (streaming) =>
    set({
      isStreaming: streaming,
      ...(streaming ? {} : { streamingContent: '' }),
    }),

  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: { ...state.agents[agentId], status },
      },
    })),

  setActiveSession: (sessionId) =>
    set({ activeSessionId: sessionId }),

  setSessions: (sessions) =>
    set({ sessions }),

  setMessages: (messages) =>
    set({ messages }),

  clearMessages: () =>
    set({ messages: [], streamingContent: '', isStreaming: false }),
}));
