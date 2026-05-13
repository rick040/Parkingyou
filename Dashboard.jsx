const PY_MOCK_USER = {
  name: 'Thomas van der Berg',
  email: 'thomas@voorbeeld.nl',
  phone: '06 12 34 56 78',
  kenteken: 'AB-123-C',
  youPoints: 240,
  memberSince: 'maart 2022',
};

// Get stored reservations from localStorage or use defaults
const getStoredReservations = () => {
  try {
    const stored = localStorage.getItem('py_reservations');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: 'R-20250318', garage: 'P2 Mandela', city: 'Eindhoven', date: 'ma 18 mrt 2025', time: '09:00 - 17:00', price: '12,00', status: 'upcoming', kenteken: 'AB-123-C' },
    { id: 'R-20250301', garage: 'P1 Carlton', city: 'Amsterdam', date: 'za 1 mrt 2025', time: '10:00 - 19:00', price: '22,00', status: 'upcoming', kenteken: 'AB-123-C' },
    { id: 'R-20250214', garage: 'Parking DLL parkeerdek', city: 'Eindhoven', date: 'vr 14 feb 2025', time: '09:00 - 18:00', price: '10,00', status: 'completed', kenteken: 'AB-123-C' },
    { id: 'R-20250131', garage: 'Philips Stadion', city: 'Eindhoven', date: 'vr 31 jan 2025', time: '18:00 - 23:00', price: '12,00', status: 'completed', kenteken: 'AB-123-C' },
    { id: 'R-20250110', garage: 'Havenkwartier', city: 'Rotterdam', date: 'vr 10 jan 2025', time: '09:00 - 17:00', price: '13,00', status: 'completed', kenteken: 'AB-123-C' },
  ];
};

const PY_MOCK_RESERVATIONS = getStoredReservations();

const PY_MOCK_SUBSCRIPTIONS = [
  { id: 'ABO-4421', garage: 'Parking Philips Bedrijfsschool', city: 'Eindhoven', startDate: '1 januari 2025', price: '49,00/mnd', status: 'active', access: 'Keycard' },
];

const PY_MOCK_PASSES = [
  { id: 'PP-8821', type: 'ParkingPass 25x', garage: 'Parking DLL parkeerdek', remaining: 17, original: 25, validUntil: '31 dec 2025' },
  { id: 'PP-7632', type: 'ParkingPass 10x', garage: 'Parking Evoluon', remaining: 3, original: 10, validUntil: '30 jun 2025' },
];

const PY_MOCK_TRANSACTIONS = [
  { date: 'za 1 mrt 2025', description: 'Parkeren P1 Carlton, Amsterdam', points: +22, total: 240 },
  { date: 'vr 14 feb 2025', description: 'Parkeren DLL parkeerdek, Eindhoven', points: +10, total: 218 },
  { date: 'vr 31 jan 2025', description: 'Parkeren Philips Stadion, Eindhoven', points: +12, total: 208 },
  { date: 'wo 15 jan 2025', description: 'Ingewisseld voor dagkaart', points: -50, total: 196 },
  { date: 'vr 10 jan 2025', description: 'Parkeren Havenkwartier, Rotterdam', points: +13, total: 246 },
];

const PYDashboardPage = ({ auth = {} }) => {
  const [activeSection, setActiveSection] = React.useState('overview');
  const [editMode, setEditMode] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [reservations, setReservations] = React.useState(getStoredReservations);
  
  // Refresh reservations when section changes (to catch new ones)
  React.useEffect(() => {
    setReservations(getStoredReservations());
  }, [activeSection]);
  
  const upcoming = reservations.filter(r => r.status === 'upcoming');
  const past = reservations.filter(r => r.status === 'completed');
  
  const cancelReservation = (id) => {
    if (!confirm('Weet je zeker dat je deze reservering wilt annuleren?')) return;
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    try { localStorage.setItem('py_reservations', JSON.stringify(updated)); } catch {}
  };

  const sections = [
    { id: 'overview', label: 'Overzicht', icon: 'car' },
    { id: 'reservations', label: 'Reserveringen', icon: 'calendar' },
    { id: 'products', label: 'Mijn producten', icon: 'card' },
    { id: 'points', label: 'You-punten', icon: 'star' },
    { id: 'account', label: 'Mijn gegevens', icon: 'user' },
  ];

  return (
    <main className="py-dashboard">
      <div className="py-container py-dashboard__layout">
        {/* Sidebar */}
        <aside className="py-dashboard__sidebar">
          <div className="py-dashboard__user">
            <div className="py-dashboard__avatar">{PY_MOCK_USER.name.charAt(0)}</div>
            <div>
              <strong>{PY_MOCK_USER.name}</strong>
              <span>Lid sinds {PY_MOCK_USER.memberSince}</span>
            </div>
          </div>
          <nav className="py-dashboard__nav">
            {sections.map(s => (
              <button key={s.id} className={activeSection === s.id ? 'is-active' : ''} onClick={() => setActiveSection(s.id)}>
                <PYIcon name={s.icon} size={18} />
                {s.label}
              </button>
            ))}
          </nav>
          <div className="py-dashboard__sidebar-cta">
            <PYButton href="#/reserveren" variant="primary">Nieuwe reservering</PYButton>
            <button 
              onClick={() => auth.logout && auth.logout()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8, 
                width: '100%',
                marginTop: 10,
                padding: '12px 16px',
                border: 0,
                borderRadius: 999,
                background: 'transparent',
                fontSize: 14, 
                fontWeight: 700, 
                color: 'var(--py-muted)',
                cursor: 'pointer'
              }}
            >
              <PYIcon name="x" size={16} /> Uitloggen
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="py-dashboard__content">

          {/* Overzicht */}
          {activeSection === 'overview' && (
            <div>
              <h2 className="py-dashboard__title">Goedemiddag, {PY_MOCK_USER.name.split(' ')[0]}.</h2>
              <div className="py-dashboard__stats">
                <div className="py-stat-card py-stat-card--points">
                  <PYIcon name="star" size={22} color={PY_ORANGE} />
                  <strong>{PY_MOCK_USER.youPoints}</strong>
                  <span>You-punten</span>
                  <a href="#" onClick={e => { e.preventDefault(); setActiveSection('points'); }}>Bekijk punten</a>
                </div>
                <div className="py-stat-card">
                  <PYIcon name="calendar" size={22} color={PY_BLUE} />
                  <strong>{upcoming.length}</strong>
                  <span>Aankomende reserveringen</span>
                  <a href="#" onClick={e => { e.preventDefault(); setActiveSection('reservations'); }}>Bekijk alle</a>
                </div>
                <div className="py-stat-card">
                  <PYIcon name="card" size={22} color={PY_AQUA} />
                  <strong>{PY_MOCK_PASSES.reduce((sum, p) => sum + p.remaining, 0)}</strong>
                  <span>Resterende stripacties</span>
                  <a href="#" onClick={e => { e.preventDefault(); setActiveSection('products'); }}>Bekijk passes</a>
                </div>
              </div>

              <h3 className="py-dashboard__subtitle">Aankomende reserveringen</h3>
              {upcoming.length === 0 ? (
                <div className="py-empty-state">
                  <PYIcon name="calendar" size={32} color="var(--py-muted)" />
                  <p>Geen aankomende reserveringen. <a href="#/reserveren">Reserveer nu</a></p>
                </div>
              ) : (
                <div className="py-reservation-list">
                  {upcoming.map(r => <PYReservationRow key={r.id} reservation={r} />)}
                </div>
              )}

              <h3 className="py-dashboard__subtitle" style={{ marginTop: 36 }}>Actieve producten</h3>
              <div className="py-product-row">
                {PY_MOCK_SUBSCRIPTIONS.map(sub => (
                  <div key={sub.id} className="py-product-mini-card">
                    <span className="py-product-mini-card__icon"><PYIcon name="calendar" size={18} /></span>
                    <div>
                      <strong>Abonnement</strong>
                      <span>{sub.garage}</span>
                      <span className="py-status-badge py-status-badge--active">Actief</span>
                    </div>
                    <span className="py-product-mini-card__price">{sub.price}</span>
                  </div>
                ))}
                {PY_MOCK_PASSES.map(pass => (
                  <div key={pass.id} className="py-product-mini-card">
                    <span className="py-product-mini-card__icon"><PYIcon name="ticket" size={18} /></span>
                    <div>
                      <strong>{pass.type}</strong>
                      <span>{pass.garage}</span>
                      <span className={`py-status-badge ${pass.remaining <= 3 ? 'py-status-badge--warning' : 'py-status-badge--active'}`}>
                        {pass.remaining} van {pass.original} over
                      </span>
                    </div>
                    <div className="py-pass-progress">
                      <div style={{ width: `${(pass.remaining / pass.original) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reserveringen */}
          {activeSection === 'reservations' && (
            <div>
              <h2 className="py-dashboard__title">Mijn reserveringen</h2>
              {upcoming.length > 0 && (
                <>
                  <h3 className="py-dashboard__subtitle">Aankomend ({upcoming.length})</h3>
                  <div className="py-reservation-list">
                    {upcoming.map(r => <PYReservationRow key={r.id} reservation={r} actions />)}
                  </div>
                </>
              )}
              <h3 className="py-dashboard__subtitle" style={{ marginTop: 32 }}>Geschiedenis ({past.length})</h3>
              <div className="py-reservation-list">
                {past.map(r => <PYReservationRow key={r.id} reservation={r} past />)}
              </div>
            </div>
          )}

          {/* Producten */}
          {activeSection === 'products' && (
            <div>
              <h2 className="py-dashboard__title">Mijn producten</h2>

              <h3 className="py-dashboard__subtitle">Abonnementen</h3>
              {PY_MOCK_SUBSCRIPTIONS.map(sub => (
                <div key={sub.id} className="py-product-detail-card">
                  <div className="py-product-detail-card__header">
                    <span><PYIcon name="calendar" size={20} /></span>
                    <div>
                      <strong>Maandabonnement – {sub.garage}</strong>
                      <small>{sub.city}</small>
                    </div>
                    <span className="py-status-badge py-status-badge--active">Actief</span>
                  </div>
                  <div className="py-product-detail-card__body">
                    <div><span>Startdatum</span><strong>{sub.startDate}</strong></div>
                    <div><span>Maandprijs</span><strong>€ {sub.price}</strong></div>
                    <div><span>Toegangsmiddel</span><strong>{sub.access}</strong></div>
                    <div><span>Opzegtermijn</span><strong>1 volle maand</strong></div>
                  </div>
                  <div className="py-product-detail-card__actions">
                    <PYButton variant="outline" icon="info">Details & facturen</PYButton>
                    <PYButton variant="ghost" icon="x">Abonnement opzeggen</PYButton>
                  </div>
                </div>
              ))}

              <h3 className="py-dashboard__subtitle" style={{ marginTop: 32 }}>ParkingPasses</h3>
              {PY_MOCK_PASSES.map(pass => (
                <div key={pass.id} className="py-product-detail-card">
                  <div className="py-product-detail-card__header">
                    <span><PYIcon name="ticket" size={20} /></span>
                    <div>
                      <strong>{pass.type}</strong>
                      <small>{pass.garage}</small>
                    </div>
                    <span className={`py-status-badge ${pass.remaining <= 3 ? 'py-status-badge--warning' : 'py-status-badge--active'}`}>
                      {pass.remaining} acties over
                    </span>
                  </div>
                  <div className="py-product-detail-card__body">
                    <div><span>Geldig tot</span><strong>{pass.validUntil}</strong></div>
                    <div><span>Gebruikt</span><strong>{pass.original - pass.remaining} van {pass.original}</strong></div>
                    <div><span>Pas-ID</span><strong>{pass.id}</strong></div>
                  </div>
                  <div className="py-pass-bar">
                    <div className="py-pass-bar__track">
                      <div className="py-pass-bar__fill" style={{ width: `${(pass.remaining / pass.original) * 100}%` }} />
                    </div>
                    <span>{pass.remaining} van {pass.original} acties resterend</span>
                  </div>
                  <div className="py-product-detail-card__actions">
                    {pass.remaining <= 5 && (
                      <PYButton href="#/parkingpass" variant="primary">Nieuwe pass kopen</PYButton>
                    )}
                    <PYButton variant="outline" icon="info">Gebruikshistorie</PYButton>
                  </div>
                </div>
              ))}

              <div className="py-dashboard__add-cta">
                <PYButton href="#/parkingpass" variant="outline">Nieuwe ParkingPass kopen</PYButton>
                <PYButton href="#/abonnementen" variant="outline">Abonnement aanvragen</PYButton>
              </div>
            </div>
          )}

          {/* You-punten */}
          {activeSection === 'points' && (
            <div>
              <h2 className="py-dashboard__title">You-punten</h2>
              <div className="py-points-hero">
                <div className="py-points-hero__circle">
                  <strong>{PY_MOCK_USER.youPoints}</strong>
                  <span>You-punten</span>
                </div>
                <div className="py-points-hero__info">
                  <h3>Jouw spaarsaldo</h3>
                  <p>Je verdient You-punten bij elke reservering en parkeeractie. Wissel ze in voor gratis parkeren of kortingen bij deelnemende locaties.</p>
                  <div className="py-points-convert">
                    <span>100 punten = € 1,00 parkeerkorting</span>
                    <PYButton variant="primary" icon="arrow">Punten inwisselen</PYButton>
                  </div>
                </div>
              </div>

              <h3 className="py-dashboard__subtitle" style={{ marginTop: 32 }}>Puntentransacties</h3>
              <div className="py-points-list">
                {PY_MOCK_TRANSACTIONS.map((t, i) => (
                  <div key={i} className="py-points-row">
                    <span className="py-points-row__date">{t.date}</span>
                    <span className="py-points-row__desc">{t.description}</span>
                    <span className={`py-points-row__amount ${t.points > 0 ? 'is-positive' : 'is-negative'}`}>
                      {t.points > 0 ? '+' : ''}{t.points} ptn
                    </span>
                    <span className="py-points-row__total">{t.total} ptn</span>
                  </div>
                ))}
              </div>

              <div className="py-points-earn">
                <h3>Meer punten verdienen</h3>
                <div className="py-points-earn__grid">
                  <div><PYIcon name="car" size={20} /><strong>Reserveer vooraf</strong><span>+10 ptn per boeking</span></div>
                  <div><PYIcon name="star" size={20} /><strong>Schrijf een review</strong><span>+25 ptn per review</span></div>
                  <div><PYIcon name="user" size={20} /><strong>Vriend uitnodigen</strong><span>+50 ptn per vriend</span></div>
                  <div><PYIcon name="card" size={20} /><strong>ParkingPass kopen</strong><span>+15 ptn per aankoop</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <div>
              <h2 className="py-dashboard__title">Mijn gegevens</h2>
              {saved && (
                <div className="py-inline-success" style={{ marginBottom: 24 }}>
                  <PYIcon name="check" size={18} />
                  <span>Wijzigingen opgeslagen.</span>
                </div>
              )}
              <form className="py-account-form" onSubmit={e => { e.preventDefault(); setSaved(true); setEditMode(false); }}>
                <div className="py-account-section">
                  <div className="py-account-section__header">
                    <h3>Persoonlijke gegevens</h3>
                    {!editMode && <button type="button" className="py-edit-link" onClick={() => setEditMode(true)}>Wijzigen</button>}
                  </div>
                  <div className="py-account-grid">
                    <label>Voornaam<input defaultValue="Thomas" disabled={!editMode} /></label>
                    <label>Achternaam<input defaultValue="van der Berg" disabled={!editMode} /></label>
                    <label>E-mailadres<input defaultValue={PY_MOCK_USER.email} disabled={!editMode} /></label>
                    <label>Telefoonnummer<input defaultValue={PY_MOCK_USER.phone} disabled={!editMode} /></label>
                  </div>
                </div>

                <div className="py-account-section">
                  <h3>Voertuig</h3>
                  <div className="py-account-grid">
                    <label>Kenteken<input defaultValue={PY_MOCK_USER.kenteken} disabled={!editMode} /></label>
                    <label>Voertuigtype<select disabled={!editMode}><option>Personenwagen</option><option>SUV/Crossover</option><option>Bestelwagen</option><option>Elektrisch voertuig</option></select></label>
                  </div>
                </div>

                <div className="py-account-section">
                  <h3>Notificaties</h3>
                  <div className="py-account-toggles">
                    {[
                      ['Reserveringsbevestigingen', true],
                      ['Evenementenalerts', true],
                      ['You-punten updates', false],
                      ['Nieuwsbrief & aanbiedingen', false],
                    ].map(([label, def]) => (
                      <label key={label} className="py-toggle-row">
                        <span>{label}</span>
                        <input type="checkbox" defaultChecked={def} disabled={!editMode} />
                        <span className="py-toggle-switch" />
                      </label>
                    ))}
                  </div>
                </div>

                {editMode && (
                  <div className="py-account-save-row">
                    <PYButton type="submit" variant="primary">Wijzigingen opslaan</PYButton>
                    <PYButton type="button" variant="outline" icon="x" onClick={() => setEditMode(false)}>Annuleren</PYButton>
                  </div>
                )}
              </form>

              <div className="py-account-danger">
                <h3>Account beheer</h3>
                <div className="py-danger-actions">
<button className="py-danger-link" onClick={() => alert('In een echte app zou je hier je wachtwoord kunnen wijzigen.')}>Wachtwoord wijzigen</button>
                <button className="py-danger-link" onClick={() => { if(confirm('Weet je zeker dat je je account wilt verwijderen?')) { auth.logout && auth.logout(); } }}>Account verwijderen</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const PYReservationRow = ({ reservation, actions = false, past = false }) => (
  <div className={`py-reservation-row ${past ? 'py-reservation-row--past' : ''}`}>
    <div className="py-reservation-row__icon">
      <PYIcon name="car" size={18} />
    </div>
    <div className="py-reservation-row__info">
      <strong>{reservation.garage}</strong>
      <span>{reservation.city} · {reservation.kenteken}</span>
    </div>
    <div className="py-reservation-row__date">
      <strong>{reservation.date}</strong>
      <span>{reservation.time}</span>
    </div>
    <div className="py-reservation-row__price">€ {reservation.price}</div>
    <div className="py-reservation-row__actions">
      {!past && actions && (
        <PYButton variant="outline" icon="x">Annuleren</PYButton>
      )}
      {past && (
        <PYButton variant="ghost" icon="arrow">Bewijs</PYButton>
      )}
    </div>
  </div>
);

Object.assign(window, { PYDashboardPage, PYReservationRow });
