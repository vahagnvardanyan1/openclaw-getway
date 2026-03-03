import type { FastifyInstance } from 'fastify';
import { gatewayClient } from '../gateway/client.js';
import { getClientCount } from '../ws/broadcast.js';

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      gateway: gatewayClient.isConnected ? 'connected' : 'disconnected',
      frontendClients: getClientCount(),
      timestamp: new Date().toISOString(),
    };
  });
}
