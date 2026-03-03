import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from './config.js';
import { gatewayClient } from './gateway/client.js';
import { gatewayEvents, type GatewayEvent } from './gateway/events.js';
import { mapGatewayEvent, hasSubagentSession, registerSubagentByOrder, resetSubagentSessions } from './gateway/event-mapper.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerChatRoutes } from './routes/chat.js';
import { registerSessionRoutes } from './routes/sessions.js';
import { registerEventRoutes } from './routes/events.js';
import { registerWebSocketHandler, broadcast } from './ws/handler.js';

/** Track PM's current runId so we only reset sub-agent tracking on genuinely new runs. */
let currentPmRunId: string | null = null;

function processEvent(event: GatewayEvent): void {
  console.log('[Events] Raw gateway event: %s payload=%j', event.type, event.data);

  const sessionKey = event.data.sessionKey as string | undefined;

  // Reset sub-agent tracking only when PM's runId actually changes
  const rawType = event.type as string;
  if (rawType === 'agent' && !sessionKey?.includes('subagent:')) {
    const runId = event.data.runId as string | undefined;
    const stream = event.data.stream as string | undefined;
    const data = (event.data.data ?? {}) as Record<string, unknown>;
    // Only reset on user-initiated runs (webchat:), not on sub-agent announce-triggered runs
    const isUserInitiated = runId?.startsWith('webchat:');
    if (stream === 'lifecycle' && data.phase === 'start' && runId && isUserInitiated && runId !== currentPmRunId) {
      console.log('[Sessions] New user-initiated PM run (runId=%s, prev=%s) — resetting sub-agent tracking', runId, currentPmRunId);
      currentPmRunId = runId;
      resetSubagentSessions();
    }
  }

  // When a new sub-agent session appears, register by spawn order:
  // PM always spawns FE first, then QA.
  if (sessionKey?.includes('subagent:') && !hasSubagentSession(sessionKey)) {
    registerSubagentByOrder(sessionKey);
  }

  const mapped = mapGatewayEvent(event.type, event.data);
  for (const fe of mapped) {
    console.log('[Events]   -> frontend: %s data=%j', fe.type, fe.data);
    broadcast(fe);
  }
}

async function start(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://openclaw-getway-client.vercel.app'],
  });
  await app.register(websocket);

  // Register routes
  registerHealthRoutes(app);
  registerChatRoutes(app);
  registerSessionRoutes(app);
  registerEventRoutes(app);
  registerWebSocketHandler(app);

  // Forward gateway events to frontend clients
  gatewayEvents.onAny((event) => {
    processEvent(event);
  });

  // Connect to OpenClaw Gateway
  try {
    await gatewayClient.connect();
    console.log('[Bridge] Connected to OpenClaw Gateway');
  } catch (err) {
    console.warn('[Bridge] Gateway not available, will retry:', (err as Error).message);
  }

  // Start server
  await app.listen({ port: config.port, host: config.host });
  console.log(`[Bridge] Server listening on http://${config.host}:${config.port}`);
}

start().catch((err) => {
  console.error('[Bridge] Fatal error:', err);
  process.exit(1);
});
