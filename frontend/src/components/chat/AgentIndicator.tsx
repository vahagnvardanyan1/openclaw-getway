import type { AgentId } from '../../types/agent';

const AGENT_LABELS: Record<AgentId, string> = {
  pm: 'Product Manager',
  fe: 'Frontend Engineer',
  qa: 'QA Engineer',
};

const AGENT_COLORS: Record<AgentId, string> = {
  pm: 'var(--color-pm)',
  fe: 'var(--color-fe)',
  qa: 'var(--color-qa)',
};

interface Props {
  agentId: AgentId;
  showLabel?: boolean;
}

export function AgentIndicator({ agentId, showLabel = true }: Props) {
  return (
    <span className="agent-indicator" style={{ color: AGENT_COLORS[agentId] }}>
      <span
        className="agent-dot"
        style={{ backgroundColor: AGENT_COLORS[agentId] }}
      />
      {showLabel && <span className="agent-label">{AGENT_LABELS[agentId]}</span>}
    </span>
  );
}
