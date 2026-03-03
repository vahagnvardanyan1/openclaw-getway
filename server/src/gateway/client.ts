import WebSocket from 'ws';
import { config } from '../config.js';
import {
  buildConnect,
  buildChatSend,
  buildSessionsList,
  buildChatHistory,
  parseMessage,
  isEvent,
  isResponse,
  type OcResponse,
  type OcRequest,
  buildRequest,
} from './protocol.js';
import { gatewayEvents, type GatewayEvent } from './events.js';

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

class GatewayClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();
  private connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly RECONNECT_DELAY = 3000;
  private readonly REQUEST_TIMEOUT = 30000;

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = config.gateway.url;
      console.log(`[Gateway] Connecting to ${url}...`);

      this.ws = new WebSocket(url);

      this.ws.on('open', () => {
        console.log('[Gateway] WebSocket open, waiting for challenge...');
        // Don't send anything yet — wait for the connect.challenge event
        // or send connect immediately if no challenge arrives within 2s
        const fallbackTimer = setTimeout(() => {
          this.sendConnect(resolve, reject);
        }, 2000);

        // Store fallback timer so challenge handler can clear it
        (this.ws as any).__fallbackTimer = fallbackTimer;
      });

      this.ws.on('message', (raw) => {
        const msg = parseMessage(raw.toString());
        if (!msg) return;

        // Handle connect.challenge event (first message from gateway)
        if (isEvent(msg) && msg.event === 'connect.challenge') {
          const nonce = (msg.payload?.nonce as string) || '';
          console.log('[Gateway] Received connect.challenge (nonce=%s)', nonce.slice(0, 8) + '...');
          const fallbackTimer = (this.ws as any)?.__fallbackTimer;
          if (fallbackTimer) clearTimeout(fallbackTimer);

          this.sendConnect(resolve, reject, nonce);
          return;
        }

        if (isResponse(msg)) {
          this.handleResponse(msg, resolve);
        } else if (isEvent(msg)) {
          this.handleEvent(msg);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log(`[Gateway] Connection closed (code=${code}, reason=${reason})`);
        this.connected = false;
        this.rejectAllPending(new Error('Connection closed'));
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('[Gateway] WebSocket error:', err.message);
        if (!this.connected) {
          reject(err);
        }
      });
    });
  }

  private sendConnect(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason: Error) => void,
    nonce: string = '',
  ): void {
    const connectReq = buildConnect(config.gateway.token, nonce);
    console.log('[Gateway] Sending connect request...');

    // Register the connect request as pending so we get the response
    const timer = setTimeout(() => {
      this.pending.delete(connectReq.id);
      reject(new Error('Connect handshake timed out'));
    }, this.REQUEST_TIMEOUT);

    this.pending.set(connectReq.id, {
      resolve: (result) => {
        this.connected = true;
        console.log('[Gateway] Handshake complete, connected as operator');
        resolve();
      },
      reject,
      timer,
    });

    this.ws!.send(JSON.stringify(connectReq));
  }

  private handleResponse(msg: OcResponse, connectResolve?: (value: void | PromiseLike<void>) => void): void {
    const pending = this.pending.get(msg.id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pending.delete(msg.id);

    if (!msg.ok) {
      const errMsg = typeof msg.error === 'object' ? JSON.stringify(msg.error) : String(msg.error || 'unknown');
      pending.reject(new Error(`RPC Error: ${errMsg}`));
    } else {
      pending.resolve(msg.payload);
    }
  }

  private handleEvent(msg: { event: string; payload: Record<string, unknown> }): void {
    const event: GatewayEvent = {
      type: msg.event as GatewayEvent['type'],
      data: msg.payload,
      timestamp: new Date().toISOString(),
    };
    gatewayEvents.dispatch(event);
  }

  private send(request: OcRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Gateway not connected'));
        return;
      }

      const timer = setTimeout(() => {
        this.pending.delete(request.id);
        reject(new Error(`Request ${request.method} timed out`));
      }, this.REQUEST_TIMEOUT);

      this.pending.set(request.id, { resolve, reject, timer });
      this.ws.send(JSON.stringify(request));
    });
  }

  /**
   * Call an arbitrary gateway method (used for plugin methods like validate-hierarchy).
   */
  async call(method: string, params: Record<string, unknown>): Promise<unknown> {
    return this.send(buildRequest(method, params));
  }

  private rejectAllPending(error: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    console.log(`[Gateway] Reconnecting in ${this.RECONNECT_DELAY}ms...`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
      } catch (err) {
        console.error('[Gateway] Reconnect failed:', (err as Error).message);
      }
    }, this.RECONNECT_DELAY);
  }

  async sendChatMessage(sessionKey: string, message: string): Promise<unknown> {
    return this.send(buildChatSend(sessionKey, message));
  }

  async listSessions(): Promise<unknown> {
    return this.send(buildSessionsList());
  }

  async getChatHistory(sessionKey: string): Promise<unknown> {
    return this.send(buildChatHistory(sessionKey));
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

export const gatewayClient = new GatewayClient();
