export const STATUS_OPTIONS = [
  { value: 'offen', label: 'Offen', color: '#9ca3af' },
  { value: 'angebot_verschickt', label: 'Angebot verschickt', color: '#c9a24a' },
  { value: 'abgelehnt', label: 'Abgelehnt', color: '#dc3c3c' },
  { value: 'versichert', label: 'Versichert', color: '#4a9e6a' },
  { value: 'kein_interesse', label: 'Kein Interesse', color: '#64748b' },
];

// Pill colours per status, from globals.css, so dark and light mode each get readable ones.
const PILL = { offen: 'offen', angebot_verschickt: 'angebot', abgelehnt: 'abgelehnt', versichert: 'versichert', kein_interesse: 'kein' };
export const pillColors = (status) => {
  const name = PILL[status] || 'offen';
  return { color: `var(--pill-${name}-fg)`, background: `var(--pill-${name}-bg)`, border: `1px solid var(--pill-${name}-border)` };
};

// Shared look of the CRM's dropdowns: the browser's own arrow differs per control and browser,
// so every select draws the same thin chevron, the one InsurerSelect shows when compact.
const CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a8a85' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")";

export const selectLook = {
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: CHEVRON,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px',
  paddingRight: 36,
  cursor: 'pointer',
};
