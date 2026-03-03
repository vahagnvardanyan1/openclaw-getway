import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { AgentIndicator } from './AgentIndicator';
import type { ChatMessage } from '../../types/chat';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-header">
        {isUser ? (
          <span className="message-sender">You</span>
        ) : (
          message.agentId && <AgentIndicator agentId={message.agentId} />
        )}
        <time className="message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </time>
      </div>
      <div className="message-content">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
}
