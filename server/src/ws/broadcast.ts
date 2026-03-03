import type { WebSocket } from 'ws';
import type { FastifyReply } from 'fastify';

const clients = new Set<WebSocket>();
const sseClients = new Set<FastifyReply>();

export function addClient(ws: WebSocket): void {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

export function addSseClient(reply: FastifyReply): void {
  sseClients.add(reply);
  reply.raw.on('close', () => {
    sseClients.delete(reply);
  });
}

export function broadcast(event: { type: string; data: unknown }): void {
  const message = JSON.stringify(event);
  
  // Broadcast to WebSocket clients
  for (const client of clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(message);
    }
  }

  // Broadcast to SSE clients
  for (const reply of sseClients) {
    reply.raw.write(`data: ${message}\n\n`);
  }
}

export function getClientCount(): number {
  return clients.size + sseClients.size;
}
