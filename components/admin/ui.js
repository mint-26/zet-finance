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
