const useHashRoute = () => {
  const getRoute = () => {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    return { path, query: new URLSearchParams(query) };
  };

  const [route, setRoute] = React.useState(getRoute);

  React.useEffect(() => {
    const onHash = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return route;
};

// Login page component
const PYLoginPage = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate login delay
    setTimeout(() => {
      // Demo credentials: any email with password "demo" or just click login
      if (email && (password === 'demo' || password.length >= 4)) {
        onLogin();
        window.location.hash = '#/dashboard';
      } else {
        setError('Vul een geldig e-mailadres in en een wachtwoord van minimaal 4 tekens.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <main>
      <section className="py-page-hero" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="py-container" style={{ maxWidth: 480, paddingTop: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <PYLogo />
          </div>
          <div className="py-contact-form" style={{ padding: 32 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 28 }}>Inloggen</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--py-muted)' }}>Log in op je ParkingYou account om je reserveringen en producten te beheren.</p>
            
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--py-radius)', background: '#fff0f0', border: '1px solid #f5c3c3', color: '#b83232', marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'grid', gap: 7, marginBottom: 14, fontWeight: 700, fontSize: 14, color: 'var(--py-text)' }}>
                E-mailadres
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="jij@voorbeeld.nl" 
                  required
                  style={{ border: '1px solid var(--py-line)', borderRadius: 'var(--py-radius)', padding: '13px 14px', color: 'var(--py-blue)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 7, marginBottom: 14, fontWeight: 700, fontSize: 14, color: 'var(--py-text)' }}>
                Wachtwoord
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Je wachtwoord" 
                  required
                  style={{ border: '1px solid var(--py-line)', borderRadius: 'var(--py-radius)', padding: '13px 14px', color: 'var(--py-blue)' }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--py-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--py-blue)' }} />
                  Onthoud mij
                </label>
                <a href="#" style={{ fontSize: 14, color: 'var(--py-blue)', fontWeight: 700 }}>Wachtwoord vergeten?</a>
              </div>
              <PYButton type="submit" variant="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Bezig met inloggen...' : 'Inloggen'}
              </PYButton>
            </form>
            
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--py-line)', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--py-muted)', fontSize: 14 }}>
                Nog geen account? <a href="#/register" style={{ color: 'var(--py-blue)', fontWeight: 700 }}>Registreer hier</a>
              </p>
            </div>
            
            <div style={{ marginTop: 20, padding: 16, background: 'var(--py-paper)', borderRadius: 'var(--py-radius)', fontSize: 13 }}>
              <strong style={{ color: 'var(--py-blue)' }}>Demo tip:</strong>
              <span style={{ color: 'var(--py-muted)' }}> Gebruik een willekeurig e-mailadres en wachtwoord "demo" of minimaal 4 tekens.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// Register page component
const PYRegisterPage = ({ onLogin }) => {
  const [formData, setFormData] = React.useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirm) {
      setError('Wachtwoorden komen niet overeen.');
      setLoading(false);
      return;
    }
    
    setTimeout(() => {
      onLogin();
      window.location.hash = '#/dashboard';
      setLoading(false);
    }, 800);
  };

  return (
    <main>
      <section className="py-page-hero" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="py-container" style={{ maxWidth: 480, paddingTop: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <PYLogo />
          </div>
          <div className="py-contact-form" style={{ padding: 32 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 28 }}>Account aanmaken</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--py-muted)' }}>Maak een gratis ParkingYou account aan en begin met parkeren.</p>
            
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--py-radius)', background: '#fff0f0', border: '1px solid #f5c3c3', color: '#b83232', marginBottom: 16, fontSize: 14 }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'grid', gap: 7, marginBottom: 14, fontWeight: 700, fontSize: 14, color: 'var(--py-text)' }}>
                Volledige naam
                <input 
                  value={formData.name} 
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                  placeholder="Voor- en achternaam" 
                  required
                  style={{ border: '1px solid var(--py-line)', borderRadius: 'var(--py-radius)', padding: '13px 14px', color: 'var(--py-blue)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 7, marginBottom: 14, fontWeight: 700, fontSize: 14, color: 'var(--py-text)' }}>
                E-mailadres
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} 
                  placeholder="jij@voorbeeld.nl" 
                  required
                  style={{ border: '1px solid var(--py-line)', borderRadius: 'var(--py-radius)', padding: '13px 14px', color: 'var(--py-blue)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 7, marginBottom: 14, fontWeight: 700, fontSize: 14, color: 'var(--py-text)' }}>
                Wachtwoord
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} 
                  placeholder="Minimaal 4 tekens" 
                  required
                  minLength={4}
                  style={{ border: '1px solid var(--py-line)', borderRadius: 'var(--py-radius)', padding: '13px 14px', color: 'var(--py-blue)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 7, marginBottom: 20, fontWeight: 700, fontSize: 14, color: 'var(--py-text)' }}>
                Bevestig wachtwoord
                <input 
                  type="password" 
                  value={formData.confirm} 
                  onChange={e => setFormData(f => ({ ...f, confirm: e.target.value }))} 
                  placeholder="Herhaal je wachtwoord" 
                  required
                  style={{ border: '1px solid var(--py-line)', borderRadius: 'var(--py-radius)', padding: '13px 14px', color: 'var(--py-blue)' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, fontSize: 13, color: 'var(--py-muted)', cursor: 'pointer' }}>
                <input type="checkbox" required style={{ accentColor: 'var(--py-blue)', marginTop: 2 }} />
                <span>Ik ga akkoord met de <a href="#" style={{ color: 'var(--py-blue)' }}>algemene voorwaarden</a> en het <a href="#" style={{ color: 'var(--py-blue)' }}>privacybeleid</a>.</span>
              </label>
              <PYButton type="submit" variant="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Account aanmaken...' : 'Account aanmaken'}
              </PYButton>
            </form>
            
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--py-line)', textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--py-muted)', fontSize: 14 }}>
                Al een account? <a href="#/login" style={{ color: 'var(--py-blue)', fontWeight: 700 }}>Log hier in</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const PYHomePage = () => (
  <main>
    <PYHero />
    <PYProductChooser />
    <PYGarages />
    <PYBenefits />
    <PYCityStrip />
    <PYAppCallout />
    <PYHowItWorks />
    <PYBannerCTA />
    <PYFAQ compact />
  </main>
);

const PYRouter = ({ route, auth }) => {
  if (route.path.startsWith('/garages/')) {
    return <PYGarageDetailPage id={route.path.split('/')[2]} />;
  }
  if (route.path.startsWith('/evenementen/')) {
    return <PYEventDetailPage id={route.path.split('/')[2]} />;
  }

  switch (route.path) {
    case '/':
      return <PYHomePage />;
    case '/garages':
      return <PYGaragesPage queryCity={route.query.get('city') || ''} />;
    case '/reserveren':
      return <PYReservationWizardPage />;
    case '/evenementen':
      return <PYEventsPage />;
    case '/dashboard':
      return auth.isLoggedIn ? <PYDashboardPage auth={auth} /> : <PYLoginPage onLogin={auth.login} />;
    case '/login':
      return auth.isLoggedIn ? (() => { window.location.hash = '#/dashboard'; return null; })() : <PYLoginPage onLogin={auth.login} />;
    case '/register':
      return auth.isLoggedIn ? (() => { window.location.hash = '#/dashboard'; return null; })() : <PYRegisterPage onLogin={auth.login} />;
    case '/abonnementen':
      return <PYSubscriptionsPage />;
    case '/parkingpass':
    case '/strippenkaarten':
      return <PYParkingPassPage />;
    case '/app':
      return <PYAppPage />;
    case '/zakelijk':
      return <PYBusinessPage />;
    case '/over':
    case '/over/parkingyou':
      return <PYAboutPage />;
    case '/campagnes/glow':
      return <PYGlowPage />;
    case '/support':
      return <PYSupportPage />;
    default:
      return <PYHomePage />;
  }
};

const PYApp = () => {
  const route = useHashRoute();
  const auth = useAuth();
  
  return (
    <PYToastProvider>
      <AuthContext.Provider value={auth}>
        <PYHeader route={route.path} auth={auth} />
        <PYRouter route={route} auth={auth} />
        <PYFooter />
      </AuthContext.Provider>
    </PYToastProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PYApp />);
