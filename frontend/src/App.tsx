import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { wsClient } from './api/ws';
import { useChatStore } from './store/chat';
import { useTaskStore } from './store/tasks';
import { useUiStore } from './store/ui';
import type { AgentId } from './types/agent';
import type { ChatMessage } from './types/chat';
import type { Task } from './types/task';

export function App() {
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const updateStreamingContent = useChatStore((s) => s.updateStreamingContent);
  const updateAgentStatus = useChatStore((s) => s.updateAgentStatus);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const setConnectionStatus = useUiStore((s) => s.setConnectionStatus);
  const setGatewayStatus = useUiStore((s) => s.setGatewayStatus);

  useEffect(() => {
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((event) => {
      // Debug: log all incoming events
      if (event.type !== 'ws.connected' && event.type !== 'ws.disconnected') {
        console.log('[WS Event]', event.type, event.data);
      }

      switch (event.type) {
        case 'ws.connected':
          setConnectionStatus('connected');
          break;
        case 'ws.disconnected':
          setConnectionStatus('disconnected');
          break;
        case 'connection':
          setGatewayStatus(
            (event.data as { gateway?: boolean }).gateway ? 'connected' : 'disconnected'
          );
          break;
        case 'chat.message':
          addMessage(event.data as unknown as ChatMessage);
          setStreaming(false);
          break;
        case 'chat.stream.start': {
          setStreaming(true);
          const startAgentId = (event.data as { agentId?: AgentId }).agentId;
          if (startAgentId) updateAgentStatus(startAgentId, 'responding');
          break;
        }
        case 'chat.stream.chunk':
          updateStreamingContent(
            (event.data as { content?: string }).content ?? ''
          );
          break;
        case 'chat.stream.end': {
          const endAgentId = (event.data as { agentId?: AgentId }).agentId;
          if (endAgentId) {
            updateAgentStatus(endAgentId, 'idle');
          } else {
            // Fallback: reset all
            updateAgentStatus('pm', 'idle');
            updateAgentStatus('fe', 'idle');
            updateAgentStatus('qa', 'idle');
          }
          // Only stop the streaming indicator when PM finishes (PM is the user-facing agent)
          if (!endAgentId || endAgentId === 'pm') {
            setStreaming(false);
          }
          break;
        }
        case 'task.created':
          addTask(event.data as unknown as Task);
          break;
        case 'task.updated':
        case 'task.completed':
          updateTask(event.data as unknown as Task);
          break;
        case 'agent.status': {
          const statusData = event.data as { agentId?: AgentId; status?: string };
          if (statusData.agentId) {
            const mapped: 'idle' | 'thinking' | 'responding' =
              statusData.status === 'thinking' ? 'thinking' :
              statusData.status === 'responding' ? 'responding' : 'idle';
            updateAgentStatus(statusData.agentId, mapped);
          }
          break;
        }
      }
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
    };
  }, [
    addMessage,
    setStreaming,
    updateStreamingContent,
    updateAgentStatus,
    addTask,
    updateTask,
    setConnectionStatus,
    setGatewayStatus,
  ]);

  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
