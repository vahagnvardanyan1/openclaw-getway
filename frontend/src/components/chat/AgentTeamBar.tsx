import { useChatStore } from '../../store/chat';
import type { AgentId, AgentInfo } from '../../types/agent';

const AGENT_ROLES: Record<AgentId, string> = {
  pm: 'Plans features & writes specs',
  fe: 'Builds UI & writes code',
  qa: 'Tests & validates work',
};

const STATUS_LABELS: Record<AgentInfo['status'], string> = {
  idle: 'Idle',
  thinking: 'Thinking...',
  responding: 'Responding...',
};

export function AgentTeamBar() {
  const agents = useChatStore((s) => s.agents);

  return (
    <div className="agent-team-bar">
      {(Object.values(agents) as AgentInfo[]).map((agent) => (
        <div key={agent.id} className="agent-team-card">
          <div
            className="agent-team-avatar"
            style={{ backgroundColor: `var(--color-${agent.id})` }}
          >
            {agent.id.toUpperCase()}
          </div>
          <div className="agent-team-info">
            <span className="agent-team-name">{agent.name}</span>
            <span className="agent-team-role">{AGENT_ROLES[agent.id]}</span>
          </div>
          <span className={`agent-team-status agent-team-status--${agent.status}`}>
            <span className="agent-team-status-dot" />
            {STATUS_LABELS[agent.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
