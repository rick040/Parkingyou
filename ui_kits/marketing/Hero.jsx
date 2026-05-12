const PYSearchPanel = ({ compact = false, initialCity = '', onSearch }) => {
  const [city, setCity] = React.useState(initialCity);
  const [date, setDate] = React.useState('Vandaag 09:00 - 17:00');
  const [submitted, setSubmitted] = React.useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    onSearch && onSearch({ city, date });
    if (!onSearch) window.location.hash = `#/garages?city=${encodeURIComponent(city || 'Alle steden')}`;
  };

  return (
    <form className={`py-search ${compact ? 'py-search--compact' : ''}`} onSubmit={submit}>
      <label>
        <span><PYIcon name="pin" size={18} /> Waar</span>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Stad, garage of adres" />
      </label>
      <label>
        <span><PYIcon name="calendar" size={18} /> Wanneer</span>
        <input value={date} onChange={e => setDate(e.target.value)} placeholder="Vandaag 09:00 - 17:00" />
      </label>
      <PYButton type="submit" variant="primary" icon="search">Zoek plek</PYButton>
      {submitted && <div className="py-search__hint">We tonen nu de beste matches voor {city || 'alle steden'}.</div>}
    </form>
  );
};

const PYHero = () => {
  const quickCities = ['Eindhoven', 'Amsterdam', 'Rotterdam', 'Den Haag'];
  return (
    <section className="py-hero">
      <div className="py-container py-hero__grid">
        <div className="py-hero__copy">
          <h1>Parkeer <em>voordelig</em> midden in de stad.</h1>
          <p>Vind een ParkingYou-garage, reserveer je plek en rij in met kentekenherkenning. Minder rondjes rijden, meer tijd voor je dag.</p>
          <PYSearchPanel />
          <div className="py-quick-cities" aria-label="Populaire steden">
            {quickCities.map(city => <a key={city} href={`#/garages?city=${city}`}>{city}</a>)}
          </div>
        </div>
        <div className="py-hero__visual">
          <div className="py-pin-photo">
            <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1300&q=85" alt="Auto's in een parkeergarage" />
          </div>
          <PYPriceBlob price="5" unit="per dag" tone="aqua" />
          <div className="py-hero-ticket">
            <span><PYIcon name="check" size={18} /> Gereserveerd</span>
            <strong>Philips Stadion</strong>
            <small>Vandaag 09:00 - 17:00</small>
          </div>
          <div className="py-hero-stat">
            <strong>40+</strong>
            <span>garages in Nederland</span>
          </div>
        </div>
      </div>
      <div className="py-container py-proofbar">
        {[
          ['EUR 5', 'dagkaarten vanaf'],
          ['24/7', 'service bij storing'],
          ['2 min', 'gemiddeld tot reserveren'],
          ['100%', 'digitaal betaalbewijs'],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

Object.assign(window, { PYHero, PYSearchPanel });
