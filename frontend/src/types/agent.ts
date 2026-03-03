export type AgentId = 'pm' | 'fe';

export interface AgentInfo {
  id: AgentId;
  name: string;
  status: 'idle' | 'thinking' | 'responding';
}
