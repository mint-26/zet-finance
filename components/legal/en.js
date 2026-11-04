'use client';

// English versions of the legal pages. Courtesy translations: the German text on the same
// page stays the legally binding one, so any change there has to be repeated here.

const MAIL = 'kontakt@marcoarpa.com';

export function CourtesyNote() {
  return (
    <div style={{
      background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 8, padding: 16, marginBottom: 32,
      fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 500,
    }}>
      This English version is a courtesy translation. Only the German version is legally binding.
    </div>
  );
}

export function ImpressumEn({ h2Style, numStyle, linkStyle }) {
  return (
    <>
      <section>
        <h2 style={h2Style}><span style={numStyle}>§</span> Information pursuant to § 5 TMG (German Telemedia Act)</h2>
        <p>Marco Arpa<br />Insurance broker under § 34d GewO (German Trade Regulation Act)<br /><br />Königsteiner Straße 6a<br />65812 Bad Soden am Taunus, Germany</p>
      </section>
      <section>
        <h2 style={h2Style}>Contact</h2>
        <p>Email: <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a><br />Phone: +49 152 5461 1314</p>
      </section>
      <section>
        <h2 style={h2Style}>Registration</h2>
        <p>
          Registered as an insurance broker under § 34d (1) GewO<br />
          Register number: D-4GG1-I1LV5-50<br />
          Register office: Deutscher Industrie- und Handelskammertag (DIHK) e.V., Breite Straße 29, 10178 Berlin<br />
          Can be verified at: <a href="https://www.vermittlerregister.info" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.vermittlerregister.info</a>
        </p>
      </section>
      <section>
        <h2 style={h2Style}>Competent supervisory authority</h2>
        <p>
          IHK Frankfurt am Main (Chamber of Industry and Commerce)<br />
          Börsenplatz 4<br />
          60313 Frankfurt am Main<br />
          <a href="https://www.frankfurt-main.ihk.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.frankfurt-main.ihk.de</a>
        </p>
      </section>
      <section>
        <h2 style={h2Style}>Professional regulations</h2>
        <p>
          § 34d Gewerbeordnung (GewO, Trade Regulation Act)<br />
          Versicherungsvermittlungsverordnung (VersVermV, Insurance Mediation Ordinance)<br />
          Available at: <a href="https://www.gesetze-im-internet.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.gesetze-im-internet.de</a>
        </p>
      </section>
      <section>
        <h2 style={h2Style}>Professional liability insurance</h2>
        <p>
          R+V Versicherung AG<br />
          Raiffeisenplatz 1<br />
          65189 Wiesbaden<br />
          Territorial scope: Germany and EU
        </p>
      </section>
      <section>
        <h2 style={h2Style}>Broker pool</h2>
        <p>Insurance contracts are brokered through Fondsfinanz Maklerservice GmbH, Riesstraße 25, 80992 Munich.</p>
      </section>
      <section>
        <h2 style={h2Style}>Dispute resolution</h2>
        <p>
          Versicherungsombudsmann e.V.<br />
          Postfach 08 06 32<br />
          10006 Berlin<br />
          <a href="https://www.versicherungsombudsmann.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.versicherungsombudsmann.de</a>
        </p>
        <p style={{ marginTop: 16 }}>
          The European Commission provides a platform for online dispute resolution (ODR):<br />
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={linkStyle}>https://ec.europa.eu/consumers/odr</a><br />
          Email: <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a>
        </p>
        <p style={{ marginTop: 16 }}>We are neither obliged nor willing to take part in dispute resolution proceedings before a consumer arbitration board.</p>
      </section>
      <section>
        <h2 style={h2Style}>Liability for content</h2>
        <p>As a service provider, we are responsible for our own content on these pages under general law pursuant to § 7 (1) TMG. Under §§ 8 to 10 TMG, however, we are not obliged as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate unlawful activity.</p>
      </section>
      <section>
        <h2 style={h2Style}>Liability for links</h2>
        <p>Our website contains links to external third-party websites whose content we cannot influence. The respective provider or operator is always responsible for the content of linked pages. The linked pages were checked for possible legal violations at the time of linking. Permanent monitoring of the content of linked pages is not reasonable without concrete evidence of a legal violation.</p>
      </section>
    </>
  );
}

export function DatenschutzEn({ h2Style, numStyle, linkStyle }) {
  const list = { paddingLeft: 24, marginTop: 8, marginBottom: 12 };
  return (
    <>
      <section>
        <h2 style={h2Style}><span style={numStyle}>1.</span> Controller</h2>
        <p>
          Marco Arpa<br />
          Insurance broker under § 34d GewO<br />
          Königsteiner Straße 6a<br />
          65812 Bad Soden am Taunus, Germany<br />
          Email: <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a><br />
          Phone: +49 152 5461 1314
        </p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>2.</span> Collection and storage of personal data</h2>
        <p>When you visit this website, information is automatically collected by the hosting provider (Vercel Inc.). This information includes the browser type, operating system, page accessed, date and time of access and the IP address. This data is not combined with other data sources.</p>
        <p style={{ marginTop: 12 }}>The legal basis for processing this data is Art. 6 (1) (f) GDPR. Our legitimate interest lies in providing a functioning website.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>3.</span> Contact form and questionnaire</h2>
        <p>When you complete the questionnaire on this website, the following data is collected:</p>
        <ul style={list}>
          <li>Title, first name, last name</li>
          <li>Date of birth</li>
          <li>Email address</li>
          <li>Phone number (optional)</li>
          <li>Information on your dental condition (health data)</li>
          <li>Information on your employment status, for civil servants also on entitlement to state aid (Beihilfe)</li>
          <li>Information on existing insurance</li>
          <li>Wishes regarding insurance benefits</li>
          <li>Free-text message (optional)</li>
        </ul>
        <p style={{ marginBottom: 12 }}>When you enter your address in the questionnaire, we fill in the town and suggest matching streets. For this purpose, your postcode and the street name you type are sent via our server to the OpenPLZ API directory (openplzapi.org). The service does not receive your house number, your IP address or your other details. We do not store the search queries. The suggestions are optional, you can also enter your address without them.</p>
        <p>Health data (information on your dental condition) is a special category of personal data within the meaning of Art. 9 GDPR. This data is processed solely on the basis of your explicit consent pursuant to Art. 9 (2) (a) GDPR, which you give via the privacy checkbox in the questionnaire.</p>
        <p style={{ marginTop: 12 }}>The remaining personal data is processed on the basis of Art. 6 (1) (b) GDPR (pre-contractual measures) and Art. 6 (1) (a) GDPR (consent).</p>
        <p style={{ marginTop: 12 }}>Your data is used solely to handle your enquiry and to prepare an individual insurance offer.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>4.</span> Enquiries via WhatsApp</h2>
        <p>You can write to us on WhatsApp. If you use the WhatsApp link on this website, an automated assistant answers your message first. It asks whether you would like an offer for supplementary dental insurance or a personal conversation and records your details step by step. The assistant works according to fixed rules, no artificial intelligence is used. Marco Arpa then continues the conversation personally.</p>
        <p style={{ marginTop: 12 }}>The following is processed:</p>
        <ul style={list}>
          <li>Your mobile number and your WhatsApp profile name</li>
          <li>The content and time of your messages</li>
          <li>For the dental offer, the same details as in the questionnaire (see section 3), including information on your dental condition (health data)</li>
          <li>For a conversation request, your name and your concern</li>
        </ul>
        <p>The assistant only asks for health data after you have given your explicit consent in the chat (Art. 9 (2) (a) GDPR). Without consent, no details are recorded. Otherwise, the legal basis is Art. 6 (1) (b) GDPR (pre-contractual measures). You can end the assistant at any time with &quot;abbrechen&quot; (cancel), any details already given are then discarded.</p>
        <p style={{ marginTop: 12 }}>Your answers are stored temporarily during the chat. On completion, we transfer them to our client management system (Supabase, servers in the EU) and delete the interim state. We delete unfinished chats after 30 days. The retention period in section 7 applies to the client management system.</p>
        <p style={{ marginTop: 12 }}>WhatsApp is a service of WhatsApp Ireland Limited, Merrion Road, Dublin 4, D04 X2K5, Ireland, a company of the Meta group. To receive and send messages, we use Meta&apos;s WhatsApp Business Platform, where applicable via a technical service provider (Business Solution Provider) with whom a data processing agreement is in place. Messages are encrypted in transit, but are decrypted and processed on the servers of Meta or the service provider. Data may be transferred to the USA in the process. Meta is certified under the EU-US Data Privacy Framework, and the EU Standard Contractual Clauses also apply (Art. 46 (2) (c) GDPR). You can find details in the{' '}
          <a href="https://www.whatsapp.com/legal/privacy-policy-eea" target="_blank" rel="noopener noreferrer" style={linkStyle}>WhatsApp privacy policy</a>.</p>
        <p style={{ marginTop: 12 }}>If you do not wish to use WhatsApp, you can also reach us via the questionnaire, the contact form, by email or by phone.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>5.</span> Disclosure of data</h2>
        <p>In the course of preparing an offer, your data may be passed on to the following recipients:</p>
        <ul style={list}>
          <li>Fondsfinanz Maklerservice GmbH, Riesstraße 25, 80992 Munich (broker pool for brokering contracts)</li>
          <li>Insurance companies, where this is necessary to prepare an offer</li>
        </ul>
        <p>Data is not passed on to third parties beyond this unless we are legally obliged to do so.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>6.</span> Your rights</h2>
        <p>You have the following rights with regard to your personal data:</p>
        <ul style={list}>
          <li>Right of access (Art. 15 GDPR)</li>
          <li>Right to rectification (Art. 16 GDPR)</li>
          <li>Right to erasure (Art. 17 GDPR)</li>
          <li>Right to restriction of processing (Art. 18 GDPR)</li>
          <li>Right to data portability (Art. 20 GDPR)</li>
          <li>Right to object to processing (Art. 21 GDPR)</li>
          <li>Right to withdraw consent (Art. 7 (3) GDPR)</li>
        </ul>
        <p>You can withdraw consent to the processing of health data at any time with effect for the future. Send your withdrawal to: <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a></p>
        <p style={{ marginTop: 12 }}>You also have the right to lodge a complaint with a data protection supervisory authority about the processing of your personal data.</p>
        <p style={{ marginTop: 12 }}>
          Competent supervisory authority:<br />
          Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
          Postfach 3163<br />
          65021 Wiesbaden<br />
          <a href="https://www.datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.datenschutz.hessen.de</a>
        </p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>7.</span> Storage period</h2>
        <p>Personal data is deleted as soon as the purpose of storage no longer applies. For data from the questionnaire: if no contract is concluded, your data is deleted no later than 6 months after the last contact. For contract data, the statutory retention periods of up to 10 years under the German Commercial Code (HGB) and Fiscal Code (AO) apply. This also applies to documents we keep with your enquiry, such as offers, applications and contracts.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>8.</span> Hosting</h2>
        <p>This website is hosted by Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA). Data is transferred to the USA on the basis of the EU Standard Contractual Clauses pursuant to Art. 46 (2) (c) GDPR.</p>
        <p style={{ marginTop: 12 }}>We store your enquiries and related documents, such as offers, applications and contracts, in our client management system at Supabase (Supabase Inc., servers in the EU). The files are not publicly accessible.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>9.</span> Cookies</h2>
        <p>This website uses no tracking cookies and no analytics tools. Only technically necessary settings, your theme preference (light/dark mode) and your language choice, are kept in your browser&apos;s local storage. These settings contain no personal data.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>10.</span> SSL/TLS encryption</h2>
        <p>For security reasons, this website uses SSL or TLS encryption. You can recognise an encrypted connection by the address bar of your browser changing from &quot;http://&quot; to &quot;https://&quot; and by the lock symbol in your browser bar.</p>
      </section>
    </>
  );
}

export function AgbEn({ h2Style, numStyle, linkStyle }) {
  return (
    <>
      <section>
        <h2 style={h2Style}><span style={numStyle}>1.</span> Scope</h2>
        <p>These terms of use apply to the use of the website of Marco Arpa, Königsteiner Straße 6a, 65812 Bad Soden am Taunus, Germany. The website serves solely to collect contact and needs data in order to prepare a non-binding offer for supplementary dental insurance.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>2.</span> Provider</h2>
        <p>
          Marco Arpa<br />
          Insurance broker under § 34d GewO<br />
          Königsteiner Straße 6a<br />
          65812 Bad Soden am Taunus, Germany<br />
          Email: <a href={`mailto:${MAIL}`} style={linkStyle}>{MAIL}</a><br />
          Phone: +49 152 5461 1314<br />
          Register number: D-4GG1-I1LV5-50
        </p>
        <p style={{ marginTop: 12 }}>Insurance contracts are brokered through Fondsfinanz Maklerservice GmbH, Riesstraße 25, 80992 Munich.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>3.</span> Description of services</h2>
        <p>Using the questionnaire on this website, you can submit your contact details and information on your dental situation. On the basis of this information, Marco Arpa prepares a non-binding offer for supplementary dental insurance. Brokering and conclusion of the contract take place exclusively through Fondsfinanz Maklerservice by way of a separate application. No insurance contract and no brokerage contract is concluded via this website.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>4.</span> Non-binding nature</h2>
        <p>Offers prepared via this website are non-binding. An insurance contract is only concluded when the respective insurance company accepts a separate application.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>5.</span> Costs</h2>
        <p>Using this website and receiving advice from Marco Arpa are free of charge for you. Remuneration is paid by the insurance companies as commission via Fondsfinanz Maklerservice.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>6.</span> Information in the questionnaire</h2>
        <p>Truthful and complete information is required to prepare a suitable offer. This applies in particular to the information on your dental condition. The information in the questionnaire does not constitute pre-contractual disclosure within the meaning of the German Insurance Contract Act (VVG). The pre-contractual duty of disclosure only arises in the course of the formal application via Fondsfinanz Maklerservice.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>7.</span> Data protection</h2>
        <p>You can find information on the processing of your data in our <a href="/datenschutz" style={linkStyle}>privacy policy</a>.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>8.</span> Liability</h2>
        <p>Marco Arpa accepts no liability for the accuracy, completeness or timeliness of the general information provided on this website. Liability for damage arising from the use of this website is limited to intent and gross negligence. Liability in the context of insurance brokerage is governed by statutory provisions and is covered by the professional liability insurance with R+V Versicherung AG.</p>
      </section>
      <section>
        <h2 style={h2Style}><span style={numStyle}>9.</span> Final provisions</h2>
        <p>The law of the Federal Republic of Germany applies. Should individual provisions of these terms of use be invalid, the validity of the remaining provisions shall remain unaffected.</p>
        <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-dim)' }}>As of: April 2026</p>
      </section>
    </>
  );
}
