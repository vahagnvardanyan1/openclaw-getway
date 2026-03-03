import { config } from '../config.js';
import { gatewayClient } from './client.js';

// Fallback map mirrors plugins/hierarchy-guard rules
const ALLOWED: Record<string, string[]> = {
  [config.agents.pm]: [config.agents.fe, config.agents.user],
  [config.agents.fe]: [config.agents.pm],
  [config.agents.user]: [config.agents.pm],
};

export async function validateHierarchy(from: string, to: string): Promise<boolean> {
  // If gateway is online, ask the hierarchy-guard plugin to validate.
  if (gatewayClient.isConnected) {
    try {
      const res = (await gatewayClient.call('validate-hierarchy', { from, to })) as {
        allowed?: boolean;
      };
      if (typeof res?.allowed === 'boolean') {
        return res.allowed;
      }
    } catch (err) {
      // fall through to local rules on error
      console.warn('[Hierarchy] Gateway validation failed, using local rules:', (err as Error).message);
    }
  }

  // Local fallback: static allowlist
  return ALLOWED[from]?.includes(to) ?? false;
}
