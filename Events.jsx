const PYEventCard = ({ event }) => (
  <article className="py-event-card">
    <a href={`#/evenementen/${event.id}`} className="py-event-card__image">
      <img src={event.image} alt={event.name} />
      <span className={`py-event-type py-event-type--${event.typeColor}`}>{event.type}</span>
      <span className="py-event-card__city"><PYIcon name="pin" size={14} /> {event.city}</span>
    </a>
    <div className="py-event-card__body">
      <h3>{event.name}</h3>
      <p>{event.tagline}</p>
      <div className="py-event-card__meta">
        <span><PYIcon name="calendar" size={15} /> {event.dates}</span>
        <span><PYIcon name="car" size={15} /> {event.garageIds?.length} locatie{event.garageIds?.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="py-event-card__footer">
        <span className="py-event-price">Vanaf <strong>€ {event.price}</strong></span>
        <PYButton href={`#/evenementen/${event.id}`} variant="outline">Parkeerticket</PYButton>
      </div>
    </div>
  </article>
);

const PYEventsPage = () => {
  const [filterCity, setFilterCity] = React.useState('Alle steden');
  const [filterType, setFilterType] = React.useState('Alle types');
  const [alertSubmitted, setAlertSubmitted] = React.useState(false);

  const types = ['Alle types', ...Array.from(new Set(PY_EVENTS.map(e => e.type)))];
  const cities = ['Alle steden', ...Array.from(new Set(PY_EVENTS.map(e => e.city)))];

  const filtered = PY_EVENTS.filter(e =>
    (filterCity === 'Alle steden' || e.city === filterCity) &&
    (filterType === 'Alle types' || e.type === filterType)
  );

  return (
    <main>
      <section className="py-page-hero py-page-hero--events">
        <div className="py-container py-page-hero__grid">
          <div>
            <h1>Parkeer slim bij evenementen.</h1>
            <p>Van lichtfestivals tot voetbalwedstrijden: ParkingYou is officieel parkeerpartner bij tientallen evenementen. Reserveer vooraf en skip de wachtrij.</p>
            <div className="py-action-row">
              <PYButton href="#evenementen-grid" variant="primary">Bekijk evenementen</PYButton>
              <PYButton href="#/garages" variant="outline">Alle locaties</PYButton>
            </div>
          </div>
          <div className="py-events-hero-visual">
            {PY_EVENTS.slice(0, 3).map((event, i) => (
              <div key={event.id} className={`py-event-thumb py-event-thumb--${i + 1}`}>
                <img src={event.image} alt={event.name} />
                <span className={`py-event-type py-event-type--${event.typeColor}`}>{event.type}</span>
                <strong>{event.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section py-section--paper">
        <div className="py-container py-info-bands">
          {[
            ['Gegarandeerde plek', 'Reserveer vooraf en rij met vertrouwen naar het evenement. Geen rondje zoeken.'],
            ['Officiele parkeerpartner', 'Locaties op loopafstand of langs de looproute, geselecteerd per evenement.'],
            ['Altijd scherp geprijsd', 'Speciale evenementtarieven zijn vaak voordeliger dan parkeren ter plekke.'],
          ].map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section id="evenementen-grid" className="py-section">
        <div className="py-container">
          <PYSectionIntro title={'Aankomende <em>evenementen</em>.'}>
            Filter op stad of type evenement en reserveer direct je parkeerticket.
          </PYSectionIntro>
          <div className="py-toolbar">
            <div className="py-toolbar__left">
              <div className="py-segments">
                {cities.map(c => (
                  <button key={c} className={filterCity === c ? 'is-active' : ''} onClick={() => setFilterCity(c)}>{c}</button>
                ))}
              </div>
              <div className="py-segments">
                {types.map(t => (
                  <button key={t} className={filterType === t ? 'is-active' : ''} onClick={() => setFilterType(t)}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="py-results-line">{filtered.length} evenementen gevonden</div>
          <div className="py-event-grid">
            {filtered.map(event => <PYEventCard key={event.id} event={event} />)}
          </div>
        </div>
      </section>

      <section className="py-banner">
        <div className="py-container py-banner__inner">
          <div>
            <h2>Evenement op de planning?</h2>
            <p>Schrijf je in voor onze evenementenalert en ontvang parkeerdeals voordat ze uitverkocht zijn.</p>
          </div>
          {alertSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: 'rgba(255,255,255,0.12)', borderRadius: 999, color: 'white' }}>
              <PYIcon name="check" size={18} /> Alert ingesteld! We houden je op de hoogte.
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setAlertSubmitted(true); }} style={{ display: 'flex', gap: 10 }}>
              <input required style={{ padding: '13px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: 'white', minWidth: 240 }} placeholder="jij@voorbeeld.nl" />
              <PYButton type="submit" variant="aqua">Alert instellen</PYButton>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

const PYEventDetailPage = ({ id }) => {
  const event = PY_EVENTS.find(e => e.id === id) || PY_EVENTS[0];
  const [ticket, setTicket] = React.useState(event.ticketTypes?.[0]?.id || '');
  const [date, setDate] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = React.useState(false);

  const eventGarages = PY_GARAGES.filter(g => event.garageIds?.includes(g.id));
  const selectedTicket = event.ticketTypes?.find(t => t.id === ticket);

  return (
    <main>
      <section className={`py-event-hero py-event-hero--${event.typeColor}`}>
        <div className="py-container py-event-hero__grid">
          <div>
            <a href="#/evenementen" className="py-back-link" style={{ color: 'rgba(255,255,255,0.7)' }}>← Alle evenementen</a>
            <div className="py-event-hero__badges">
              <span className={`py-event-type py-event-type--${event.typeColor}`}>{event.type}</span>
              <span className="py-event-hero__city"><PYIcon name="pin" size={14} /> {event.city}</span>
            </div>
            <h1>{event.name}</h1>
            <p>{event.description}</p>
            <ul className="py-event-highlights">
              {event.highlights?.map(h => (
                <li key={h}><PYIcon name="check" size={16} /> {h}</li>
              ))}
            </ul>
            <div className="py-action-row">
              <PYButton href="#event-tickets" variant="aqua">Bestel parkeerticket</PYButton>
            </div>
          </div>
          <div className="py-event-hero__visual">
            <div className="py-event-orbit">
              <img src={event.image} alt={event.name} />
              <div className="py-event-orbit__badge">
                <span>{event.type}</span>
                <strong>Vanaf € {event.price}</strong>
                <small>{event.dates}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beschikbare parkeerlocaties */}
      <section className="py-section py-section--paper">
        <div className="py-container">
          <PYSectionIntro title={'Parkeerlocaties <em>bij dit evenement</em>.'}>
            Kies de locatie die het beste past bij jouw route. Reserveer hieronder direct.
          </PYSectionIntro>
          <div className="py-garage-grid">
            {eventGarages.map(g => <PYGarageCard key={g.id} garage={g} />)}
          </div>
        </div>
      </section>

      {/* Ticket boekingsformulier */}
      <section id="event-tickets" className="py-section">
        <div className="py-container py-form-split">
          <div>
            <h2>Kies je parkeerticket.</h2>
            <p>Selecteer het type ticket dat past bij je bezoek. Betaal veilig online en ontvang de bevestiging per e-mail.</p>
            <div className="py-event-ticket-toggle">
              {event.ticketTypes?.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={ticket === t.id ? 'is-active' : ''}
                  onClick={() => setTicket(t.id)}
                >
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                  <em>€ {t.price}</em>
                </button>
              ))}
            </div>
            {selectedTicket && (
              <div className="py-pricing-tip" style={{ marginTop: 20 }}>
                <PYIcon name="info" size={18} color={PY_BLUE} />
                <div>
                  <strong>Gereserveerd = zekerheid</strong>
                  <p>Door vooraf te reserveren garandeer je jouw plek, ook tijdens uitverkochte evenementen.</p>
                </div>
              </div>
            )}
          </div>
          <form className="py-contact-form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            {done ? (
              <div className="py-success-state py-success-state--compact">
                <span><PYIcon name="check" size={28} /></span>
                <h2>Parkeerticket gereserveerd!</h2>
                <p>Je ontvangt de bevestiging en kentekeninstructies per e-mail.</p>
                <PYButton href="#/evenementen" variant="primary">Meer evenementen</PYButton>
              </div>
            ) : (
              <>
                <div className="py-ticket-summary">
                  <span>{selectedTicket?.name || 'Selecteer een ticket'}</span>
                  <strong>{selectedTicket ? `€ ${selectedTicket.price}` : '–'}</strong>
                </div>
                <label>Datum
                  <select required value={date} onChange={e => setDate(e.target.value)}>
                    <option value="" disabled>Kies een datum</option>
                    {event.dateOptions?.map(d => <option key={d}>{d}</option>)}
                  </select>
                </label>
                <label>Parkeerlocatie
                  <select required defaultValue="">
                    <option value="" disabled>Kies locatie</option>
                    {eventGarages.map(g => <option key={g.id}>{g.name} – {g.city}</option>)}
                  </select>
                </label>
                <label>Kenteken<input required placeholder="AB-123-C" /></label>
                <label>E-mailadres<input required placeholder="jij@voorbeeld.nl" /></label>
                <PYButton type="submit" variant="primary">Reserveer parkeerticket</PYButton>
              </>
            )}
          </form>
        </div>
      </section>

      {/* Nieuwsbrief band */}
      <section className="py-section py-section--paper">
        <div className="py-container py-newsletter-band">
          <div>
            <h2>Mis geen enkel evenement meer.</h2>
            <p>Ontvang parkeertips en vroegboekaanbiedingen voor toekomstige evenementen in jouw stad.</p>
          </div>
{newsletterSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: 'var(--py-aqua)', borderRadius: 999, color: 'var(--py-blue)', fontWeight: 700 }}>
              <PYIcon name="check" size={18} /> Ingeschreven! Je ontvangt onze updates.
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setNewsletterSubmitted(true); }}>
              <input required placeholder="E-mailadres" />
              <PYButton type="submit" variant="primary">Inschrijven</PYButton>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

Object.assign(window, { PYEventsPage, PYEventDetailPage, PYEventCard });
