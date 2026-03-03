import type { FastifyInstance } from 'fastify';
import { addSseClient } from '../ws/broadcast.js';

export function registerEventRoutes(app: FastifyInstance): void {
  app.get('/api/events', (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in NGINX/Vercel

    // Send initial connection event
    reply.raw.write(`data: ${JSON.stringify({ type: 'connection', data: { status: 'connected', transport: 'sse' } })}\n\n`);

    addSseClient(reply);

    // Keep the connection open - Fastify will handle the rest
    // The client is removed from the set when the connection closes via the event listener in addSseClient
  });
}
