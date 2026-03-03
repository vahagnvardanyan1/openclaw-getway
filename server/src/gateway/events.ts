import { EventEmitter } from 'node:events';

export type GatewayEventType =
  | 'chat.message'
  | 'chat.stream.start'
  | 'chat.stream.chunk'
  | 'chat.stream.end'
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'agent.status'
  | 'session.created'
  | 'error';

export interface GatewayEvent {
  type: GatewayEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

class GatewayEventDispatcher extends EventEmitter {
  dispatch(event: GatewayEvent): void {
    this.emit(event.type, event);
    this.emit('*', event);
  }

  onAny(handler: (event: GatewayEvent) => void): void {
    this.on('*', handler);
  }
}

export const gatewayEvents = new GatewayEventDispatcher();
