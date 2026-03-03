import { useCallback, useRef } from 'react';
import { Header } from './Header';
import { ChatPanel } from '../chat/ChatPanel';
import { TaskDashboard } from '../dashboard/TaskDashboard';
import { useUiStore } from '../../store/ui';

export function AppShell() {
  const chatPanelWidth = useUiStore((s) => s.chatPanelWidth);
  const setChatPanelWidth = useUiStore((s) => s.setChatPanelWidth);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setChatPanelWidth(Math.max(25, Math.min(75, pct)));
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setChatPanelWidth]);

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="panel chat-panel" style={{ width: `${chatPanelWidth}%` }}>
          <ChatPanel />
        </div>
        <div
          className="panel-divider"
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
        />
        <div className="panel dashboard-panel" style={{ width: `${100 - chatPanelWidth}%` }}>
          <TaskDashboard />
        </div>
      </main>
    </div>
  );
}
