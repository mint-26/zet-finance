import { SITE_URL } from '../lib/site';

export default function sitemap() {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/impressum`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/datenschutz`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/agb`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
