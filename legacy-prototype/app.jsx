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

const PYRouter = ({ route }) => {
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
      return <PYDashboardPage />;
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
  return (
    <>
      <PYHeader route={route.path} />
      <PYRouter route={route} />
      <PYFooter />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PYApp />);
