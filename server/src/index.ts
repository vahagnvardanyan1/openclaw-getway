import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from './config.js';
import { gatewayClient } from './gateway/client.js';
import { gatewayEvents } from './gateway/events.js';
import { mapGatewayEvent } from './gateway/event-mapper.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerChatRoutes } from './routes/chat.js';
import { registerTaskRoutes } from './routes/tasks.js';
import { registerSessionRoutes } from './routes/sessions.js';
import { registerWebSocketHandler, broadcast } from './ws/handler.js';

async function start(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
  });
  await app.register(websocket);

  // Register routes
  registerHealthRoutes(app);
  registerChatRoutes(app);
  registerTaskRoutes(app);
  registerSessionRoutes(app);
  registerWebSocketHandler(app);

  // Forward gateway events to frontend clients (mapped to frontend-expected names)
  gatewayEvents.onAny((event) => {
    console.log('[Events] Raw gateway event: %s payload=%j', event.type, event.data);

    const mapped = mapGatewayEvent(event.type, event.data);
    for (const fe of mapped) {
      console.log('[Events]   -> frontend: %s data=%j', fe.type, fe.data);
      broadcast(fe);
    }
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
