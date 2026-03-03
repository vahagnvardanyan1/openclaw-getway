import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { gatewayClient } from '../gateway/client.js';

export function registerSessionRoutes(app: FastifyInstance): void {
  app.get('/api/sessions', async (_request, reply) => {
    if (!gatewayClient.isConnected) {
      return reply.status(503).send({ error: 'Gateway not connected' });
    }
    const sessions = await gatewayClient.listSessions();
    return { success: true, sessions };
  });

  // OpenClaw sessions are key-based — just generate a unique key.
  // The session is created implicitly on first chat.send.
  app.post('/api/sessions', async (_request, reply) => {
    if (!gatewayClient.isConnected) {
      return reply.status(503).send({ error: 'Gateway not connected' });
    }
    const sessionKey = `webchat:${randomUUID()}`;
    return { success: true, session: { sessionKey } };
  });
}
