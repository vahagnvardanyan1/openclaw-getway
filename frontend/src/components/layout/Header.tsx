import { useUiStore } from '../../store/ui';
import { useChatStore } from '../../store/chat';
import { api } from '../../api/client';

export function Header() {
  const connectionStatus = useUiStore((s) => s.connectionStatus);
  const gatewayStatus = useUiStore((s) => s.gatewayStatus);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const sessions = useChatStore((s) => s.sessions);
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  const setSessions = useChatStore((s) => s.setSessions);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const handleNewSession = async () => {
    try {
      const res = await api.createSession();
      const session = res.session;
      const id = session.sessionKey ?? session.id;
      setSessions([...sessions, { id, createdAt: session.createdAt ?? new Date().toISOString() }]);
      setActiveSession(id);
      clearMessages();
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Multi-Agent System</h1>
        <span className="header-subtitle">PM + FE Agents</span>
      </div>
      <div className="header-center">
        <select
          className="session-selector"
          value={activeSessionId ?? ''}
          onChange={(e) => {
            setActiveSession(e.target.value);
            clearMessages();
          }}
        >
          <option value="" disabled>
            Select session
          </option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id.slice(0, 8)}...
            </option>
          ))}
        </select>
        <button className="btn btn-sm" onClick={handleNewSession}>
          New Session
        </button>
      </div>
      <div className="header-right">
        <span className={`status-dot ${connectionStatus}`} />
        <span className="status-label">WS: {connectionStatus}</span>
        <span className={`status-dot ${gatewayStatus}`} />
        <span className="status-label">GW: {gatewayStatus}</span>
      </div>
    </header>
  );
}
