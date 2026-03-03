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

/**
 * Map of sub-agent sessionKey → frontend agentId (e.g. 'fe' or 'qa').
 * Populated by the bridge server when it detects new sub-agent sessions
 * via sessions.list lookup.
 */
const subagentSessionMap = new Map<string, string>();

/** Order in which PM spawns sub-agents: fe first, qa second. */
const SUBAGENT_ORDER = ['fe', 'qa'];

/** Counter for sub-agent spawn order within a PM run. */
let subagentCounter = 0;

/**
 * Register a sub-agent session by spawn order.
 * PM always spawns FE first, then QA.
 */
export function registerSubagentByOrder(sessionKey: string): void {
  const agentId = SUBAGENT_ORDER[subagentCounter % SUBAGENT_ORDER.length] ?? 'fe';
  console.log('[EventMapper] Registering sub-agent by order: %s → %s (counter=%d)', sessionKey, agentId, subagentCounter);
  subagentCounter++;
  subagentSessionMap.set(sessionKey, agentId);
}

/** Check if a sub-agent session is already registered. */
export function hasSubagentSession(sessionKey: string): boolean {
  return subagentSessionMap.has(sessionKey);
}

/**
 * Reset sub-agent session tracking (call when a new PM run starts).
 * Only call this when the PM's runId actually changes.
 */
export function resetSubagentSessions(): void {
  console.log('[EventMapper] Resetting sub-agent sessions (had %d)', subagentSessionMap.size);
  subagentSessionMap.clear();
  subagentCounter = 0;
}

/**
 * Resolve the frontend-facing agentId from a gateway event payload.
 *
 * The gateway always reports `agent=main` (the PM's config id), even for
 * sub-agent runs.  Sub-agent runs are distinguishable by the sessionKey
 * which starts with "subagent:" (e.g. "subagent:3f13b47c-…").
 */
function resolveAgentId(payload: Record<string, unknown>): string {
  const sessionKey = (payload.sessionKey ?? '') as string;

  // Sub-agent sessions → look up registered agent, default to 'fe'
  if (sessionKey.includes('subagent:')) {
    return subagentSessionMap.get(sessionKey) ?? 'fe';
  }

  // Map the gateway config id ("main") to the frontend id ("pm")
  const rawId = (payload.agentId ?? payload.agent ?? '') as string;
  if (rawId === 'main' || rawId === 'pm') return 'pm';
  if (rawId === 'fe') return 'fe';
  if (rawId === 'qa') return 'qa';

  // Default: treat as PM (webchat sessions always belong to the default agent)
  return 'pm';
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
  const agentId = resolveAgentId(payload);

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
  const agentId = resolveAgentId(payload);
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
        agentName: agentId === 'pm' ? 'Product Manager' : agentId === 'fe' ? 'Frontend Engineer' : agentId === 'qa' ? 'QA Engineer' : agentId || 'Agent',
        timestamp,
        sessionKey,
      },
    });
  }
  // Skip "delta" chat events — the agent stream already sends incremental chunks

  return events;
}
