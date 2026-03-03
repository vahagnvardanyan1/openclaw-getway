import type { FastifyInstance } from 'fastify';
import { gatewayClient } from '../gateway/client.js';
import { validateHierarchy } from '../gateway/hierarchy.js';

export function registerChatRoutes(app: FastifyInstance): void {
  app.post<{
    Body: { session_id: string; message: string };
  }>('/api/chat/send', async (request, reply) => {
    const { session_id, message } = request.body;

    if (!session_id || !message) {
      return reply.status(400).send({ error: 'session_id and message are required' });
    }

    // Enforce hierarchy: User -> PM only
    const allowed = await validateHierarchy('user', 'pm');
    if (!allowed) {
      return reply.status(403).send({ error: 'Message blocked by hierarchy guard (user -> pm only)' });
    }

    if (!gatewayClient.isConnected) {
      return reply.status(503).send({ error: 'Gateway not connected' });
    }

    // session_id from frontend is used as sessionKey in OpenClaw
    const result = await gatewayClient.sendChatMessage(session_id, message);
    return { success: true, result };
  });

  app.get<{
    Querystring: { session_id: string };
  }>('/api/chat/history', async (request, reply) => {
    const { session_id } = request.query;

    if (!session_id) {
      return reply.status(400).send({ error: 'session_id is required' });
    }

    if (!gatewayClient.isConnected) {
      return reply.status(503).send({ error: 'Gateway not connected' });
    }

    const history = await gatewayClient.getChatHistory(session_id);
    return { success: true, history };
  });
}
