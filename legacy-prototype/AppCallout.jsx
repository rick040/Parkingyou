const PYPhoneMockup = ({ mode = 'map' }) => (
  <div className="py-phone">
    <div className="py-phone__screen">
      <div className="py-phone__map">
        <PYMiniMap compact />
      </div>
      <div className="py-phone__search"><PYIcon name="search" size={16} /> Waar parkeer je?</div>
      <div className="py-phone__sheet">
        <span>Beste keuze</span>
        <strong>{mode === 'business' ? 'Bezetting live' : 'Parking Stadskantoor'}</strong>
        <small>{mode === 'business' ? '83% vol - piek om 14:00' : '1 min lopen - vanaf EUR 2,55'}</small>
        <button>Reserveer</button>
      </div>
    </div>
  </div>
);

const PYAppCallout = () => (
  <section className="py-app-callout">
    <div className="py-container py-app-callout__grid">
      <div>
        <h2>Makkelijk parkeren <em>vanuit je broekzak.</em></h2>
        <p>De ParkingYou-app maakt parkeren voorspelbaar: plek vinden, reserveren, betalen en later je bewijs terugvinden.</p>
        <div className="py-feature-list">
          {[
            ['pin', 'Vind direct de dichtstbijzijnde garage'],
            ['card', 'Betaal vooraf of bij vertrek'],
            ['clock', 'Geen wachten bij ticketautomaten'],
          ].map(([icon, text]) => (
            <div key={text}><span><PYIcon name={icon} size={21} /></span>{text}</div>
          ))}
        </div>
        <div className="py-action-row">
          <PYButton href="#/app" variant="aqua">Bekijk de app</PYButton>
          <PYButton href="#/garages" variant="on-dark">Reserveer online</PYButton>
        </div>
      </div>
      <PYPhoneMockup />
    </div>
  </section>
);

const PYAppPage = () => (
  <main>
    <section className="py-page-hero py-page-hero--app">
      <div className="py-container py-page-hero__grid">
        <div>
          <h1>Alle parkeerzaken in een app.</h1>
          <p>Een high fidelity prototype van de app-story: zoeken, reserveren, betalen en service bij de hand.</p>
          <div className="py-action-row">
            <PYButton href="#/garages" variant="primary">Reserveer een demo</PYButton>
            <PYButton href="#/support" variant="outline" icon="phone">Support</PYButton>
          </div>
        </div>
        <PYPhoneMockup />
      </div>
    </section>
    <section className="py-section">
      <div className="py-container py-app-feature-grid">
        {[
          ['search', 'Slim zoeken', 'Typ een stad of adres en vergelijk plekken op prijs, afstand en openingstijd.'],
          ['card', 'Betalen zonder gedoe', 'Betaal digitaal en vind je betaalbewijs later terug in je account.'],
          ['shield', 'Service bij storing', 'Een vaste serviceknop maakt hulp vragen sneller wanneer een slagboom of betaalpaal hapert.'],
          ['bolt', 'EV en events', 'Toon laadpunten, evenemententarieven en dagkaarten waar ze beschikbaar zijn.'],
        ].map(([icon, title, body]) => (
          <article key={title}>
            <span><PYIcon name={icon} size={24} /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
    <section className="py-section py-section--paper">
      <div className="py-container py-timeline">
        <PYSectionIntro title={'Van zoeken naar <em>uitrijden</em>.'}>
          De interactie is bewust compact gehouden: klanten zien alleen wat ze nodig hebben om vertrouwen te krijgen.
        </PYSectionIntro>
        {[
          ['01', 'Kies garage', 'Beschikbaarheid en dagprijs staan direct naast elkaar.'],
          ['02', 'Voeg kenteken toe', 'Kentekenherkenning wordt de standaardflow.'],
          ['03', 'Betaal en rij', 'De bevestiging bevat route, QR en serviceknop.'],
        ].map(([n, title, body]) => (
          <div key={n} className="py-timeline__item">
            <span>{n}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  </main>
);

Object.assign(window, { PYPhoneMockup, PYAppCallout, PYAppPage });
