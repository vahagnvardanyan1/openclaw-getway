import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '../types/chat';
import type { AgentId } from '../types/agent';

interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeAgent: AgentId | null;
  isStreaming: boolean;
  streamingContent: string;

  addMessage: (message: ChatMessage) => void;
  updateStreamingContent: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setActiveAgent: (agent: AgentId | null) => void;
  setActiveSession: (sessionId: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  sessions: [],
  activeSessionId: null,
  activeAgent: null,
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

  setActiveAgent: (agent) =>
    set({ activeAgent: agent }),

  setActiveSession: (sessionId) =>
    set({ activeSessionId: sessionId }),

  setSessions: (sessions) =>
    set({ sessions }),

  setMessages: (messages) =>
    set({ messages }),

  clearMessages: () =>
    set({ messages: [], streamingContent: '', isStreaming: false }),
}));
