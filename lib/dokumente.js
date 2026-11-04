// Documents attached to a lead in the CRM. Files live in the private Supabase bucket below,
// their details in the table lead_dokumente. Also imported by client components: no secrets here.
export const DOKUMENTE_BUCKET = 'lead-dokumente';

export const DOKUMENT_ARTEN = ['Angebot', 'Antrag', 'Vertrag', 'Sonstiges'];

// Same limit and same types as the bucket itself (migration crm_tarif_und_lead_dokumente).
export const MAX_DATEIGROESSE = 50 * 1024 * 1024;

const MIME_BY_EXT = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const ERLAUBTE_ENDUNGEN = Object.keys(MIME_BY_EXT).map((ext) => `.${ext}`).join(',');

export const endungVon = (dateiname) => (dateiname.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();

export const mimeVon = (dateiname) => MIME_BY_EXT[endungVon(dateiname)] || null;

// Supabase Free plan. Set to the new quota when the plan changes (Pro: 100 GB).
export const SPEICHER_KONTINGENT = 1024 * 1024 * 1024;

export function formatGroesse(bytes) {
  if (!bytes) return '0 MB';
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toLocaleString('de-DE', { maximumFractionDigits: 1 })} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
