/**
 * OpenClaw Gateway protocol helpers.
 * The gateway uses its own WebSocket protocol (NOT JSON-RPC 2.0).
 *
 * Wire format:
 *   Request:  { type: "req", id, method, params }
 *   Response: { type: "res", id, ok, payload | error }
 *   Event:    { type: "event", event, payload, seq?, stateVersion? }
 *
 * First frame from gateway is a connect.challenge event.
 * Client must respond with a "connect" request including signed device identity.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ── Frame types ──────────────────────────────────────────────

export interface OcRequest {
  type: 'req';
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface OcResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: string;
}

export interface OcEvent {
  type: 'event';
  event: string;
  payload: Record<string, unknown>;
  seq?: number;
  stateVersion?: string;
}

export type OcMessage = OcResponse | OcEvent | OcRequest;

// ── Request ID counter ───────────────────────────────────────

let requestId = 0;

export function buildRequest(method: string, params: Record<string, unknown>): OcRequest {
  return {
    type: 'req',
    id: String(++requestId),
    method,
    params,
  };
}

// ── Device identity ──────────────────────────────────────────

interface DeviceIdentity {
  deviceId: string;
  publicKeyPem: string;
  privateKeyPem: string;
}

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function derivePublicKeyRaw(publicKeyPem: string): Buffer {
  const spki = crypto.createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' }) as Buffer;
  if (spki.length === ED25519_SPKI_PREFIX.length + 32 &&
      spki.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)) {
    return spki.subarray(ED25519_SPKI_PREFIX.length);
  }
  return spki;
}

function fingerprintPublicKey(publicKeyPem: string): string {
  const raw = derivePublicKeyRaw(publicKeyPem);
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateIdentity(): DeviceIdentity {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
  return {
    deviceId: fingerprintPublicKey(publicKeyPem),
    publicKeyPem,
    privateKeyPem,
  };
}

const IDENTITY_DIR = path.join(os.homedir(), '.openclaw', 'bridge-server');
const IDENTITY_FILE = path.join(IDENTITY_DIR, 'device-identity.json');

function loadOrCreateDeviceIdentity(): DeviceIdentity {
  try {
    if (fs.existsSync(IDENTITY_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'));
      if (parsed?.version === 1 && parsed.deviceId && parsed.publicKeyPem && parsed.privateKeyPem) {
        return {
          deviceId: parsed.deviceId,
          publicKeyPem: parsed.publicKeyPem,
          privateKeyPem: parsed.privateKeyPem,
        };
      }
    }
  } catch { /* regenerate */ }

  const identity = generateIdentity();
  fs.mkdirSync(IDENTITY_DIR, { recursive: true });
  fs.writeFileSync(IDENTITY_FILE, JSON.stringify({
    version: 1,
    deviceId: identity.deviceId,
    publicKeyPem: identity.publicKeyPem,
    privateKeyPem: identity.privateKeyPem,
    createdAtMs: Date.now(),
  }, null, 2) + '\n', { mode: 0o600 });
  return identity;
}

function signPayload(privateKeyPem: string, payload: string): string {
  const key = crypto.createPrivateKey(privateKeyPem);
  return base64UrlEncode(crypto.sign(null, Buffer.from(payload, 'utf8'), key));
}

function publicKeyToBase64Url(publicKeyPem: string): string {
  return base64UrlEncode(derivePublicKeyRaw(publicKeyPem));
}

// Cached identity (loaded once)
let _identity: DeviceIdentity | null = null;
function getIdentity(): DeviceIdentity {
  if (!_identity) _identity = loadOrCreateDeviceIdentity();
  return _identity;
}

// ── Connect request (first client frame) ─────────────────────

const CLIENT_ID = 'gateway-client';
const CLIENT_MODE = 'backend';
const ROLE = 'operator';
const SCOPES = ['operator.read', 'operator.write', 'operator.admin'];

export function buildConnect(token: string, nonce: string): OcRequest {
  const identity = getIdentity();
  const signedAtMs = Date.now();

  // Build v3 signature payload (matches OpenClaw's buildDeviceAuthPayloadV3)
  const sigPayload = [
    'v3',
    identity.deviceId,
    CLIENT_ID,
    CLIENT_MODE,
    ROLE,
    SCOPES.join(','),
    String(signedAtMs),
    token,
    nonce,
    process.platform,  // platform
    '',                // deviceFamily (empty)
  ].join('|');

  const signature = signPayload(identity.privateKeyPem, sigPayload);

  return buildRequest('connect', {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: CLIENT_ID,
      version: '1.0.0',
      platform: process.platform,
      mode: CLIENT_MODE,
    },
    role: ROLE,
    scopes: SCOPES,
    caps: [],
    auth: { token },
    locale: 'en-US',
    userAgent: 'openclaw-bridge/1.0.0',
    device: {
      id: identity.deviceId,
      publicKey: publicKeyToBase64Url(identity.publicKeyPem),
      signature,
      signedAt: signedAtMs,
      nonce,
    },
  });
}

// ── Post-handshake requests ──────────────────────────────────

export function buildChatSend(sessionKey: string, message: string): OcRequest {
  return buildRequest('chat.send', {
    sessionKey,
    message,
    idempotencyKey: `${sessionKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
}

export function buildSessionsList(): OcRequest {
  return buildRequest('sessions.list', {
    includeDerivedTitles: true,
    includeLastMessage: true,
  });
}

export function buildChatHistory(sessionKey: string): OcRequest {
  return buildRequest('chat.history', {
    sessionKey,
  });
}

// ── Message classification ───────────────────────────────────

export function isEvent(msg: OcMessage): msg is OcEvent {
  return msg.type === 'event';
}

export function isResponse(msg: OcMessage): msg is OcResponse {
  return msg.type === 'res';
}

export function isRequest(msg: OcMessage): msg is OcRequest {
  return msg.type === 'req';
}

export function parseMessage(data: string): OcMessage | null {
  try {
    return JSON.parse(data) as OcMessage;
  } catch {
    return null;
  }
}
