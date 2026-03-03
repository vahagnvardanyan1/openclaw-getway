import { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/chat';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  return (
    <div className="message-list">
      {messages.length === 0 && (
        <div className="message-list-empty">
          <p>Send a message to start working with the PM agent.</p>
          <p className="hint">The PM will analyze your request and delegate to the FE engineer.</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <StreamingMessage />
      <div ref={endRef} />
    </div>
  );
}
