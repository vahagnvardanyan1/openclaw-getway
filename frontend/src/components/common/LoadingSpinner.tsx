export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="loading-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
