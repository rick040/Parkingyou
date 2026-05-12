const PY_BLUE = '#374e9d';
const PY_DEEP = '#0d142e';
const PY_AQUA = '#79cadc';
const PY_ORANGE = '#ee7d2c';

const PY_GARAGES = [
  {
    id: 'dll-parkeerdek',
    name: 'Parking DLL parkeerdek',
    city: 'Eindhoven',
    address: 'Centrum Eindhoven',
    price: 2.5,
    dayPrice: '2,50',
    distance: '4 min lopen naar centrum',
    tags: ['Reserveren', 'Inrijden', 'Centrum'],
    features: ['Voordelig parkeren', 'Online reserveren', 'Midden in de stad'],
    spaces: 92,
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?auto=format&fit=crop&w=1200&q=85',
    description: 'Een centrale keuze voor Eindhoven: snel parkeren, korte loopafstand en duidelijke tarieven.',
    subscriptions: false,
    pass: true,
    reservable: true,
    locationType: 'Parkeerterrein',
    entryHeight: '4.50 m (open terrein)',
    facilities: ['Laadpalen (4x)', 'Cameratoezicht', 'Verlichting', 'Betaalterminal', 'Rolstoeltoegankelijk'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '1,25' },
      { label: 'Dagtarief zonder reservering', price: '12,00' },
      { label: 'Dagtarief met reservering', price: '10,00' },
      { label: 'Vroegboekkorting (vóór 09:00)', price: '8,00' },
      { label: 'Avondtarief (na 18:00)', price: '5,00' },
    ],
    hours: { open247: false, weekdays: '06:00 – 23:00', saturday: '07:00 – 23:00', sunday: '09:00 – 22:00' },
    pois: [
      { name: 'Eindhoven Centrum', type: 'Winkelgebied', distance: '4 min lopen' },
      { name: 'Heuvel Galerie', type: 'Shopping', distance: '6 min lopen' },
      { name: 'Stationsplein', type: 'OV Hub', distance: '10 min lopen' },
    ],
    strippenkaart: true,
    waardekaart: true,
  },
  {
    id: 'philips-bedrijfsschool',
    name: 'Parking Philips Bedrijfsschool',
    city: 'Eindhoven',
    address: 'Kastanjelaan 400',
    price: 1.5,
    dayPrice: '1,50',
    distance: '10 min lopen naar centrum',
    tags: ['Abonnementen', '24/7', 'Inrijden'],
    features: ['Maandabonnement', '24/7 geopend', 'Rustige looproute'],
    spaces: 138,
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=85',
    description: 'Voor wie vaak in Eindhoven parkeert en een vaste, voordelige plek zoekt.',
    subscriptions: true,
    pass: false,
    reservable: true,
    locationType: 'Parkeergarage',
    entryHeight: '2.30 m',
    facilities: ['Cameratoezicht', '24/7 toegang', 'Verlichting', 'Keycard toegang'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '0,75' },
      { label: 'Dagtarief', price: '8,00' },
      { label: 'Maandabonnement', price: 'Vanaf 49,00/mnd' },
      { label: 'Avondtarief (na 18:00)', price: '4,00' },
    ],
    hours: { open247: true },
    pois: [
      { name: 'High Tech Campus', type: 'Bedrijvenpark', distance: '5 min lopen' },
      { name: 'Eindhoven Centrum', type: 'Winkelgebied', distance: '10 min lopen' },
      { name: 'Strijp-S', type: 'Cultuur & Horeca', distance: '15 min lopen' },
    ],
    strippenkaart: false,
    waardekaart: true,
  },
  {
    id: 'philips-stadion',
    name: 'Philips Stadion',
    city: 'Eindhoven',
    address: 'Frederiklaan 10',
    price: 5,
    dayPrice: '5',
    distance: '8 min lopen naar centrum',
    tags: ['Reserveerbaar', '24/7', 'Events'],
    features: ['Kentekenherkenning', 'Online reserveren', 'Dicht bij Strijp-S'],
    spaces: 128,
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=85',
    description: 'Een slimme keuze voor PSV, Strijp-S en een dag Eindhoven. Reserveer vooraf en rij zonder ticketstress naar binnen.',
    subscriptions: true,
    pass: false,
    reservable: true,
    locationType: 'Parkeerterrein',
    entryHeight: '4.50 m (open terrein)',
    facilities: ['Cameratoezicht', 'Verlichting', 'Kentekenherkenning', 'Rolstoeltoegankelijk', 'Fietsenstalling'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App', 'Contant'],
    tariffs: [
      { label: 'Per 30 minuten', price: '2,50' },
      { label: 'Dagtarief zonder reservering', price: '15,00' },
      { label: 'Dagtarief met reservering', price: '12,00' },
      { label: 'Evenementtarief', price: '12,00' },
      { label: 'Avondtarief (na 18:00)', price: '8,00' },
      { label: 'Weekendtarief', price: '18,00' },
    ],
    hours: { open247: true },
    pois: [
      { name: 'Philips Stadion', type: 'Stadion', distance: '5 min lopen' },
      { name: 'Strijp-S', type: 'Cultuur & Horeca', distance: '8 min lopen' },
      { name: 'Eindhoven Centrum', type: 'Winkelgebied', distance: '12 min lopen' },
    ],
    strippenkaart: false,
    waardekaart: true,
  },
  {
    id: 'p1-carlton',
    name: 'P1 Carlton',
    city: 'Amsterdam',
    address: 'Vijzelstraat 4',
    price: 20,
    dayPrice: '20',
    distance: '3 min lopen naar de grachten',
    tags: ['Centrum', '2.1m hoogte', 'Cameratoezicht'],
    features: ['Contactloos betalen', 'Direct bij winkels', 'Avondtarief'],
    spaces: 74,
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=1200&q=85',
    description: 'Parkeer midden in Amsterdam zonder rondjes rijden. Ideaal voor een dag shoppen, museumbezoek of een zakelijke afspraak.',
    subscriptions: false,
    pass: false,
    reservable: true,
    locationType: 'Ondergrondse garage',
    entryHeight: '2.10 m',
    facilities: ['Cameratoezicht', 'Lift', 'Verlichting', 'Bewaking', 'Laadpalen (2x)', 'Betaalterminal'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App', 'Contactloos'],
    tariffs: [
      { label: 'Per 30 minuten', price: '4,00' },
      { label: 'Dagtarief (max 24u)', price: '35,00' },
      { label: 'Dagtarief met reservering', price: '28,00' },
      { label: 'Vroegboekkorting', price: '22,00' },
      { label: 'Avondtarief (na 19:00)', price: '14,00' },
      { label: 'Weekendtarief', price: '20,00' },
    ],
    hours: { open247: true },
    pois: [
      { name: 'Grachtengordel', type: 'Toerisme', distance: '3 min lopen' },
      { name: 'Rijksmuseum', type: 'Museum', distance: '12 min lopen' },
      { name: 'Kalverstraat', type: 'Shopping', distance: '5 min lopen' },
      { name: 'Leidseplein', type: 'Horeca & Cultuur', distance: '8 min lopen' },
    ],
    strippenkaart: false,
    waardekaart: true,
  },
  {
    id: 'p2-mandela',
    name: 'P2 Mandela',
    city: 'Eindhoven',
    address: 'Mandelaplein 1',
    price: 15,
    dayPrice: '15',
    distance: '1 min lopen naar station',
    tags: ['OV', 'EV-laden', 'Overdekt'],
    features: ['Laadpunten', 'Station naast de deur', 'App toegang'],
    spaces: 96,
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=85',
    description: 'Voor reizigers en citytrips: snel vanaf de ring, dichtbij het station en scherp geprijsd voor de hele dag.',
    subscriptions: true,
    pass: false,
    reservable: true,
    locationType: 'Parkeergarage',
    entryHeight: '2.30 m',
    facilities: ['Laadpalen (8x)', 'Lift', 'Cameratoezicht', 'Fietskluizen', 'OV-loket nabij', 'Rolstoeltoegankelijk'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '2,00' },
      { label: 'Dagtarief zonder reservering', price: '18,00' },
      { label: 'Dagtarief met reservering', price: '15,00' },
      { label: 'Vroegboekkorting (vóór 08:00)', price: '12,00' },
      { label: 'Avondtarief (na 18:00)', price: '8,00' },
      { label: 'P+R tarief (met OV-ticket)', price: '6,00' },
    ],
    hours: { open247: true },
    pois: [
      { name: 'Eindhoven Centraal', type: 'Treinstation', distance: '1 min lopen' },
      { name: 'Eindhoven Centrum', type: 'Winkelgebied', distance: '5 min lopen' },
      { name: 'Lichtplein', type: 'Horeca', distance: '3 min lopen' },
    ],
    strippenkaart: false,
    waardekaart: true,
  },
  {
    id: 'evoluon',
    name: 'Parking Evoluon',
    city: 'Eindhoven',
    address: 'Noord Brabantlaan 1A',
    price: 2,
    dayPrice: '2',
    distance: '2 min lopen naar Evoluon',
    tags: ['Abonnementen', 'Museum', 'Inrijden'],
    features: ['Naast Evoluon', 'Maandabonnement', 'Evenementproof'],
    spaces: 118,
    rating: '4.4',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=85',
    description: 'Parkeer vlakbij het Evoluon en Next Nature Museum, met opties voor frequente bezoekers.',
    subscriptions: true,
    pass: true,
    reservable: true,
    locationType: 'Parkeerterrein',
    entryHeight: '4.50 m (open terrein)',
    facilities: ['Laadpalen (2x)', 'Cameratoezicht', 'Verlichting', 'Betaalterminal'],
    paymentMethods: ['iDEAL', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '1,00' },
      { label: 'Dagtarief', price: '8,00' },
      { label: 'Evenementtarief', price: '6,00' },
      { label: 'Maandabonnement', price: 'Vanaf 39,00/mnd' },
    ],
    hours: { open247: false, weekdays: '07:00 – 22:00', saturday: '08:00 – 22:00', sunday: '10:00 – 20:00' },
    pois: [
      { name: 'Evoluon Museum', type: 'Museum', distance: '2 min lopen' },
      { name: 'Next Nature Museum', type: 'Museum', distance: '3 min lopen' },
      { name: 'Drents Dorp', type: 'Woonwijk', distance: '5 min lopen' },
    ],
    strippenkaart: true,
    waardekaart: true,
  },
  {
    id: 'stadskantoor',
    name: 'Parking Stadskantoor',
    city: 'Den Haag',
    address: 'Spui 70',
    price: 12,
    dayPrice: '12',
    distance: '5 min lopen naar centrum',
    tags: ['Binnenstad', 'Weekenddeal', 'Gezinsproof'],
    features: ['Ruime plekken', 'Weekendtarief', 'Lift aanwezig'],
    spaces: 112,
    rating: '4.4',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=85',
    description: 'Dicht bij winkels, horeca en theaters. Betaal vooraf of rij gewoon binnen met je kenteken.',
    subscriptions: true,
    pass: false,
    reservable: false,
    locationType: 'Parkeergarage',
    entryHeight: '2.20 m',
    facilities: ['Lift', 'Cameratoezicht', 'Verlichting', 'Rolstoeltoegankelijk', 'Betaalterminal'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '2,50' },
      { label: 'Dagtarief', price: '18,00' },
      { label: 'Weekendtarief', price: '12,00' },
      { label: 'Avondtarief (na 18:00)', price: '8,00' },
      { label: 'Maandabonnement', price: 'Vanaf 69,00/mnd' },
    ],
    hours: { open247: false, weekdays: '07:00 – 23:00', saturday: '08:00 – 01:00', sunday: '09:00 – 22:00' },
    pois: [
      { name: 'Den Haag Centrum', type: 'Winkelgebied', distance: '5 min lopen' },
      { name: 'Binnenhof', type: 'Cultuur', distance: '7 min lopen' },
      { name: 'Theater aan het Spui', type: 'Theater', distance: '2 min lopen' },
    ],
    strippenkaart: false,
    waardekaart: true,
  },
  {
    id: 'havenkwartier',
    name: 'Havenkwartier',
    city: 'Rotterdam',
    address: 'Wijnhaven 88',
    price: 10,
    dayPrice: '10',
    distance: '6 min lopen naar Markthal',
    tags: ['Waterfront', 'Zakelijk', '24/7'],
    features: ['Nachtopenstelling', 'Zakelijke factuur', 'Beveiligd'],
    spaces: 83,
    rating: '4.3',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=85',
    description: 'Parkeer aan de rand van de drukte en wandel zo de binnenstad in. Handig voor kantoor, horeca en avond uit.',
    subscriptions: true,
    pass: true,
    reservable: true,
    locationType: 'Parkeergarage',
    entryHeight: '2.10 m',
    facilities: ['Cameratoezicht', 'Bewaking', 'Lift', 'Laadpalen (2x)', 'Betaalterminal'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App', 'Factuur (zakelijk)'],
    tariffs: [
      { label: 'Per 30 minuten', price: '2,00' },
      { label: 'Dagtarief', price: '16,00' },
      { label: 'Dagtarief met reservering', price: '13,00' },
      { label: 'Avondtarief (na 18:00)', price: '8,00' },
      { label: 'Weekendtarief', price: '10,00' },
      { label: 'Maandabonnement', price: 'Vanaf 59,00/mnd' },
    ],
    hours: { open247: true },
    pois: [
      { name: 'Markthal Rotterdam', type: 'Markt & Eten', distance: '6 min lopen' },
      { name: 'Cube Houses', type: 'Architectuur', distance: '7 min lopen' },
      { name: 'Rotterdam Centraal', type: 'Treinstation', distance: '12 min lopen' },
    ],
    strippenkaart: true,
    waardekaart: true,
  },
  {
    id: 'centrum-oost',
    name: 'Centrum Oost',
    city: 'Haarlem',
    address: 'Papentorenvest 41',
    price: 9,
    dayPrice: '9',
    distance: '7 min lopen naar Grote Markt',
    tags: ['Dagkaart', 'Rustig', 'Familie'],
    features: ['Dagkaart voordeel', 'Kinderwagenvriendelijk', 'Snel vanaf N200'],
    spaces: 61,
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=85',
    description: 'Een prettige garage net buiten de drukste straten. Perfect voor een ontspannen dag Haarlem.',
    subscriptions: false,
    pass: false,
    reservable: false,
    locationType: 'Parkeergarage',
    entryHeight: '2.20 m',
    facilities: ['Verlichting', 'Betaalterminal', 'Rolstoeltoegankelijk', 'Kinderwagenplek'],
    paymentMethods: ['iDEAL', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '1,50' },
      { label: 'Dagtarief', price: '12,00' },
      { label: 'Weekendtarief', price: '9,00' },
      { label: 'Avondtarief (na 18:00)', price: '5,00' },
    ],
    hours: { open247: false, weekdays: '07:00 – 22:00', saturday: '08:00 – 22:00', sunday: '10:00 – 20:00' },
    pois: [
      { name: 'Grote Markt Haarlem', type: 'Centrum', distance: '7 min lopen' },
      { name: 'Frans Hals Museum', type: 'Museum', distance: '10 min lopen' },
      { name: 'Haarlem Shopping', type: 'Shopping', distance: '8 min lopen' },
    ],
    strippenkaart: false,
    waardekaart: false,
  },
  {
    id: 'hofplein',
    name: 'Parking Hofplein',
    city: 'Rotterdam',
    address: 'Hofplein 20',
    price: 4,
    dayPrice: '4',
    distance: '8 min lopen naar centrum',
    tags: ['Reserveren', 'Abonnementen', 'Inrijden'],
    features: ['Goedkoop in Rotterdam', 'Zakelijke factuur', 'Online reserveren'],
    spaces: 146,
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1519302959554-a75be0afc82a?auto=format&fit=crop&w=1200&q=85',
    description: 'Een voordelige Rotterdamse centrumlocatie voor reserveringen en abonnementen.',
    subscriptions: true,
    pass: true,
    reservable: true,
    locationType: 'Ondergrondse garage',
    entryHeight: '2.00 m',
    facilities: ['Lift', 'Cameratoezicht', 'Verlichting', 'Betaalterminal', 'Laadpalen (4x)'],
    paymentMethods: ['iDEAL', 'Creditcard', 'PIN', 'ParkingYou App', 'Factuur (zakelijk)'],
    tariffs: [
      { label: 'Per 30 minuten', price: '1,00' },
      { label: 'Dagtarief', price: '10,00' },
      { label: 'Dagtarief met reservering', price: '8,00' },
      { label: 'Vroegboekkorting', price: '6,00' },
      { label: 'Avondtarief (na 18:00)', price: '4,00' },
      { label: 'Maandabonnement', price: 'Vanaf 45,00/mnd' },
    ],
    hours: { open247: true },
    pois: [
      { name: 'Rotterdam Centrum', type: 'Winkelgebied', distance: '8 min lopen' },
      { name: 'Erasmus MC', type: 'Ziekenhuis', distance: '10 min lopen' },
      { name: 'Koopgoot', type: 'Shopping', distance: '10 min lopen' },
    ],
    strippenkaart: true,
    waardekaart: true,
  },
  {
    id: 'bos-en-lommer',
    name: 'Bos en Lommerplantsoen',
    city: 'Amsterdam',
    address: 'Bos en Lommerplantsoen',
    price: 4,
    dayPrice: '4',
    distance: 'OV dichtbij',
    tags: ['Reserveren', 'Abonnementen', 'Inrijden'],
    features: ['Voordelig Amsterdam', 'ParkingPass', 'Reserveerbaar'],
    spaces: 102,
    rating: '4.4',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=85',
    description: 'Voordelig parkeren in Amsterdam Nieuw-West, handig voor bezoekers en veelparkeerders.',
    subscriptions: true,
    pass: true,
    reservable: true,
    locationType: 'Parkeerterrein',
    entryHeight: '4.50 m (open terrein)',
    facilities: ['Cameratoezicht', 'Verlichting', 'Betaalterminal', 'OV nabij'],
    paymentMethods: ['iDEAL', 'PIN', 'ParkingYou App'],
    tariffs: [
      { label: 'Per 30 minuten', price: '1,00' },
      { label: 'Dagtarief', price: '8,00' },
      { label: 'Dagtarief met reservering', price: '6,50' },
      { label: 'Maandabonnement', price: 'Vanaf 39,00/mnd' },
    ],
    hours: { open247: false, weekdays: '06:00 – 23:00', saturday: '07:00 – 23:00', sunday: '08:00 – 22:00' },
    pois: [
      { name: 'Sloterplas', type: 'Recreatie', distance: '5 min lopen' },
      { name: 'Bos en Lommer', type: 'Wijk', distance: '2 min lopen' },
      { name: 'Metro Lelylaan', type: 'OV', distance: '4 min lopen' },
    ],
    strippenkaart: true,
    waardekaart: false,
  },
];

const PY_CITIES = ['Alle steden', ...Array.from(new Set(PY_GARAGES.map(g => g.city)))];

const PY_EVENTS = [
  {
    id: 'glow-2025',
    name: 'GLOW Eindhoven 2025',
    tagline: 'Officieel parkeerpartner van het lichtfestival',
    city: 'Eindhoven',
    type: 'Festival',
    typeColor: 'orange',
    dates: '8 t/m 16 november 2025',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85',
    garageIds: ['philips-stadion', 'p2-mandela', 'dll-parkeerdek'],
    price: '12',
    description: 'GLOW Eindhoven is hét lichtfestival van Nederland. Elk jaar transformeert de binnenstad tot een magisch spektakel van licht en kunst. ParkingYou is officieel parkeerpartner en biedt gegarandeerde plekken op loopafstand van de route.',
    ticketTypes: [
      { id: 'weekend', name: 'Weekend dag', price: '15', description: 'Zaterdag of zondag, hele dag' },
      { id: 'avond', name: 'Avond na 18:00', price: '12', description: 'Door de week of weekend, avond' },
    ],
    highlights: ['Officieel parkeerpartner GLOW Eindhoven', 'Locaties op loopafstand van de route', 'Zekerheid door vooraf reserveren', 'Inclusief festivalkaart-korting'],
    dateOptions: ['Zaterdag 8 nov', 'Zondag 9 nov', 'Maandag 10 nov', 'Dinsdag 11 nov', 'Vrijdag 14 nov', 'Zaterdag 15 nov', 'Zondag 16 nov'],
  },
  {
    id: 'psv-seizoen',
    name: 'PSV Eindhoven Thuiswedstrijden',
    tagline: 'Officieel parkeerpartner van PSV',
    city: 'Eindhoven',
    type: 'Sport',
    typeColor: 'blue',
    dates: 'Eredivisie seizoen 2025',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=85',
    garageIds: ['philips-stadion', 'p2-mandela'],
    price: '12',
    description: 'Parkeer zorgeloos bij de thuiswedstrijden van PSV Eindhoven. Reserveer vooraf en loop in 5 minuten naar de hoofdingang van Philips Stadion.',
    ticketTypes: [
      { id: 'wedstrijd', name: 'Wedstrijddag', price: '12', description: 'Inclusief 2 uur voor aanvang' },
      { id: 'seizoen', name: 'Seizoenspas parkeren', price: '180', description: 'Alle thuiswedstrijden 2025' },
    ],
    highlights: ['Officieel PSV parkeerpartner', '5 min lopen naar hoofdingang', 'Reserveer en skip de rij', 'Seizoenspas beschikbaar'],
    dateOptions: ['Za 18 jan – PSV vs Ajax', 'Zo 2 feb – PSV vs Feyenoord', 'Zo 16 feb – PSV vs AZ', 'Zo 2 mrt – PSV vs Utrecht', 'Za 22 mrt – PSV vs NEC'],
  },
  {
    id: 'markthal-rotterdam',
    name: 'Weekend Markt Markthal Rotterdam',
    tagline: 'Voordelig parkeren bij de beroemdste markthal van NL',
    city: 'Rotterdam',
    type: 'Markt',
    typeColor: 'aqua',
    dates: 'Elk weekend',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
    garageIds: ['havenkwartier', 'hofplein'],
    price: '10',
    description: 'Bezoek de Markthal in Rotterdam en parkeer voordelig bij ParkingYou-locaties op korte loopafstand. In het weekend geldt een speciaal weekendtarief.',
    ticketTypes: [
      { id: 'dag', name: 'Dagtarief weekend', price: '10', description: 'Hele dag parkeren' },
      { id: 'kort', name: 'Kort bezoek (3 uur)', price: '6', description: 'Tot 3 uur parkeren' },
    ],
    highlights: ['6 min lopen naar de Markthal', 'Speciaal weekendtarief', 'Ruim 200 plekken beschikbaar'],
    dateOptions: ['Zaterdag', 'Zondag'],
  },
  {
    id: 'amsterdam-museumweekend',
    name: 'Amsterdam Museumweekend',
    tagline: 'Rijksmuseum, Van Gogh Museum en meer',
    city: 'Amsterdam',
    type: 'Cultuur',
    typeColor: 'blue',
    dates: '14–16 maart 2025',
    image: 'https://images.unsplash.com/photo-1567449303078-57ad995bd17f?auto=format&fit=crop&w=1200&q=85',
    garageIds: ['p1-carlton', 'bos-en-lommer'],
    price: '22',
    description: 'Elk jaar geniet Amsterdam van het Museumweekend: gratis toegang tot tientallen musea. ParkingYou zorgt dat je zonder parkeerstress kunt genieten.',
    ticketTypes: [
      { id: 'dag', name: 'Dagtarief centrum', price: '22', description: 'Hele dag parkeren in het centrum' },
      { id: 'avond', name: 'Avondtarief', price: '14', description: 'Parkeren na 18:00' },
    ],
    highlights: ['Midden in het museumkwartier', 'Gegarandeerde plek bij reservering', 'Ideaal voor gezinnen'],
    dateOptions: ['Vrijdag 14 maart', 'Zaterdag 15 maart', 'Zondag 16 maart'],
  },
  {
    id: 'kerstmarkt-den-haag',
    name: 'Kerstmarkt Den Haag',
    tagline: 'Sfeer & lichtjes in de Hofstad',
    city: 'Den Haag',
    type: 'Markt',
    typeColor: 'orange',
    dates: '15–24 december 2025',
    image: 'https://images.unsplash.com/photo-1482402668576-5a4f3f50e0a4?auto=format&fit=crop&w=1200&q=85',
    garageIds: ['stadskantoor'],
    price: '8',
    description: 'De kerstmarkt van Den Haag is een van de sfeervolste van Nederland. Parking Stadskantoor ligt op 5 minuten loopafstand en heeft een speciaal avondtarief.',
    ticketTypes: [
      { id: 'avond', name: 'Avondtarief (na 17:00)', price: '8', description: 'Ideaal voor een avondje uit' },
      { id: 'dag', name: 'Dagtarief', price: '12', description: 'Hele dag parkeren' },
    ],
    highlights: ['5 min lopen naar de kerstmarkt', 'Speciaal avondtarief', 'Ideaal voor gezinnen & koppels'],
    dateOptions: ['15 dec', '16 dec', '17 dec', '18 dec', '19 dec', '20 dec', '21 dec', '22 dec', '23 dec', '24 dec'],
  },
];

const PY_PRODUCTS = [
  { id: 'direct', title: 'Direct parkeren', body: 'Voor bezoekers die vandaag een plek willen. Zoek, reserveer en rij binnen met kentekenherkenning.', href: '#/reserveren', icon: 'car' },
  { id: 'subscription', title: 'Abonnementen', body: 'Voor wie vaak bij dezelfde locatie parkeert. Minimaal 3 maanden, daarna maandelijks opzegbaar.', href: '#/abonnementen', icon: 'calendar' },
  { id: 'pass', title: 'ParkingPass', body: 'Voor veelparkeerders die flexibel blijven. Kies 10 of 25 parkeeracties en gebruik je code online.', href: '#/parkingpass', icon: 'card' },
  { id: 'events', title: 'Evenementen', body: 'Parkeer slim bij GLOW, PSV en andere evenementen. Vooraf reserveren = gegarandeerde plek.', href: '#/evenementen', icon: 'ticket' },
];

const PY_FAQS = [
  ['Moet ik vooraf reserveren?', 'Nee. Je kunt bij veel locaties gewoon binnenrijden. Reserveren is handig op drukke dagen en vaak voordeliger.'],
  ['Hoe werkt in- en uitrijden?', 'Na je reservering koppelen we je kenteken aan de slagboom. Je rijdt binnen, parkeert en rijdt later weer uit zonder papieren ticket.'],
  ['Kan ik een factuur krijgen?', 'Ja. In je account vind je reserveringen, betaalbewijzen en zakelijke facturen per locatie.'],
  ['Wat als ik later terug ben?', 'In de app kun je je sessie verlengen wanneer de garage dat ondersteunt. Anders betaal je het verschil bij vertrek.'],
  ['Zijn alle garages 24/7 open?', 'De meeste locaties zijn 24/7 open. De exacte tijden staan altijd op de locatiepagina en in je reservering.'],
  ['Wat is een Waardekaart?', 'Met een ParkingYou Waardekaart laad je een tegoed op dat je kunt inzetten bij deelnemende locaties. Ideaal voor zakelijk gebruik.'],
  ['Wat zijn You-punten?', 'Je verdient You-punten bij elke reservering en parkeeractie. Punten zijn inwisselbaar voor gratis parkeren of kortingen.'],
];

const PYIcon = ({ name, size = 20, stroke = 1.9, color = 'currentColor', className = '' }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    card: <><rect x="2.5" y="6" width="19" height="13" rx="2.5" /><path d="M2.5 11h19M6 15h3" /></>,
    car: <><path d="M5 16h14M7 16v3M17 16v3M4 12l2.2-5.2A3 3 0 0 1 9 5h6a3 3 0 0 1 2.8 1.8L20 12" /><path d="M5 12h14v4H5z" /><circle cx="8" cy="14" r="1" /><circle cx="16" cy="14" r="1" /></>,
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    x: <><path d="M18 6 6 18M6 6l12 12" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m6 9 6 6 6-6" />,
    check: <path d="M20 6 9 17l-5-5" />,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" />,
    ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" /><path d="M13 5v2M13 17v2M13 11v2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
    star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    wallet: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 12h.01M2 10h20" /></>,
    ev: <><path d="M7 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" /><path d="M9 17v2m6-2v2M12 5v4" /><path d="m9 9 3-4 3 4" /></>,
    elevator: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 10h6M9 14h6" /><path d="m12 6-2 2 2-2 2 2" /></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
    map: <><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><path d="M9 3v15M15 6v15" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
    trending: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
    bicycle: <><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 0 0-1-1h-3L9 11l4 4 4-3-2-6Z" /><path d="m5.5 14 1.5-4.5L10 14" /></>,
    tag: <><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.29-8.29a1 1 0 0 0 0-1.42L12 2Z" /><path d="M7 7h.01" /></>,
  };

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const PYLogo = ({ inverted = false }) => (
  <span className={`py-logo ${inverted ? 'py-logo--inverted' : ''}`} aria-label="ParkingYou">
    <span className="py-logo__mark">P</span>
    <span>
      <strong>ParkingYou</strong>
      <small>The other way of parking</small>
    </span>
  </span>
);

const PYButton = ({ children, variant = 'primary', href, onClick, icon = 'arrow', type = 'button', className = '', disabled = false }) => {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} onClick={onClick} type={href ? undefined : type} disabled={disabled} className={`py-button py-button--${variant} ${className}`}>
      <span>{children}</span>
      {icon && <PYIcon name={icon} size={18} stroke={2.25} />}
    </Tag>
  );
};

const PYPriceBlob = ({ price, unit = 'per dag', tone = 'aqua' }) => (
  <span className={`py-price-blob py-price-blob--${tone}`}>
    <strong>EUR {price}</strong>
    <small>{unit}</small>
  </span>
);

const PYTag = ({ children, tone = 'light' }) => (
  <span className={`py-tag py-tag--${tone}`}>{children}</span>
);

const PYSectionIntro = ({ title, children, align = 'left', action }) => (
  <div className={`py-section-intro py-section-intro--${align}`}>
    <div>
      <h2 dangerouslySetInnerHTML={{ __html: title }} />
      {children && <p>{children}</p>}
    </div>
    {action}
  </div>
);

const PYMiniMap = ({ compact = false }) => (
  <div className={`py-mini-map ${compact ? 'py-mini-map--compact' : ''}`} aria-label="Kaart preview">
    <svg viewBox="0 0 520 420" preserveAspectRatio="none">
      <path d="M-20 90 C100 140 120 45 230 95 S400 135 550 75" />
      <path d="M-20 250 C120 310 170 210 275 260 S430 315 550 245" />
      <path d="M95 -20 C125 90 85 170 125 260 S150 345 130 450" />
      <path d="M365 -20 C330 110 395 195 350 315 S305 375 330 450" />
    </svg>
    {PY_GARAGES.slice(0, compact ? 4 : 6).map((g, index) => (
      <a key={g.id} href={`#/garages/${g.id}`} className={`py-map-pin py-map-pin--${index + 1}`} title={g.name}>
        <PYIcon name="pin" size={24} stroke={2.3} />
        {!compact && <span>{g.city}</span>}
      </a>
    ))}
  </div>
);

Object.assign(window, {
  PY_BLUE, PY_DEEP, PY_AQUA, PY_ORANGE,
  PY_GARAGES, PY_CITIES, PY_PRODUCTS, PY_FAQS, PY_EVENTS,
  PYIcon, PYLogo, PYButton, PYPriceBlob, PYTag, PYSectionIntro, PYMiniMap,
});
