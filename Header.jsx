const PYHeader = ({ route, auth = {} }) => {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [route]);
  
  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showUserMenu]);

  const nav = [
    ['Locaties', '#/garages'],
    ['Evenementen', '#/evenementen'],
    ['Abonnementen', '#/abonnementen'],
    ['ParkingPass', '#/parkingpass'],
    ['Zakelijk', '#/zakelijk'],
    ['Over ons', '#/over'],
  ];

  return (
    <header className={`py-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="py-container py-header__inner">
        <a href="#/" className="py-header__brand"><PYLogo /></a>
        <nav className="py-header__nav" aria-label="Hoofdmenu">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className={route === href.replace('#', '') ? 'is-active' : ''}>{label}</a>
          ))}
        </nav>
        <div className="py-header__actions">
          <a className="py-header__phone" href="tel:0854011647">
            <PYIcon name="phone" size={16} />
            <span>085 4011647</span>
          </a>
          {auth.isLoggedIn ? (
            <div style={{ position: 'relative' }}>
              <button 
                className="py-header__icon-btn" 
                title="Mijn account"
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(v => !v); }}
                style={{ background: 'var(--py-aqua)' }}
              >
                <PYIcon name="user" size={20} />
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  minWidth: 200,
                  background: 'white',
                  borderRadius: 'var(--py-radius)',
                  boxShadow: 'var(--py-shadow)',
                  border: '1px solid var(--py-line)',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--py-line)', background: 'var(--py-paper)' }}>
                    <strong style={{ display: 'block', fontSize: 14 }}>Thomas van der Berg</strong>
                    <span style={{ fontSize: 12, color: 'var(--py-muted)' }}>thomas@voorbeeld.nl</span>
                  </div>
                  <a href="#/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, fontWeight: 500, color: 'var(--py-text)' }}>
                    <PYIcon name="car" size={16} /> Mijn dashboard
                  </a>
                  <a href="#/reserveren" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, fontWeight: 500, color: 'var(--py-text)' }}>
                    <PYIcon name="calendar" size={16} /> Nieuwe reservering
                  </a>
                  <button 
                    onClick={() => auth.logout && auth.logout()}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10, 
                      padding: '12px 16px', 
                      width: '100%',
                      border: 0,
                      borderTop: '1px solid var(--py-line)',
                      background: 'transparent',
                      fontSize: 14, 
                      fontWeight: 700, 
                      color: '#b83232',
                      cursor: 'pointer'
                    }}
                  >
                    <PYIcon name="x" size={16} /> Uitloggen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="#/login" className="py-header__icon-btn" title="Inloggen">
              <PYIcon name="user" size={20} />
            </a>
          )}
          <PYButton href="#/reserveren" variant="primary">Direct reserveren</PYButton>
        </div>
        <button className="py-menu-button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Menu">
          <PYIcon name={open ? 'x' : 'menu'} size={28} stroke={2.3} />
        </button>
      </div>
      {open && (
        <div className="py-mobile-nav">
          {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          {auth.isLoggedIn ? (
            <>
              <a href="#/dashboard">Mijn dashboard</a>
              <button onClick={() => auth.logout && auth.logout()} style={{ border: 0, background: 'transparent', padding: '15px 0', borderBottom: '1px solid var(--py-line)', fontWeight: 700, color: '#b83232', textAlign: 'left' }}>Uitloggen</button>
            </>
          ) : (
            <a href="#/login">Inloggen</a>
          )}
          <PYButton href="#/reserveren" variant="primary">Direct reserveren</PYButton>
        </div>
      )}
    </header>
  );
};

Object.assign(window, { PYHeader });
