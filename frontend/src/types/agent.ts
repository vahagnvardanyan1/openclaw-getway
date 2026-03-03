export type AgentId = 'pm' | 'fe' | 'qa';

export interface AgentInfo {
  id: AgentId;
  name: string;
  status: 'idle' | 'thinking' | 'responding';
}
