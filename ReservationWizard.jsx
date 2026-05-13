const PY_WIZARD_STEPS = [
  { id: 1, label: 'Locatie & kaart' },
  { id: 2, label: 'Datum & tijd' },
  { id: 3, label: 'Gegevens' },
  { id: 4, label: 'Bevestiging' },
];

const PY_AVAILABILITY = {
  'dll-parkeerdek': { status: 'available', spaces: 34, label: 'Veel plekken' },
  'philips-bedrijfsschool': { status: 'available', spaces: 78, label: 'Ruim beschikbaar' },
  'philips-stadion': { status: 'limited', spaces: 11, label: 'Bijna vol' },
  'p1-carlton': { status: 'limited', spaces: 6, label: 'Nog 6 plekken' },
  'p2-mandela': { status: 'available', spaces: 42, label: 'Beschikbaar' },
  'evoluon': { status: 'available', spaces: 88, label: 'Ruim beschikbaar' },
  'stadskantoor': { status: 'available', spaces: 54, label: 'Beschikbaar' },
  'havenkwartier': { status: 'full', spaces: 0, label: 'Vol' },
  'centrum-oost': { status: 'available', spaces: 29, label: 'Beschikbaar' },
  'hofplein': { status: 'available', spaces: 61, label: 'Veel plekken' },
  'bos-en-lommer': { status: 'available', spaces: 45, label: 'Beschikbaar' },
};

const PYWizardMap = ({ selectedId, onSelect, city }) => {
  const pins = [
    { id: 'dll-parkeerdek', x: '22%', y: '40%' },
    { id: 'philips-bedrijfsschool', x: '38%', y: '58%' },
    { id: 'philips-stadion', x: '28%', y: '72%' },
    { id: 'p2-mandela', x: '50%', y: '35%' },
    { id: 'evoluon', x: '64%', y: '55%' },
    { id: 'p1-carlton', x: '70%', y: '25%' },
    { id: 'hofplein', x: '42%', y: '80%' },
    { id: 'havenkwartier', x: '78%', y: '68%' },
  ];

  const visibleGarages = city && city !== 'Alle steden'
    ? PY_GARAGES.filter(g => g.city === city)
    : PY_GARAGES;

  const visibleIds = visibleGarages.map(g => g.id);
  const visiblePins = pins.filter(p => visibleIds.includes(p.id));

  return (
    <div className="py-wizard-map" aria-label="Interactieve parkeerkaart">
      <svg viewBox="0 0 520 420" preserveAspectRatio="none" className="py-wizard-map__roads">
        <path d="M-20 90 C100 140 120 45 230 95 S400 135 550 75" />
        <path d="M-20 250 C120 310 170 210 275 260 S430 315 550 245" />
        <path d="M95 -20 C125 90 85 170 125 260 S150 345 130 450" />
        <path d="M365 -20 C330 110 395 195 350 315 S305 375 330 450" />
        <path d="M-20 380 C80 370 160 340 280 360 S440 375 550 350" strokeWidth="12" />
      </svg>

      {visiblePins.map(pin => {
        const garage = PY_GARAGES.find(g => g.id === pin.id);
        if (!garage) return null;
        const avail = PY_AVAILABILITY[pin.id];
        const isSelected = selectedId === pin.id;
        const statusClass = avail?.status === 'full' ? 'is-full' : avail?.status === 'limited' ? 'is-limited' : 'is-available';

        return (
          <button
            key={pin.id}
            className={`py-wizard-pin ${statusClass} ${isSelected ? 'is-selected' : ''}`}
            style={{ left: pin.x, top: pin.y }}
            onClick={() => onSelect(pin.id)}
            title={garage.name}
            disabled={avail?.status === 'full'}
          >
            <span className="py-wizard-pin__dot" />
            <span className="py-wizard-pin__label">
              <strong>{garage.name}</strong>
              <span>€ {garage.dayPrice}</span>
              <span className={`py-avail-dot py-avail-dot--${avail?.status}`}>{avail?.label}</span>
            </span>
          </button>
        );
      })}

      <div className="py-wizard-map__legend">
        <span><i className="py-avail-dot py-avail-dot--available" /> Beschikbaar</span>
        <span><i className="py-avail-dot py-avail-dot--limited" /> Bijna vol</span>
        <span><i className="py-avail-dot py-avail-dot--full" /> Vol</span>
      </div>
    </div>
  );
};

const PYSalesBadge = ({ type, children }) => (
  <div className={`py-sales-badge py-sales-badge--${type}`}>
    <PYIcon name={type === 'discount' ? 'trending' : type === 'poi' ? 'pin' : 'bolt'} size={16} />
    <span>{children}</span>
  </div>
);

const PYReservationWizardPage = () => {
  const [step, setStep] = React.useState(1);
  const [selectedGarageId, setSelectedGarageId] = React.useState('');
  const [filterCity, setFilterCity] = React.useState('Alle steden');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('17:00');
  const [plate, setPlate] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [done, setDone] = React.useState(false);

  const selectedGarage = PY_GARAGES.find(g => g.id === selectedGarageId);
  const avail = PY_AVAILABILITY[selectedGarageId];

  const hoursParked = React.useMemo(() => {
    if (!startTime || !endTime) return 8;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return Math.max(1, (eh * 60 + em - sh * 60 - sm) / 60);
  }, [startTime, endTime]);

  const basePrice = selectedGarage ? selectedGarage.price * (hoursParked >= 7 ? 1 : hoursParked / 7) : 0;
  const discountPrice = (basePrice * 0.87).toFixed(2);
  const savings = (basePrice - Number(discountPrice)).toFixed(2);

  const todayStr = new Date().toISOString().split('T')[0];

  const canProceedStep1 = !!selectedGarageId;
  const canProceedStep2 = !!date && !!startTime && !!endTime;
  const canProceedStep3 = !!plate && !!email && !!name;

  const handleSelect = (id) => {
    const avail = PY_AVAILABILITY[id];
    if (avail?.status !== 'full') setSelectedGarageId(id);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setDone(true);
    setStep(4);
  };

  return (
    <main className="py-wizard-page">
      {/* Steps indicator */}
      <div className="py-wizard-header">
        <div className="py-container">
          <a href="#/garages" className="py-back-link">← Terug</a>
          <div className="py-wizard-steps">
            {PY_WIZARD_STEPS.map(s => (
              <div key={s.id} className={`py-wizard-step ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-done' : ''}`}>
                <span>{step > s.id ? <PYIcon name="check" size={14} /> : s.id}</span>
                <strong>{s.label}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-container py-wizard-layout">
        {/* Main content */}
        <div className="py-wizard-main">

          {/* Stap 1: Locatie */}
          {step === 1 && (
            <div>
              <h2>Kies een parkeerlocatie.</h2>
              <p className="py-wizard-intro">Klik op een pin op de kaart of selecteer een locatie uit de lijst. Groen = beschikbaar, oranje = bijna vol, rood = vol.</p>

              <div className="py-wizard-city-filter">
                {PY_CITIES.map(c => (
                  <button key={c} className={filterCity === c ? 'is-active' : ''} onClick={() => setFilterCity(c)}>{c}</button>
                ))}
              </div>

              <PYWizardMap selectedId={selectedGarageId} onSelect={handleSelect} city={filterCity} />

              <div className="py-wizard-location-list">
                {PY_GARAGES
                  .filter(g => filterCity === 'Alle steden' || g.city === filterCity)
                  .map(garage => {
                    const avail = PY_AVAILABILITY[garage.id];
                    const isSelected = selectedGarageId === garage.id;
                    return (
                      <button
                        key={garage.id}
                        className={`py-wizard-location-item ${isSelected ? 'is-selected' : ''} ${avail?.status === 'full' ? 'is-disabled' : ''}`}
                        onClick={() => handleSelect(garage.id)}
                        disabled={avail?.status === 'full'}
                      >
                        <span className={`py-avail-dot py-avail-dot--${avail?.status}`} />
                        <div className="py-wizard-location-item__info">
                          <strong>{garage.name}</strong>
                          <span>{garage.city} · {garage.distance}</span>
                        </div>
                        <div className="py-wizard-location-item__right">
                          <strong className="py-wizard-price">€ {garage.dayPrice}/dag</strong>
                          <span className={`py-avail-label py-avail-label--${avail?.status}`}>{avail?.label}</span>
                        </div>
                        {isSelected && <span className="py-wizard-check"><PYIcon name="check" size={16} /></span>}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Stap 2: Datum & tijd */}
          {step === 2 && selectedGarage && (
            <div>
              <h2>Kies datum en tijdstip.</h2>
              <p className="py-wizard-intro">Selecteer wanneer je wilt parkeren bij <strong>{selectedGarage.name}</strong>. Vroegboekkorting actief bij reservering &gt; 24u vooraf.</p>

              <div className="py-wizard-datetime">
                <label className="py-wizard-field">
                  Datum
                  <input type="date" min={todayStr} value={date} onChange={e => setDate(e.target.value)} required />
                </label>
                <label className="py-wizard-field">
                  Aankomsttijd
                  <select value={startTime} onChange={e => setStartTime(e.target.value)}>
                    {['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="py-wizard-field">
                  Vertrektijd
                  <select value={endTime} onChange={e => setEndTime(e.target.value)}>
                    {['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
              </div>

              {date && (
                <div className="py-wizard-sales-strip">
                  <PYSalesBadge type="discount">Bespaar {savings > 0 ? `€ ${savings}` : '13%'} door vroeg te boeken</PYSalesBadge>
                  {avail?.spaces <= 15 && (
                    <PYSalesBadge type="urgent">Nog {avail.spaces} plekken beschikbaar op deze datum</PYSalesBadge>
                  )}
                  <PYSalesBadge type="poi">
                    {selectedGarage.pois?.[0]?.name} op {selectedGarage.pois?.[0]?.distance}
                  </PYSalesBadge>
                </div>
              )}

              {selectedGarage.hours && !selectedGarage.hours.open247 && (
                <div className="py-wizard-hours-notice">
                  <PYIcon name="clock" size={16} />
                  <span>Let op: deze locatie is beperkt open. Weekdagen {selectedGarage.hours.weekdays}, zaterdag {selectedGarage.hours.saturday}.</span>
                </div>
              )}
            </div>
          )}

          {/* Stap 3: Gegevens */}
          {step === 3 && selectedGarage && (
            <form id="wizard-form" onSubmit={handleFinalSubmit}>
              <h2>Jouw gegevens.</h2>
              <p className="py-wizard-intro">Vul je kenteken en contactgegevens in. Je ontvang de reserveringsbevestiging per e-mail.</p>

              <div className="py-wizard-form-grid">
                <label className="py-wizard-field">
                  Naam
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Voor- en achternaam" required />
                </label>
                <label className="py-wizard-field">
                  E-mailadres
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jij@voorbeeld.nl" required />
                </label>
                <label className="py-wizard-field" style={{ gridColumn: '1/-1' }}>
                  Kenteken
                  <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="AB-123-C" required />
                </label>
              </div>

              <div className="py-wizard-upsells">
                <h3>Handige toevoegingen</h3>
                <div className="py-upsell-grid">
                  <label className="py-upsell-item">
                    <input type="checkbox" />
                    <div>
                      <strong>EV-laadplek</strong>
                      <span>Reserveer een laadplek voor jouw elektrisch voertuig.</span>
                      <em>+ € 2,00</em>
                    </div>
                  </label>
                  <label className="py-upsell-item">
                    <input type="checkbox" />
                    <div>
                      <strong>Vaste reserveringsverzekering</strong>
                      <span>Gratis annuleren tot 2 uur voor aanvang.</span>
                      <em>+ € 1,50</em>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* Stap 4: Bevestiging */}
          {step === 4 && done && (
            <div className="py-wizard-done">
              <div className="py-wizard-done__icon"><PYIcon name="check" size={36} /></div>
              <h2>Je plek staat klaar!</h2>
              <p>Reserveringsnummer <strong>R-{Math.floor(Math.random() * 90000) + 10000}</strong> is bevestigd. Je ontvangt een e-mail op <strong>{email}</strong> met alle details, je QR-code en kentekeninstructies.</p>
              <div className="py-wizard-done__summary">
                <div><span>Locatie</span><strong>{selectedGarage?.name}</strong></div>
                <div><span>Datum</span><strong>{date}</strong></div>
                <div><span>Tijdstip</span><strong>{startTime} – {endTime}</strong></div>
                <div><span>Kenteken</span><strong>{plate}</strong></div>
                <div><span>Betaald</span><strong>€ {discountPrice}</strong></div>
              </div>
              <div className="py-wizard-done__actions">
                <PYButton href="#/dashboard" variant="primary">Naar mijn dashboard</PYButton>
                <PYButton href="#/garages" variant="outline">Andere locaties</PYButton>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar summary */}
        {step < 4 && (
          <div className="py-wizard-sidebar">
            <div className="py-wizard-summary">
              <h3>Samenvatting</h3>

              {selectedGarage ? (
                <>
                  <img src={selectedGarage.image} alt={selectedGarage.name} className="py-wizard-summary__img" />
                  <div className="py-wizard-summary__name">
                    <strong>{selectedGarage.name}</strong>
                    <span>{selectedGarage.city}</span>
                    <span>{selectedGarage.distance}</span>
                  </div>
                  {avail && (
                    <div className={`py-wizard-summary__avail py-avail-label--${avail.status}`}>
                      <span className={`py-avail-dot py-avail-dot--${avail.status}`} />
                      {avail.label}
                    </div>
                  )}

                  {/* POI sales element */}
                  {selectedGarage.pois?.slice(0, 2).map(poi => (
                    <div key={poi.name} className="py-wizard-poi">
                      <PYIcon name="pin" size={14} color={PY_ORANGE} />
                      <span><strong>{poi.name}</strong> op {poi.distance}</span>
                    </div>
                  ))}

                  {date && startTime && endTime && (
                    <>
                      <div className="py-wizard-summary__divider" />
                      <div className="py-wizard-summary__row"><span>Datum</span><strong>{date}</strong></div>
                      <div className="py-wizard-summary__row"><span>Tijdstip</span><strong>{startTime} – {endTime}</strong></div>
                      <div className="py-wizard-summary__row"><span>Duur</span><strong>ca. {Math.round(hoursParked)} uur</strong></div>
                      <div className="py-wizard-summary__divider" />
                      <div className="py-wizard-summary__row py-wizard-summary__row--strike"><span>Regulier tarief</span><strong>€ {basePrice.toFixed(2)}</strong></div>
                      <div className="py-wizard-summary__row py-wizard-summary__row--discount"><span>Vroegboekkorting</span><strong>– € {savings}</strong></div>
                      <div className="py-wizard-summary__total"><span>Totaal</span><strong>€ {discountPrice}</strong></div>
                      <div className="py-wizard-savings-badge">
                        <PYIcon name="trending" size={14} />
                        Je bespaart € {savings} door online te reserveren
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="py-wizard-summary__empty">
                  <PYIcon name="map" size={28} color="var(--py-muted)" />
                  <p>Selecteer een locatie op de kaart of uit de lijst.</p>
                </div>
              )}
            </div>

            {/* Rating widget */}
            {selectedGarage && (
              <div className="py-wizard-rating">
                <PYIcon name="star" size={16} color={PY_ORANGE} />
                <strong>{selectedGarage.rating}</strong>
                <span>·</span>
                <span>{Math.floor(Math.random() * 200) + 50} reviews</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      {step < 4 && (
        <div className="py-wizard-nav">
          <div className="py-container py-wizard-nav__inner">
            <button className="py-wizard-back" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
              ← Vorige stap
            </button>
            <span className="py-wizard-progress">Stap {step} van 3</span>
            {step < 3 ? (
              <PYButton
                onClick={() => setStep(s => s + 1)}
                variant="primary"
                disabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
              >
                Volgende stap
              </PYButton>
            ) : (
              <PYButton type="submit" variant="primary" className="py-button--primary"
                onClick={() => { if (canProceedStep3) { setDone(true); setStep(4); } }}
                disabled={!canProceedStep3}
              >
                Reservering afronden
              </PYButton>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

Object.assign(window, { PYReservationWizardPage, PYWizardMap });
