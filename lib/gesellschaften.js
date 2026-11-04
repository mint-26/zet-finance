// Insurers Marco submits applications to (his list, 04.11.2026), for the CRM. Separate from
// lib/insurers.js, which lists where a visitor is insured today. tarife stays empty until
// Marco sends his tariff list; entries added here show up as suggestions in the CRM.
// Logos: public/insurers/gesellschaften/ from Adrian's logo overview PDF (04.11.2026), for
// the rest public/insurers/weitere/ (insurers' websites, Wikimedia) and public/insurers/pkv/
// (questionnaire). Barmenia and Gothaer share one logo since their joint brand, BBKK uses the
// logo of Versicherungskammer Bayern, Central the one of Generali, which it now belongs to.
const LOGOS = '/insurers/gesellschaften';
const PKV = '/insurers/pkv';
const MORE = '/insurers/weitere';

export const GESELLSCHAFTEN = [
  { name: 'Advigon', logo: `${MORE}/advigon.svg`, tarife: [] },
  { name: 'Allianz', logo: `${LOGOS}/allianz.png`, tarife: [] },
  { name: 'Alte Oldenburger', logo: `${PKV}/alte-oldenburger-krankenversicherung.png`, tarife: [] },
  { name: 'ARAG', logo: `${LOGOS}/arag.png`, tarife: [] },
  { name: 'AXA', logo: `${LOGOS}/axa.png`, tarife: [] },
  { name: 'Barmenia', logo: `${LOGOS}/barmenia.png`, tarife: [] },
  { name: 'Bayerische Beamtenkrankenkasse (BBKK)', logo: `${LOGOS}/bbkk.png`, tarife: [] },
  { name: 'BDAE', logo: `${MORE}/bdae.svg`, tarife: [] },
  { name: 'Care Concept', logo: `${MORE}/care-concept.png`, tarife: [] },
  { name: 'Central', logo: `${PKV}/generali-krankenversicherung.png`, tarife: [] },
  { name: 'Concordia', logo: `${LOGOS}/concordia.png`, tarife: [] },
  { name: 'Continentale', logo: `${LOGOS}/continentale.png`, tarife: [] },
  { name: 'DBV', logo: `${LOGOS}/dbv.png`, tarife: [] },
  { name: 'Deutsche Familienversicherung (DFV)', logo: `${PKV}/dfv-deutsche-familienversicherung.png`, tarife: [] },
  { name: 'Deutscher Ring', logo: `${MORE}/deutscher-ring.svg`, tarife: [] },
  { name: 'die Bayerische', logo: `${LOGOS}/die-bayerische.png`, tarife: [] },
  { name: 'DKV', logo: `${LOGOS}/dkv.png`, tarife: [] },
  { name: 'Gothaer', logo: `${LOGOS}/gothaer.png`, tarife: [] },
  { name: 'Hallesche', logo: `${LOGOS}/hallesche.png`, tarife: [] },
  { name: 'HanseMerkur', logo: `${LOGOS}/hansemerkur.png`, tarife: [] },
  { name: 'INTER', logo: `${LOGOS}/inter.png`, tarife: [] },
  { name: 'Janitos', logo: `${MORE}/janitos.svg`, tarife: [] },
  { name: 'LKH', logo: `${PKV}/lkh-landeskrankenhilfe.png`, tarife: [] },
  { name: 'Mannheimer Krankenversicherung', logo: `${MORE}/mannheimer.svg`, tarife: [] },
  { name: 'Münchener Verein', logo: `${LOGOS}/muenchener-verein.png`, tarife: [] },
  { name: 'Nürnberger', logo: `${LOGOS}/nuernberger.png`, tarife: [] },
  { name: 'R+V', logo: `${LOGOS}/r-v.png`, tarife: [] },
  { name: 'SIGNAL IDUNA', logo: `${LOGOS}/signal-iduna.png`, tarife: [] },
  { name: 'Stuttgarter', logo: `${MORE}/stuttgarter.png`, tarife: [] },
  { name: 'Süddeutsche Krankenversicherung (SDK)', logo: `${LOGOS}/sdk.png`, tarife: [] },
  { name: 'Union Krankenversicherung (UKV)', logo: `${LOGOS}/ukv.png`, tarife: [] },
  { name: 'uniVersa', logo: `${LOGOS}/universa.png`, tarife: [] },
  { name: 'VPV', logo: `${MORE}/vpv.svg`, tarife: [] },
  { name: 'Württembergische', logo: `${LOGOS}/wuerttembergische.png`, tarife: [] },
  { name: 'Würzburger', logo: `${MORE}/wuerzburger.svg`, tarife: [] },
];

export const gesellschaftByName = (name) => GESELLSCHAFTEN.find((g) => g.name === name);
