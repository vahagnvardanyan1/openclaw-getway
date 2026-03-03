/**
 * Maps OpenClaw gateway events into the format expected by the frontend.
 *
 * Actual OpenClaw event shapes (from gateway logs):
 *
 * agent lifecycle:
 *   {event:"agent", payload:{runId, stream:"lifecycle", data:{phase:"start"|"end"}, sessionKey, seq, ts}}
 *
 * agent assistant stream:
 *   {event:"agent", payload:{runId, stream:"assistant", data:{text:"cumulative", delta:"incremental"}, sessionKey, seq, ts}}
 *
 * chat delta/final:
 *   {event:"chat", payload:{runId, sessionKey, seq, state:"delta"|"final",
 *     message:{role:"assistant", content:[{type:"text", text:"..."}], timestamp}}}
 */

export interface FrontendEvent {
  type: string;
  data: Record<string, unknown>;
}

/** Extract plain text from OpenClaw message content (array of {type, text} blocks). */
function extractTextContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((b: { type?: string }) => b.type === 'text')
      .map((b: { text?: string }) => b.text ?? '')
      .join('');
  }
  return String(content ?? '');
}

export function mapGatewayEvent(
  ocEventName: string,
  payload: Record<string, unknown>,
): FrontendEvent[] {
  const events: FrontendEvent[] = [];

  if (ocEventName === 'agent') {
    events.push(...mapAgentEvent(payload));
  } else if (ocEventName === 'chat') {
    events.push(...mapChatEvent(payload));
  } else {
    // Forward unknown events as-is (presence, health, tick, etc.)
    events.push({ type: ocEventName, data: payload });
  }

  return events;
}

function mapAgentEvent(payload: Record<string, unknown>): FrontendEvent[] {
  const events: FrontendEvent[] = [];
  const stream = payload.stream as string | undefined;
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const sessionKey = payload.sessionKey as string | undefined;
  // Try to extract agentId from the sessionKey or payload
  const agentId = (payload.agentId ?? '') as string;

  if (stream === 'lifecycle') {
    const phase = data.phase as string | undefined;

    if (phase === 'start') {
      events.push({
        type: 'agent.status',
        data: { agentId, status: 'thinking', sessionKey },
      });
      events.push({
        type: 'chat.stream.start',
        data: { agentId, sessionKey },
      });
    } else if (phase === 'end') {
      events.push({
        type: 'chat.stream.end',
        data: { agentId, sessionKey },
      });
      events.push({
        type: 'agent.status',
        data: { agentId, status: 'idle', sessionKey },
      });
    } else if (phase === 'error' || phase === 'cancelled') {
      events.push({
        type: 'chat.stream.end',
        data: { agentId, sessionKey },
      });
      events.push({
        type: 'agent.status',
        data: { agentId, status: 'idle', sessionKey },
      });
    }
  } else if (stream === 'assistant') {
    // data.delta = incremental text, data.text = cumulative text
    const delta = (data.delta ?? '') as string;

    if (delta) {
      events.push({
        type: 'chat.stream.chunk',
        data: { content: delta, agentId, sessionKey },
      });
    }
  } else if (stream === 'tool') {
    events.push({
      type: 'agent.status',
      data: { agentId, status: 'thinking', sessionKey },
    });
  } else if (stream === 'thinking') {
    events.push({
      type: 'agent.status',
      data: { agentId, status: 'thinking', sessionKey },
    });
  }

  return events;
}

function mapChatEvent(payload: Record<string, unknown>): FrontendEvent[] {
  const events: FrontendEvent[] = [];
  const state = payload.state as string | undefined; // "delta" | "final"
  const message = payload.message as Record<string, unknown> | undefined;
  const sessionKey = payload.sessionKey as string | undefined;

  if (!message) return events;

  const role = (message.role ?? 'assistant') as string;
  const content = extractTextContent(message.content);
  const agentId = (message.agentId ?? payload.agentId ?? '') as string;
  const ts = message.timestamp as number | string | undefined;
  const timestamp = typeof ts === 'number' ? new Date(ts).toISOString() : (ts ?? new Date().toISOString());

  if (state === 'final' && content) {
    // Final complete message — add as a chat message
    events.push({
      type: 'chat.message',
      data: {
        id: (payload.runId ?? `msg-${Date.now()}`) as string,
        role,
        content,
        agentId,
        agentName: agentId === 'pm' ? 'Product Manager' : agentId === 'fe' ? 'Frontend Engineer' : agentId || 'Agent',
        timestamp,
        sessionKey,
      },
    });
  }
  // Skip "delta" chat events — the agent stream already sends incremental chunks

  return events;
}
