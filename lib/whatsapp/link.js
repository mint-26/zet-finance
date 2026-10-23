// Entry point into the WhatsApp bot. The bot only starts when a chat opens
// with this prefilled text, i.e. when a lead tapped the link on the website
// or the QR code. Anyone else writing to Marco's number is left to Marco.
// Safe to import from client components.

export const WHATSAPP_TRIGGER_TEXT = 'Hallo Marco, ich komme über marcoarpa.com.';

// Number the link opens, digits only with country code. Set per environment
// (Meta test number while testing, Marco's number later). Without it the
// website shows no WhatsApp link.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');

export function whatsappLink() {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TRIGGER_TEXT)}`;
}

// Tolerates small edits by the lead (case, "ueber" instead of "über").
export function isTrigger(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes('über marcoarpa.com') || t.includes('ueber marcoarpa.com');
}
