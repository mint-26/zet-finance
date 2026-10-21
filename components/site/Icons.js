export function Arrow({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M3 9L9 3M4.5 3H9V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

export function Mail({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="2" y="4" width="16" height="12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 4.5L10 10.5L17.5 4.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Phone({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M6.6 2.5H4C3.2 2.5 2.5 3.2 2.6 4C3.1 11 9 16.9 16 17.4C16.8 17.5 17.5 16.8 17.5 16V13.4L13.9 12.2L12.2 13.9C9.9 12.8 7.2 10.1 6.1 7.8L7.8 6.1L6.6 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
