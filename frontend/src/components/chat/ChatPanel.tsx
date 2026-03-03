import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { AgentTeamBar } from './AgentTeamBar';

export function ChatPanel() {
  return (
    <div className="chat-panel-inner">
      <div className="panel-header">
        <h2>Chat</h2>
      </div>
      <AgentTeamBar />
      <MessageList />
      <ChatInput />
    </div>
  );
}
