const PYGarageCard = ({ garage, featured = false }) => (
  <article className={`py-garage-card ${featured ? 'py-garage-card--featured' : ''}`}>
    <a href={`#/garages/${garage.id}`} className="py-garage-card__image">
      <img src={garage.image} alt={garage.name} />
      <span className="py-garage-card__city"><PYIcon name="pin" size={15} /> {garage.city}</span>
      <PYPriceBlob price={garage.dayPrice} unit="per dag" tone={featured ? 'orange' : 'aqua'} />
    </a>
    <div className="py-garage-card__body">
      <div className="py-garage-card__title">
        <div>
          <h3>{garage.name}</h3>
          <p>{garage.address}</p>
        </div>
        <span>{garage.rating}</span>
      </div>
      <div className="py-card-tags">
        {garage.tags.map(tag => <PYTag key={tag}>{tag}</PYTag>)}
      </div>
      <div className="py-garage-card__meta">
        <span><PYIcon name="clock" size={16} /> {garage.distance}</span>
        <span><PYIcon name="car" size={16} /> {garage.spaces} plekken</span>
      </div>
      <PYButton href={`#/garages/${garage.id}`} variant="outline">Bekijk en reserveer</PYButton>
    </div>
  </article>
);

const PYReservationDrawer = ({ garage, onClose }) => {
  const [step, setStep] = React.useState('form');
  const [plate, setPlate] = React.useState('');
  const [email, setEmail] = React.useState('');

  if (!garage) return null;

  return (
    <div className="py-drawer" role="dialog" aria-modal="true" aria-label="Reserveren">
      <button className="py-drawer__backdrop" onClick={onClose} aria-label="Sluiten" />
      <div className="py-drawer__panel">
        <button className="py-drawer__close" onClick={onClose} aria-label="Sluiten"><PYIcon name="x" size={22} /></button>
        {step === 'done' ? (
          <div className="py-success-state">
            <span><PYIcon name="check" size={32} /></span>
            <h2>Je plek staat klaar.</h2>
            <p>We hebben een demo-bevestiging gemaakt voor {garage.name}. In het echte product ontvangt de klant hier de QR en kentekeninstructies.</p>
            <PYButton href="#/garages" variant="primary" onClick={onClose}>Terug naar garages</PYButton>
          </div>
        ) : (
          <>
            <img src={garage.image} alt="" className="py-drawer__image" />
            <h2>Reserveer {garage.name}</h2>
            <p>{garage.address}, {garage.city}</p>
            <div className="py-booking-summary">
              <div><span>Vandaag</span><strong>09:00 - 17:00</strong></div>
              <div><span>Dagprijs</span><strong>EUR {garage.dayPrice}</strong></div>
              <div><span>Service</span><strong>24/7 bereikbaar</strong></div>
            </div>
            <form className="py-booking-form" onSubmit={(e) => { e.preventDefault(); setStep('done'); }}>
              <label>Kenteken<input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="AB-123-C" required /></label>
              <label>E-mailadres<input value={email} onChange={e => setEmail(e.target.value)} placeholder="jij@voorbeeld.nl" required /></label>
              <PYButton type="submit" variant="primary">Bevestig reservering</PYButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const PYGarages = ({ limit = 3 }) => {
  const shown = PY_GARAGES.slice(0, limit);
  return (
    <section className="py-section py-section--paper">
      <div className="py-container">
        <PYSectionIntro
          title={'Onze <em>favoriete</em> garages.'}
          action={<PYButton href="#/garages" variant="ghost">Bekijk alle locaties</PYButton>}
        >
          Een handvol parkings waar klanten vaak terugkomen: scherp geprijsd, digitaal en midden in de stad.
        </PYSectionIntro>
        <div className="py-garage-grid">
          {shown.map((garage, index) => <PYGarageCard key={garage.id} garage={garage} featured={index === 0} />)}
        </div>
      </div>
    </section>
  );
};

const PYGaragesPage = ({ queryCity = '' }) => {
  const cleanCity = decodeURIComponent(queryCity || '').replace(/\+/g, ' ');
  const [city, setCity] = React.useState(PY_CITIES.includes(cleanCity) ? cleanCity : 'Alle steden');
  const [sort, setSort] = React.useState('recommended');

  let filtered = city === 'Alle steden' ? PY_GARAGES : PY_GARAGES.filter(g => g.city === city);
  filtered = [...filtered].sort((a, b) => sort === 'price' ? a.price - b.price : b.rating.localeCompare(a.rating));

  return (
    <main>
      <section className="py-page-hero py-page-hero--garages">
        <div className="py-container py-page-hero__grid">
          <div>
            <h1>Vind je parking. Reserveer in minuten.</h1>
            <p>Filter op stad, prijs en afstand. Dit prototype laat de volledige flow zien: zoeken, vergelijken en reserveren.</p>
            <PYSearchPanel compact initialCity={city === 'Alle steden' ? '' : city} onSearch={({ city: value }) => setCity(PY_CITIES.includes(value) ? value : 'Alle steden')} />
          </div>
          <PYMiniMap />
        </div>
      </section>
      <section className="py-section">
        <div className="py-container">
          <div className="py-toolbar">
            <div className="py-segments">
              {PY_CITIES.map(option => (
                <button key={option} className={city === option ? 'is-active' : ''} onClick={() => setCity(option)}>{option}</button>
              ))}
            </div>
            <label className="py-select">
              Sorteer
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="recommended">Aanbevolen</option>
                <option value="price">Laagste prijs</option>
              </select>
            </label>
          </div>
          <div className="py-results-line">{filtered.length} garages gevonden {city !== 'Alle steden' && `in ${city}`}</div>
          <div className="py-garage-grid py-garage-grid--wide">
            {filtered.map((garage, index) => <PYGarageCard key={garage.id} garage={garage} featured={index === 0} />)}
          </div>
        </div>
      </section>
    </main>
  );
};

const PYFacilityIcon = ({ name }) => {
  if (name.startsWith('Laadpalen')) return <PYIcon name="ev" size={18} />;
  if (name.startsWith('Lift')) return <PYIcon name="elevator" size={18} />;
  if (name.startsWith('Camera')) return <PYIcon name="camera" size={18} />;
  if (name.startsWith('Bewaking')) return <PYIcon name="shield" size={18} />;
  if (name.startsWith('Fiets')) return <PYIcon name="bicycle" size={18} />;
  if (name.startsWith('Toilet')) return <PYIcon name="info" size={18} />;
  if (name.includes('OV') || name.includes('loket')) return <PYIcon name="map" size={18} />;
  return <PYIcon name="check" size={18} />;
};

const PYLocationTypeBadge = ({ type }) => {
  const icons = {
    'Parkeerterrein': 'car',
    'Parkeergarage': 'car',
    'Ondergrondse garage': 'car',
    'Parkeerdak': 'car',
  };
  return (
    <span className="py-location-type-badge">
      <PYIcon name={icons[type] || 'car'} size={14} />
      {type}
    </span>
  );
};

const PYGarageDetailPage = ({ id }) => {
  const garage = PY_GARAGES.find(g => g.id === id) || PY_GARAGES[0];
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('tarieven');
  const [stripAmount, setStripAmount] = React.useState('10');
  const [stripDone, setStripDone] = React.useState(false);
  const [waardeAmount, setWaardeAmount] = React.useState('50');
  const [waardeDone, setWaardeDone] = React.useState(false);

  const nearbyEvents = PY_EVENTS.filter(e => e.garageIds && e.garageIds.includes(garage.id));

  return (
    <main>
      {/* Hero */}
      <section className="py-detail-hero">
        <div className="py-container py-detail-hero__grid">
          <div>
            <a href="#/garages" className="py-back-link">← Alle locaties</a>
            <div className="py-detail-hero__meta">
              <PYLocationTypeBadge type={garage.locationType} />
              <span className="py-detail-hero__rating"><PYIcon name="star" size={15} color={PY_ORANGE} /> {garage.rating}</span>
            </div>
            <h1>{garage.name}</h1>
            <p>{garage.description}</p>
            <div className="py-detail-quick-facts">
              <span><PYIcon name="car" size={16} /> {garage.spaces} plekken</span>
              <span><PYIcon name="clock" size={16} /> {garage.hours?.open247 ? '24/7 open' : 'Beperkte openingstijden'}</span>
              <span><PYIcon name="pin" size={16} /> {garage.distance}</span>
              {garage.entryHeight && <span><PYIcon name="trending" size={16} /> Max. {garage.entryHeight}</span>}
            </div>
            <div className="py-detail-actions">
              <PYButton href="#/reserveren" variant="primary">Reserveer nu</PYButton>
              <PYButton onClick={() => setBookingOpen(true)} variant="aqua" icon="car">Snel boeken</PYButton>
              <PYButton href="#/support" variant="outline" icon="phone">Vraag hulp</PYButton>
            </div>
          </div>
          <div className="py-detail-media">
            <img src={garage.image} alt={garage.name} />
            <PYPriceBlob price={garage.dayPrice} unit="per dag" tone="orange" />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-detail-tabs-section">
        <div className="py-container">
          <nav className="py-detail-tabs">
            {[
              { id: 'tarieven', label: 'Tarieven' },
              { id: 'faciliteiten', label: 'Faciliteiten' },
              { id: 'openingstijden', label: 'Openingstijden' },
              { id: 'pois', label: "POI's & omgeving" },
            ].map(tab => (
              <button key={tab.id} className={activeTab === tab.id ? 'is-active' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
            ))}
          </nav>

          {activeTab === 'tarieven' && (
            <div className="py-tab-content">
              <div className="py-detail-two-col">
                <div>
                  <h3>Tarieven overzicht</h3>
                  <table className="py-tariff-table">
                    <tbody>
                      {garage.tariffs?.map(t => (
                        <tr key={t.label}>
                          <td>{t.label}</td>
                          <td><strong>€ {t.price}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="py-tariff-note">Tarieven zijn inclusief BTW. Vroegboekkorting geldt bij reservering minimaal 24u van tevoren.</p>
                </div>
                <div>
                  <h3>Betaalmogelijkheden</h3>
                  <div className="py-payment-grid">
                    {garage.paymentMethods?.map(method => (
                      <span key={method} className="py-payment-badge">
                        <PYIcon name="card" size={16} />
                        {method}
                      </span>
                    ))}
                  </div>
                  <div className="py-pricing-tip">
                    <PYIcon name="trending" size={18} color={PY_ORANGE} />
                    <div>
                      <strong>Bespaar tot 33%</strong>
                      <p>Reserveer vooraf en profiteer van vroegboekkortingen en gereserveerde dagprijzen.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faciliteiten' && (
            <div className="py-tab-content">
              <div className="py-detail-two-col">
                <div>
                  <h3>Aanwezige faciliteiten</h3>
                  <div className="py-facility-grid">
                    {garage.facilities?.map(f => (
                      <div key={f} className="py-facility-item">
                        <span className="py-facility-icon"><PYFacilityIcon name={f} /></span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Toegang & type</h3>
                  <div className="py-access-info">
                    <div>
                      <span>Type locatie</span>
                      <strong>{garage.locationType}</strong>
                    </div>
                    <div>
                      <span>Maximale voertuighoogte</span>
                      <strong>{garage.entryHeight}</strong>
                    </div>
                    <div>
                      <span>Beschikbare plekken</span>
                      <strong>{garage.spaces} (indicatief)</strong>
                    </div>
                    <div>
                      <span>Kentekentoegang</span>
                      <strong>{garage.reservable ? 'Ja, bij reservering' : 'Niet beschikbaar'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'openingstijden' && (
            <div className="py-tab-content">
              <div className="py-detail-two-col">
                <div>
                  <h3>Openingstijden</h3>
                  {garage.hours?.open247 ? (
                    <div className="py-247-badge">
                      <PYIcon name="check" size={20} />
                      <div>
                        <strong>24/7 geopend</strong>
                        <p>Deze locatie is altijd toegankelijk, ook op feestdagen.</p>
                      </div>
                    </div>
                  ) : (
                    <table className="py-hours-table">
                      <tbody>
                        <tr><td>Maandag – Vrijdag</td><td><strong>{garage.hours?.weekdays}</strong></td></tr>
                        <tr><td>Zaterdag</td><td><strong>{garage.hours?.saturday}</strong></td></tr>
                        <tr><td>Zondag</td><td><strong>{garage.hours?.sunday}</strong></td></tr>
                      </tbody>
                    </table>
                  )}
                </div>
                <div>
                  <h3>Service & bereikbaarheid</h3>
                  <div className="py-access-info">
                    <div><span>Telefonische service</span><strong>24/7 bereikbaar</strong></div>
                    <div><span>Adres</span><strong>{garage.address}, {garage.city}</strong></div>
                    <div><span>Loopafstand centrum</span><strong>{garage.distance}</strong></div>
                  </div>
                  <div className="py-contact-cta">
                    <PYButton href="#/support" variant="outline" icon="phone">085 4011647</PYButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pois' && (
            <div className="py-tab-content">
              <h3>Bezienswaardigheden & POI's in de buurt</h3>
              <div className="py-poi-grid">
                {garage.pois?.map(poi => (
                  <div key={poi.name} className="py-poi-card">
                    <span className="py-poi-icon"><PYIcon name="pin" size={20} /></span>
                    <div>
                      <strong>{poi.name}</strong>
                      <span>{poi.type}</span>
                      <span className="py-poi-distance"><PYIcon name="clock" size={14} /> {poi.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="py-detail-map-card" style={{ marginTop: 32 }}>
                <PYMiniMap compact />
                <p>Interactieve kaartweergave toont looproutes naar POI's. In productie wordt hier de live-routekaart getoond.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Strippenkaart / Waardekaart sectie */}
      {(garage.strippenkaart || garage.waardekaart) && (
        <section className="py-section py-section--paper">
          <div className="py-container">
            <PYSectionIntro title={'Voordelig <em>vaker parkeren</em> hier.'}>
              Bestel een strippenkaart of waardekaart specifiek voor {garage.name} en bespaar op elk bezoek.
            </PYSectionIntro>
            <div className="py-product-cards-row">
              {garage.strippenkaart && (
                <div className="py-product-card py-product-card--strips">
                  <div className="py-product-card__header">
                    <span><PYIcon name="ticket" size={22} /></span>
                    <h3>Strippenkaart</h3>
                    <p>Kies 10 of 25 parkeeracties voor {garage.name}. Ontvang de code per e-mail en reserveer wanneer het jou uitkomt.</p>
                  </div>
                  {stripDone ? (
                    <div className="py-inline-success"><PYIcon name="check" size={20} /><span>Bestelling ontvangen. Code volgt per e-mail.</span></div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setStripDone(true); }}>
                      <div className="py-pass-toggle py-pass-toggle--light">
                        {['10', '25'].map(v => (
                          <button type="button" key={v} className={stripAmount === v ? 'is-active' : ''} onClick={() => setStripAmount(v)}>
                            {v}x parkeren {v === '10' ? '– € 22' : '– € 48'}
                          </button>
                        ))}
                      </div>
                      <label className="py-inline-label">E-mail<input required placeholder="jij@voorbeeld.nl" /></label>
                      <PYButton type="submit" variant="primary">Bestel strippenkaart</PYButton>
                    </form>
                  )}
                </div>
              )}
              {garage.waardekaart && (
                <div className="py-product-card py-product-card--waarde">
                  <div className="py-product-card__header">
                    <span><PYIcon name="wallet" size={22} /></span>
                    <h3>Waardekaart</h3>
                    <p>Laad een tegoed op en gebruik het voor alle bezoeken aan {garage.name}. Ideaal voor zakelijk gebruik en frequente bezoekers.</p>
                  </div>
                  {waardeDone ? (
                    <div className="py-inline-success"><PYIcon name="check" size={20} /><span>Waardekaart aangemaakt. Inloggegevens volgen per e-mail.</span></div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setWaardeDone(true); }}>
                      <div className="py-waarde-options">
                        {['25', '50', '100', '200'].map(v => (
                          <button type="button" key={v} className={waardeAmount === v ? 'is-active' : ''} onClick={() => setWaardeAmount(v)}>
                            € {v}
                          </button>
                        ))}
                      </div>
                      <label className="py-inline-label">E-mail<input required placeholder="jij@voorbeeld.nl" /></label>
                      <PYButton type="submit" variant="primary">Laad waardekaart op</PYButton>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Evenementen nabij deze locatie */}
      {nearbyEvents.length > 0 && (
        <section className="py-section">
          <div className="py-container">
            <PYSectionIntro title={'Evenementen <em>nabij</em> deze locatie.'}>
              Reserveer al je parkeertickets voor aankomende evenementen in de buurt.
            </PYSectionIntro>
            <div className="py-event-strip">
              {nearbyEvents.map(event => (
                <a key={event.id} href={`#/evenementen/${event.id}`} className="py-event-mini-card">
                  <img src={event.image} alt={event.name} />
                  <div>
                    <span className={`py-event-type py-event-type--${event.typeColor}`}>{event.type}</span>
                    <strong>{event.name}</strong>
                    <small><PYIcon name="calendar" size={13} /> {event.dates}</small>
                    <small>Vanaf € {event.price}</small>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {bookingOpen && <PYReservationDrawer garage={garage} onClose={() => setBookingOpen(false)} />}
    </main>
  );
};

Object.assign(window, { PYGarageCard, PYGarages, PYGaragesPage, PYGarageDetailPage, PYReservationDrawer });
