import { useState, useRef } from 'react';
import { useChatStore } from '../../store/chat';
import { api } from '../../api/client';

export function ChatInput() {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const addMessage = useChatStore((s) => s.addMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeSessionId || sending || isStreaming) return;

    setSending(true);
    setText('');

    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    });

    try {
      await api.sendMessage(activeSessionId, trimmed);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <textarea
        ref={inputRef}
        className="chat-textarea"
        placeholder={
          activeSessionId
            ? 'Type a message... (Enter to send, Shift+Enter for newline)'
            : 'Create or select a session first'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!activeSessionId || sending}
        rows={2}
      />
      <button
        className="btn btn-primary btn-send"
        onClick={handleSend}
        disabled={!text.trim() || !activeSessionId || sending || isStreaming}
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
