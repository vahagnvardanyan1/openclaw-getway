/**
 * Hierarchy Guard Plugin
 *
 * Enforces strict communication hierarchy:
 * - User <-> PM (bidirectional)
 * - PM <-> FE (bidirectional)
 * - User <-> FE (BLOCKED - FE cannot talk to user, user cannot talk to FE)
 */

interface PluginContext {
  registerGatewayMethod(name: string, handler: GatewayMethodHandler): void;
  log(level: 'info' | 'warn' | 'error', message: string): void;
}

type GatewayMethodHandler = (params: Record<string, unknown>) => Promise<unknown>;

// Define allowed communication paths
const ALLOWED_PATHS: Record<string, string[]> = {
  pm: ['fe', 'qa', 'user'],
  fe: ['pm'],
  qa: ['pm'],
  user: ['pm'],
};

function isAllowed(from: string, to: string): boolean {
  const allowed = ALLOWED_PATHS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export default function register(ctx: PluginContext): void {
  ctx.log('info', 'Hierarchy guard plugin initialized');

  ctx.registerGatewayMethod('validate-hierarchy', async (params) => {
    const from = params.from as string;
    const to = params.to as string;

    if (!from || !to) {
      return {
        allowed: false,
        reason: 'Missing "from" or "to" in validation request',
      };
    }

    const allowed = isAllowed(from, to);

    if (!allowed) {
      ctx.log('warn', `Blocked communication: ${from} -> ${to}`);
    }

    return {
      allowed,
      from,
      to,
      reason: allowed
        ? `Communication from ${from} to ${to} is permitted`
        : `Communication from ${from} to ${to} is NOT permitted. Hierarchy: User <-> PM <-> FE/QA`,
    };
  });
}
