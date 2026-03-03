import type { FastifyInstance } from 'fastify';
import { addClient, broadcast } from './broadcast.js';
import { gatewayClient } from '../gateway/client.js';
import { validateHierarchy } from '../gateway/hierarchy.js';

export function registerWebSocketHandler(app: FastifyInstance): void {
  app.get('/ws', { websocket: true }, (socket, _req) => {
    addClient(socket);

    socket.send(
      JSON.stringify({
        type: 'connection',
        data: { status: 'connected', gateway: gatewayClient.isConnected },
      })
    );

    socket.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type: string;
          sessionId?: string;
          message?: string;
          from?: string;
        };

        if (msg.type === 'chat.send' && msg.sessionId && msg.message) {
          // Enforce hierarchy: User -> PM only
          const allowed = await validateHierarchy('user', 'pm');
          if (!allowed) {
            socket.send(
              JSON.stringify({
                type: 'error',
                data: { message: 'Message blocked by hierarchy guard (user -> pm only)' },
              })
            );
            return;
          }

          await gatewayClient.sendChatMessage(msg.sessionId, msg.message);
        }
      } catch (err) {
        socket.send(
          JSON.stringify({
            type: 'error',
            data: { message: (err as Error).message },
          })
        );
      }
    });
  });
}

// Re-export broadcast so routes/gateway events can use it
export { broadcast };
