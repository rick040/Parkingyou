const PYHeader = ({ route }) => {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [route]);

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
          <a href="#/dashboard" className="py-header__icon-btn" title="Mijn account">
            <PYIcon name="user" size={20} />
          </a>
          <PYButton href="#/reserveren" variant="primary">Direct reserveren</PYButton>
        </div>
        <button className="py-menu-button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Menu">
          <PYIcon name={open ? 'x' : 'menu'} size={28} stroke={2.3} />
        </button>
      </div>
      {open && (
        <div className="py-mobile-nav">
          {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          <PYButton href="#/garages" variant="primary">Direct reserveren</PYButton>
        </div>
      )}
    </header>
  );
};

Object.assign(window, { PYHeader });
