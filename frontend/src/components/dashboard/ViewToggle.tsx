import { useTaskStore } from '../../store/tasks';

export function ViewToggle() {
  const viewMode = useTaskStore((s) => s.viewMode);
  const setViewMode = useTaskStore((s) => s.setViewMode);

  return (
    <div className="view-toggle" role="radiogroup" aria-label="View mode">
      <button
        className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
        onClick={() => setViewMode('board')}
        role="radio"
        aria-checked={viewMode === 'board'}
      >
        Board
      </button>
      <button
        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => setViewMode('list')}
        role="radio"
        aria-checked={viewMode === 'list'}
      >
        List
      </button>
    </div>
  );
}
