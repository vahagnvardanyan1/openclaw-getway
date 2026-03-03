import { useChatStore } from '../../store/chat';
import { AgentIndicator } from './AgentIndicator';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function StreamingMessage() {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const activeAgent = useChatStore((s) => {
    const responding = Object.values(s.agents).find((a) => a.status === 'responding');
    if (responding) return responding.id;
    const thinking = Object.values(s.agents).find((a) => a.status === 'thinking');
    if (thinking) return thinking.id;
    return null;
  });

  if (!isStreaming) return null;

  return (
    <div className="message-bubble message-assistant message-streaming">
      <div className="message-header">
        {activeAgent ? (
          <AgentIndicator agentId={activeAgent} />
        ) : (
          <span className="message-sender">Agent</span>
        )}
        <LoadingSpinner size={14} />
      </div>
      <div className="message-content">
        {streamingContent ? (
          <MarkdownRenderer content={streamingContent} />
        ) : (
          <span className="typing-indicator">Thinking...</span>
        )}
      </div>
    </div>
  );
}
