export function Arrow({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M3 9L9 3M4.5 3H9V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

export function Plus({ open, size = 16 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"
      style={{ flexShrink: 0, transition: 'transform 0.3s ease', transform: open ? 'rotate(45deg)' : 'none' }}
    >
      <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
