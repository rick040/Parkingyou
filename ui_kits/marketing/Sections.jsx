const PYProductChooser = () => (
  <section className="py-product-chooser">
    <div className="py-container py-product-chooser__grid">
      {PY_PRODUCTS.map(product => (
        <a href={product.href} key={product.id}>
          <span><PYIcon name={product.icon} size={24} /></span>
          <h3>{product.title}</h3>
          <p>{product.body}</p>
          <strong>Bekijk optie <PYIcon name="arrow" size={16} /></strong>
        </a>
      ))}
    </div>
  </section>
);

const PYHowItWorks = () => (
  <section className="py-section">
    <div className="py-container">
      <PYSectionIntro title={'Zo werkt het - <em>echt</em> zo simpel.'}>
        Drie stappen tussen jou en een parkeerplek. Geen ticketrolletje, geen rondjes rijden.
      </PYSectionIntro>
      <div className="py-step-grid">
        {[
          ['01', 'Zoek je locatie', 'Vul stad, adres of garage in en vergelijk direct op prijs en afstand.'],
          ['02', 'Reserveer digitaal', 'Kies je tijdvak, voeg je kenteken toe en betaal veilig online.'],
          ['03', 'Rij ontspannen uit', 'Je kenteken opent de slagboom. Het betaalbewijs staat meteen klaar.'],
        ].map(([n, title, body], index) => (
          <article key={n} className={index === 1 ? 'is-featured' : ''}>
            <span>Stap {n}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const PYBenefits = () => (
  <section className="py-section py-section--split">
    <div className="py-container py-split-grid">
      <div>
        <h2>Een parkeermerk dat minder voelt als moeten.</h2>
        <p>De rebranding maakt ParkingYou vriendelijker, sneller en herkenbaarder. Blauw voor vertrouwen, aqua voor beweging en oranje voor de momenten waarop een deal echt mag opvallen.</p>
      </div>
      <div className="py-benefit-grid">
        {[
          ['car', 'Voor bezoekers', 'Heldere prijzen en simpele reservering voordat je vertrekt.'],
          ['shield', 'Voor beheerders', 'Meer grip op bezetting, service en dagkaartcampagnes.'],
          ['bolt', 'Voor steden', 'Minder zoekverkeer door duidelijke digitale verwijzing.'],
          ['card', 'Voor finance', 'Facturen, betaalbewijzen en zakelijke accounts in een flow.'],
        ].map(([icon, title, body]) => (
          <article key={title}>
            <span><PYIcon name={icon} size={22} /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const PYCityStrip = () => (
  <section className="py-city-strip">
    <div className="py-container">
      <div className="py-city-strip__inner">
        {PY_CITIES.filter(c => c !== 'Alle steden').map(city => (
          <a key={city} href={`#/garages?city=${city}`}>
            <span>{city}</span>
            <PYIcon name="chevron" size={18} />
          </a>
        ))}
      </div>
    </div>
  </section>
);

const PYBannerCTA = () => (
  <section className="py-banner">
    <div className="py-container py-banner__inner">
      <div>
        <h2>Begin je <em>dagje weg</em> hier.</h2>
        <p>Vergelijk de dichtstbijzijnde garages en reserveer je plek in hetzelfde scherm.</p>
      </div>
      <PYButton href="#/garages" variant="aqua">Vind een parking</PYButton>
    </div>
  </section>
);

const PYFAQ = ({ compact = false }) => {
  const [open, setOpen] = React.useState(0);
  const faqs = compact ? PY_FAQS.slice(0, 3) : PY_FAQS;
  return (
    <section className="py-section py-section--paper">
      <div className="py-container py-faq">
        <PYSectionIntro title={'Veelgestelde vragen.'}>
          Kort, eerlijk, zonder kleine lettertjes. In dit prototype zijn de accordeons volledig interactief.
        </PYSectionIntro>
        <div className="py-faq__list">
          {faqs.map(([question, answer], index) => {
            const isOpen = open === index;
            return (
              <article key={question} className={isOpen ? 'is-open' : ''}>
                <button onClick={() => setOpen(isOpen ? -1 : index)}>
                  <span>{question}</span>
                  <PYIcon name="down" size={22} />
                </button>
                {isOpen && <p>{answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const PYSubscriptionsPage = () => {
  const [city, setCity] = React.useState('Alle steden');
  const [sent, setSent] = React.useState(false);
  const locations = PY_GARAGES.filter(g => g.subscriptions && (city === 'Alle steden' || g.city === city));

  return (
    <main>
      <section className="py-page-hero py-page-hero--subscriptions">
        <div className="py-container py-page-hero__grid">
          <div>
            <h1>Een vaste parkeerplek zonder dagelijks opnieuw te regelen.</h1>
            <p>Voor frequente parkeerders: kies een abonnementslocatie, vraag beschikbaarheid aan en parkeer flexibel met je toegangsmiddel.</p>
            <div className="py-action-row">
              <PYButton href="#abonnement-aanvragen" variant="primary">Bestel abonnement</PYButton>
              <PYButton href="#abonnement-info" variant="outline">Bekijk voorwaarden</PYButton>
            </div>
          </div>
          <div className="py-premium-panel">
            <span>Abonnement in het kort</span>
            <div><strong>3 maanden</strong><small>minimale periode</small></div>
            <div><strong>1 maand</strong><small>opzegtermijn daarna</small></div>
            <div><strong>Toegang</strong><small>pas, tag, handzender of kenteken</small></div>
          </div>
        </div>
      </section>
      <section id="abonnement-info" className="py-section">
        <div className="py-container py-info-bands">
          {[
            ['Start helder', 'Je abonnement loopt minimaal 3 maanden. Daarna kun je maandelijks opzeggen met 1 volle maand opzegtermijn.'],
            ['Toegang geregeld', 'Afhankelijk van de locatie krijg je een pas, tag, handzender of kentekentoegang voor soepel in- en uitrijden.'],
            ['Maandelijks gemak', 'De kosten worden maandelijks geincasseerd. Eenmalige aanvraagkosten worden vooraf duidelijk getoond.'],
          ].map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="py-section py-section--paper">
        <div className="py-container">
          <PYSectionIntro title={'Abonnementslocaties <em>per stad</em>.'}>
            Niet elke garage heeft dezelfde producten. Deze lijst toont waar abonnementen logisch thuishoren in de nieuwe informatiearchitectuur.
          </PYSectionIntro>
          <div className="py-toolbar">
            <div className="py-segments">
              {PY_CITIES.map(option => <button key={option} className={city === option ? 'is-active' : ''} onClick={() => setCity(option)}>{option}</button>)}
            </div>
          </div>
          <div className="py-garage-grid">
            {locations.map(garage => <PYGarageCard key={garage.id} garage={garage} />)}
          </div>
        </div>
      </section>
      <section id="abonnement-aanvragen" className="py-section">
        <div className="py-container py-form-split">
          <div>
            <h2>Vraag beschikbaarheid aan.</h2>
            <p>Een premium flow vraagt eerst de locatie en contactgegevens, daarna pas de contractdetails. Zo voelt het minder zwaar en blijft de drempel laag.</p>
          </div>
          <form className="py-contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {sent ? <div className="py-success-state py-success-state--compact"><span><PYIcon name="check" size={28} /></span><h2>Aanvraag klaar.</h2><p>Prototypebevestiging: het team neemt contact op over beschikbaarheid.</p></div> : (
              <>
                <label>Locatie<select required defaultValue=""><option value="" disabled>Kies abonnementslocatie</option>{PY_GARAGES.filter(g => g.subscriptions).map(g => <option key={g.id}>{g.city} - {g.name}</option>)}</select></label>
                <label>Naam<input required placeholder="Voor- en achternaam" /></label>
                <label>E-mail<input required placeholder="jij@voorbeeld.nl" /></label>
                <label>Gewenste startdatum<input required placeholder="Bijvoorbeeld 1 juni" /></label>
                <PYButton type="submit" variant="primary">Verstuur aanvraag</PYButton>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  );
};

const PYParkingPassPage = () => {
  const [amount, setAmount] = React.useState('10');
  const [done, setDone] = React.useState(false);
  const passLocations = PY_GARAGES.filter(g => g.pass);

  return (
    <main>
      <section className="py-pass-hero">
        <div className="py-container py-pass-hero__grid">
          <div>
            <h1>ParkingPass voor wie vaak parkeert, maar niet vast wil zitten.</h1>
            <p>Kies 10 of 25 parkeeracties, ontvang je code per e-mail en gebruik hem bij deelnemende ParkingYou-locaties.</p>
            <div className="py-pass-toggle" role="group" aria-label="Aantal parkeeracties">
              {['10', '25'].map(value => <button type="button" key={value} className={amount === value ? 'is-active' : ''} onClick={() => setAmount(value)}>{value}x parkeren</button>)}
            </div>
          </div>
          <div className="py-pass-card">
            <span>ParkingPass</span>
            <strong>{amount}x</strong>
            <small>flexibel parkeren</small>
            <p>Code per e-mail - online reserveren - locatiegebonden voorwaarden.</p>
          </div>
        </div>
      </section>
      <section className="py-section">
        <div className="py-container py-info-bands">
          {[
            ['Voordeliger dan losse tickets', 'Bespaar per parkeeractie wanneer je vaker dezelfde steden bezoekt.'],
            ['Flexibel in gebruik', 'Geen vast maandcontract: gebruik je strippen wanneer het jou uitkomt.'],
            ['Eenvoudig online bestellen', 'Betaal veilig online en ontvang je unieke ParkingPass-code in je inbox.'],
          ].map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="py-section py-section--paper">
        <div className="py-container py-pass-flow">
          <PYSectionIntro title={'Hoe het <em>werkt</em>.'}>
            De huidige uitleg wordt in de redesign-flow verdeeld over duidelijke stappen en een ordermodule.
          </PYSectionIntro>
          {[
            ['01', 'Bestel online', 'Kies locatie, 10 of 25 parkeeracties en betaal veilig.'],
            ['02', 'Ontvang je code', 'Je ParkingPass-code komt direct per e-mail binnen.'],
            ['03', 'Reserveer met code', 'Gebruik de code bij je reservering. Je kenteken opent de slagboom.'],
          ].map(([n, title, body]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section className="py-section">
        <div className="py-container py-form-split">
          <div>
            <h2>Bestel je ParkingPass.</h2>
            <p>Beschikbaar voor geselecteerde locaties in Eindhoven, Amsterdam, Rotterdam en Rijswijk. Sommige passen hebben weekendvoorwaarden per locatie.</p>
            <div className="py-card-tags">{passLocations.map(g => <PYTag key={g.id}>{g.city} - {g.name}</PYTag>)}</div>
          </div>
          <form className="py-contact-form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            {done ? <div className="py-success-state py-success-state--compact"><span><PYIcon name="check" size={28} /></span><h2>ParkingPass besteld.</h2><p>Prototypebevestiging: de klant ontvangt de code per e-mail.</p></div> : (
              <>
                <label>Locatie<select required defaultValue=""><option value="" disabled>Kies locatie</option>{passLocations.map(g => <option key={g.id}>{g.city} - {g.name}</option>)}</select></label>
                <label>Aantal<select value={amount} onChange={e => setAmount(e.target.value)}><option value="10">10 parkeeracties</option><option value="25">25 parkeeracties</option></select></label>
                <label>Voornaam<input required placeholder="Voornaam" /></label>
                <label>Achternaam<input required placeholder="Achternaam" /></label>
                <label>E-mail<input required placeholder="jij@voorbeeld.nl" /></label>
                <PYButton type="submit" variant="primary">Bestel nu</PYButton>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  );
};

const PYAboutPage = () => (
  <main>
    <section className="py-page-hero py-page-hero--about">
      <div className="py-container py-page-hero__grid">
        <div>
          <h1>Wij maken centrale parkeerplekken toegankelijker.</h1>
          <p>Jaarlijks gebruiken meer dan 500.000 parkeerders ParkingYou-locaties. Voor bezoekers betekent dat voordelig en centraal parkeren; voor opdrachtgevers beter beheer en exploitatie.</p>
          <div className="py-action-row">
            <PYButton href="#/garages" variant="primary">Reserveer direct</PYButton>
            <PYButton href="#/zakelijk" variant="outline">Zakelijk samenwerken</PYButton>
          </div>
        </div>
        <div className="py-about-metrics">
          <div><strong>500k+</strong><span>parkeerders per jaar</span></div>
          <div><strong>40+</strong><span>locaties en terreinen</span></div>
          <div><strong>2</strong><span>werelden: bezoekers en beheerders</span></div>
        </div>
      </div>
    </section>
    <section className="py-section">
      <div className="py-container py-story-grid">
        <article><h2>ParkingYou for You.</h2><p>Via website en app reserveer je tegen voordelige tarieven, ook tijdens evenementen en drukke dagen. Zo geven we ruimte terug aan de stad en voorkomen we onnodig zoekverkeer.</p><PYButton href="#/garages" variant="outline">Bekijk locaties</PYButton></article>
        <article><h2>ParkingYou voor opdrachtgevers.</h2><p>We werken samen met parkeervastgoedeigenaren en maken garages beter vindbaar, boekbaar en beheersbaar. Een win-win voor consument en eigenaar.</p><PYButton href="#/zakelijk" variant="outline">Bekijk dienstverlening</PYButton></article>
      </div>
    </section>
    <PYBenefits />
  </main>
);

const PYWaardekaartWizard = () => {
  const [step, setStep] = React.useState(1);
  const [amount, setAmount] = React.useState('100');
  const [qty, setQty] = React.useState(1);
  const [company, setCompany] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);

  const total = (Number(amount) * qty).toFixed(2);

  return (
    <div className="py-waarde-wizard">
      <div className="py-waarde-wizard__steps">
        {['Keuze', 'Gegevens', 'Bevestiging'].map((label, i) => (
          <span key={label} className={step === i + 1 ? 'is-active' : step > i + 1 ? 'is-done' : ''}>
            <i>{step > i + 1 ? <PYIcon name="check" size={13} /> : i + 1}</i>{label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3>Kies het tegoed per kaart.</h3>
          <div className="py-waarde-amounts">
            {['25', '50', '100', '200', '500'].map(v => (
              <button key={v} type="button" className={amount === v ? 'is-active' : ''} onClick={() => setAmount(v)}>
                € {v}
              </button>
            ))}
          </div>
          <label className="py-wizard-field" style={{ marginTop: 20 }}>
            Aantal kaarten
            <div className="py-qty-picker">
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>–</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </label>
          <div className="py-waarde-total-row">
            <span>Totaal</span>
            <strong>€ {total}</strong>
          </div>
          <PYButton onClick={() => setStep(2)} variant="primary">Ga naar gegevens</PYButton>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); setDone(true); }}>
          <h3>Bedrijfsgegevens.</h3>
          <label className="py-wizard-field">Bedrijfsnaam<input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Bedrijfsnaam B.V." /></label>
          <label className="py-wizard-field">Contactpersoon<input required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Voor- en achternaam" /></label>
          <label className="py-wizard-field">E-mailadres<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jij@bedrijf.nl" /></label>
          <label className="py-wizard-field">KvK-nummer<input placeholder="12345678" /></label>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <PYButton type="button" variant="outline" icon="x" onClick={() => setStep(1)}>Terug</PYButton>
            <PYButton type="submit" variant="primary">Naar bevestiging</PYButton>
          </div>
        </form>
      )}

      {step === 3 && done && (
        <div className="py-inline-success py-inline-success--large">
          <PYIcon name="check" size={28} />
          <div>
            <strong>Bestelling ontvangen!</strong>
            <p>{qty}x Waardekaart van € {amount} – totaal € {total}.<br />Factuur en kaartgegevens worden gestuurd naar {email}.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PYBusinessPage = () => (
  <main>
    <section className="py-page-hero py-page-hero--business">
      <div className="py-container py-page-hero__grid">
        <div>
          <h1>Maak van je parkeergarage een digitaal product.</h1>
          <p>Voor eigenaren en beheerders: combineer reserveringen, dagkaarten, service en bezettingsinzichten onder een merk dat klanten begrijpen.</p>
          <div className="py-action-row">
            <PYButton href="#zakelijk-contact" variant="primary">Plan kennismaking</PYButton>
            <PYButton href="#zakelijk-waardekaart" variant="aqua" icon="wallet">Waardekaarten bestellen</PYButton>
          </div>
        </div>
        <div className="py-business-panel">
          <div className="py-business-panel__top"><span>Live bezetting</span><strong>83%</strong></div>
          <div className="py-bars">{[44, 62, 78, 84, 71, 56, 38].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
          <div className="py-business-panel__rows">
            <span><PYIcon name="check" size={16} /> Dagkaart campagne actief</span>
            <span><PYIcon name="check" size={16} /> 18 reserveringen vandaag</span>
            <span><PYIcon name="check" size={16} /> Service SLA gehaald</span>
          </div>
        </div>
      </div>
    </section>
    <PYBenefits />
    <section className="py-section py-section--paper">
      <div className="py-container py-partner-grid">
        {[
          ['Exploitatie', 'Zet lege daluren om in boekbare dagkaarten en meet resultaat per campagne.'],
          ['Service', 'Bundel storingsmeldingen, locatie-informatie en contactkanalen in een consistente ervaring.'],
          ['Merk', 'Laat elke garage voelen als onderdeel van ParkingYou, zonder de lokale context kwijt te raken.'],
        ].map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
      </div>
    </section>

    {/* Waardekaarten sectie */}
    <section id="zakelijk-waardekaart" className="py-section">
      <div className="py-container py-form-split">
        <div>
          <h2>Waardekaarten voor zakelijk gebruik.</h2>
          <p>Geef medewerkers, klanten of relaties een ParkingYou Waardekaart. Laad het tegoed vooraf op en gebruik het bij alle deelnemende locaties. Ideaal als bedrijfscadeau of personeelsbenefit.</p>
          <div className="py-info-bands" style={{ marginTop: 28 }}>
            {[
              ['Flexibel in gebruik', 'Geldig bij alle deelnemende ParkingYou-locaties in Nederland.'],
              ['Zakelijke factuur', 'Ontvang een factuur per bestelling, inclusief BTW-specificatie.'],
            ].map(([title, body]) => (
              <article key={title} style={{ padding: '20px 22px' }}>
                <h3 style={{ marginBottom: 6 }}>{title}</h3>
                <p style={{ margin: 0, color: 'var(--py-muted)', lineHeight: 1.55, fontWeight: 300 }}>{body}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <PYWaardekaartWizard />
        </div>
      </div>
    </section>

    {/* Contact */}
    <section id="zakelijk-contact" className="py-section py-section--paper">
      <div className="py-container py-form-split">
        <div>
          <h2>Plan een kennismaking.</h2>
          <p>Wil je weten wat ParkingYou voor jouw locatie kan betekenen? Laat je gegevens achter en we nemen binnen één werkdag contact op.</p>
        </div>
        <PYBusinessContactForm />
      </div>
    </section>
  </main>
);

const PYBusinessContactForm = () => {
  const [sent, setSent] = React.useState(false);
  return (
    <form className="py-contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      {sent ? (
        <div className="py-success-state py-success-state--compact">
          <span><PYIcon name="check" size={28} /></span>
          <h2>Aanvraag ontvangen.</h2>
          <p>We nemen binnen één werkdag contact op.</p>
        </div>
      ) : (
        <>
          <label>Bedrijfsnaam<input required placeholder="Bedrijfsnaam" /></label>
          <label>Naam<input required placeholder="Voor- en achternaam" /></label>
          <label>E-mail<input required placeholder="jij@bedrijf.nl" /></label>
          <label>Telefoonnummer<input placeholder="06 12 34 56 78" /></label>
          <label>Locatie / garage<input placeholder="Naam of adres van de locatie" /></label>
          <label>Bericht<textarea placeholder="Vertel kort wat je zoekt..." /></label>
          <PYButton type="submit" variant="primary">Verstuur aanvraag</PYButton>
        </>
      )}
    </form>
  );
};

const PYGlowPage = () => {
  const [ticket, setTicket] = React.useState('weekend');
  const [done, setDone] = React.useState(false);
  return (
    <main>
      <section className="py-glow-hero">
        <div className="py-container py-glow-hero__grid">
          <div>
            <h1>Parkeer slim voor GLOW Eindhoven.</h1>
            <p>Voor een druk lichtfestival wil de bezoeker maar drie dingen weten: waar parkeer ik, welk ticket past bij mijn bezoek en hoe zeker is mijn plek?</p>
            <PYButton href="#glow-tickets" variant="aqua">Reserveer GLOW-ticket</PYButton>
          </div>
          <div className="py-glow-orbit"><span>GLOW</span><strong>vanaf EUR 15</strong><small>dag of avond parkeren</small></div>
        </div>
      </section>
      <section className="py-section">
        <div className="py-container py-info-bands">
          {[
            ['Officiele parkeerpartner', 'Parkeerlocaties op loopafstand of direct langs de route van GLOW.'],
            ['Vooraf zekerheid', 'Reserveer snel en voorkom zoeken tijdens drukke festivalavonden.'],
            ['Duidelijke ticketkeuze', 'Weekend dagparkeren of doordeweeks avondparkeren na 18:00 uur.'],
          ].map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>
      <section id="glow-tickets" className="py-section py-section--paper">
        <div className="py-container py-form-split">
          <div>
            <h2>Kies je GLOW-parkeerticket.</h2>
            <p>De campagnepagina krijgt een compacte bookingmodule in plaats van losse blokken. Zo blijft de conversie duidelijk op mobiel en desktop.</p>
            <div className="py-pass-toggle">
              <button type="button" className={ticket === 'weekend' ? 'is-active' : ''} onClick={() => setTicket('weekend')}>Weekend dag</button>
              <button type="button" className={ticket === 'avond' ? 'is-active' : ''} onClick={() => setTicket('avond')}>Avond na 18:00</button>
            </div>
          </div>
          <form className="py-contact-form py-glow-form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            {done ? <div className="py-success-state py-success-state--compact"><span><PYIcon name="check" size={28} /></span><h2>GLOW-ticket gereserveerd.</h2><p>Prototypebevestiging: de bezoeker ontvangt route en kentekeninstructies.</p></div> : (
              <>
                <div className="py-ticket-summary"><span>{ticket === 'weekend' ? 'GLOW weekend dag parkeren' : 'GLOW avond parkeren'}</span><strong>vanaf EUR 15</strong></div>
                <label>Datum<select required defaultValue=""><option value="" disabled>Kies datum</option><option>Vrijdagavond</option><option>Zaterdag</option><option>Zondag</option></select></label>
                <label>Kenteken<input required placeholder="AB-123-C" /></label>
                <label>E-mail<input required placeholder="jij@voorbeeld.nl" /></label>
                <PYButton type="submit" variant="primary">Reserveer nu</PYButton>
              </>
            )}
          </form>
        </div>
      </section>
      <section className="py-section">
        <div className="py-container py-newsletter-band">
          <div><h2>Blijf op de hoogte van evenementen.</h2><p>Ontvang parkeertips en toekomstige acties, inclusief korting op je volgende parkeerplek.</p></div>
          <form onSubmit={(e) => e.preventDefault()}><input placeholder="E-mailadres" /><PYButton type="submit" variant="primary">Inschrijven</PYButton></form>
        </div>
      </section>
    </main>
  );
};

const PYSupportPage = () => {
  const [sent, setSent] = React.useState(false);
  return (
    <main>
      <section className="py-page-hero py-page-hero--support">
        <div className="py-container py-page-hero__grid">
          <div>
            <h1>Hulp nodig bij parkeren?</h1>
            <p>Bel direct bij storingen of stuur een bericht. Het formulier toont een werkende prototype-state.</p>
            <div className="py-support-cards">
              <a href="tel:0854011647"><PYIcon name="phone" size={22} /> 085 4011647</a>
              <a href="mailto:info@parkingyou.nl"><PYIcon name="card" size={22} /> info@parkingyou.nl</a>
            </div>
          </div>
          <form className="py-contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            {sent ? (
              <div className="py-success-state py-success-state--compact">
                <span><PYIcon name="check" size={28} /></span>
                <h2>Bericht ontvangen.</h2>
                <p>Dit is de bevestigingsstate van het prototype.</p>
              </div>
            ) : (
              <>
                <label>Naam<input required placeholder="Je naam" /></label>
                <label>E-mail<input required placeholder="jij@voorbeeld.nl" /></label>
                <label>Locatie<select defaultValue=""><option value="" disabled>Kies locatie</option>{PY_GARAGES.map(g => <option key={g.id}>{g.name}</option>)}</select></label>
                <label>Vraag<textarea required placeholder="Waar kunnen we mee helpen?" /></label>
                <PYButton type="submit" variant="primary">Verstuur</PYButton>
              </>
            )}
          </form>
        </div>
      </section>
      <PYFAQ />
    </main>
  );
};

const PYFooter = () => (
  <footer className="py-footer">
    <div className="py-container py-footer__grid">
      <div>
        <PYLogo inverted />
        <p>ParkingYou is de no-nonsense challenger op de parkeermarkt: digitaal waar het kan, menselijk wanneer het moet.</p>
      </div>
      {[
        ['Parkeren', [['Vind een garage', '#/garages'], ['Reserveer nu', '#/reserveren'], ['Evenementen', '#/evenementen'], ['App', '#/app']]],
        ['Producten', [['Abonnementen', '#/abonnementen'], ['ParkingPass', '#/parkingpass'], ['Waardekaarten', '#/zakelijk'], ['GLOW', '#/campagnes/glow']]],
        ['Account', [['Mijn dashboard', '#/dashboard'], ['Over ons', '#/over'], ['Zakelijk', '#/zakelijk'], ['Support', '#/support']]],
      ].map(([title, links]) => (
        <nav key={title}>
          <strong>{title}</strong>
          {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
      ))}
    </div>
    <div className="py-container py-footer__bottom">
      <span>ParkingYou {new Date().getFullYear()} - The other way of parking.</span>
      <span>High fidelity rebranding prototype</span>
    </div>
  </footer>
);

Object.assign(window, {
  PYProductChooser,
  PYHowItWorks,
  PYBenefits,
  PYCityStrip,
  PYBannerCTA,
  PYFAQ,
  PYSubscriptionsPage,
  PYParkingPassPage,
  PYAboutPage,
  PYBusinessPage,
  PYBusinessContactForm,
  PYWaardekaartWizard,
  PYGlowPage,
  PYSupportPage,
  PYFooter,
});
