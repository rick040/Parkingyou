-- =============================================================================
-- ParkingYou datalaag — SEED: testdata
-- =============================================================================
-- FICTIEVE DATA. Nooit in productie draaien.
--
-- Drie locaties, bewust zo gekozen dat de mijlpalen er direct op te oefenen zijn
-- zonder dat er één echt gegeven in het systeem staat:
--
--   LOC-001  exploitatie, twee contractpartijen (eigenaar + VvE), één daarvan
--            primair. Draait onder prognose -> toetst M1, M6 en de signaallus.
--   LOC-002  advies. Heeft per definitie geen omzet -> toetst dat het dashboard
--            en de signaallus dit type correct buiten beschouwing laten.
--   LOC-003  exploitatie, is in het verleden gewisseld van systeempartner
--            (IP Parking -> SKIDATA) -> toetst de historietabel uit correctie 2.
--
-- Draaien:  psql -f seed_testdata.sql   (na alle migraties + seed_referentiedata)
-- Opruimen: zie het blok onderaan dit bestand.
-- =============================================================================

do $$
declare
  v_host_zuid   uuid;
  v_host_noord  uuid;
  v_eigenaar    uuid;
  v_vve         uuid;
  v_gemeente    uuid;
  v_abonnee_1   uuid;
  v_abonnee_2   uuid;
  v_con_1       uuid;
  v_con_3       uuid;
  v_loc_1       uuid;
  v_loc_2       uuid;
  v_loc_3       uuid;
  v_app_1       uuid;
  v_abo_1       uuid;
  v_storing_1   uuid;
  v_campagne_1  uuid;
  v_kennis_1    uuid;
begin

  -- ---------------------------------------------------------------------------
  -- Team
  -- ---------------------------------------------------------------------------
  insert into public.medewerker (voornaam, achternaam, functie, is_parkeerhost, regio, email)
  values ('Sanne', 'de Groot', 'Parkeerhost', true, 'Zuid', 'sanne.testdata@example.invalid')
  returning id into v_host_zuid;

  insert into public.medewerker (voornaam, achternaam, functie, is_parkeerhost, regio, email)
  values ('Joris', 'Hendriks', 'Parkeerhost', true, 'Noord', 'joris.testdata@example.invalid')
  returning id into v_host_noord;

  -- ---------------------------------------------------------------------------
  -- Relaties
  -- ---------------------------------------------------------------------------
  insert into public.relatie (naam, is_organisatie, email, plaats)
  values ('Vastgoedpartij Testerhof B.V.', true, 'beheer.testdata@example.invalid', 'Eindhoven')
  returning id into v_eigenaar;

  insert into public.relatie (naam, is_organisatie, email, plaats)
  values ('VvE Testerhof', true, 'vve.testdata@example.invalid', 'Eindhoven')
  returning id into v_vve;

  insert into public.relatie (naam, is_organisatie, email, plaats)
  values ('Gemeente Voorbeeldstad', true, 'parkeren.testdata@example.invalid', 'Voorbeeldstad')
  returning id into v_gemeente;

  insert into public.relatie (naam, is_organisatie, email, iban, tenaamstelling)
  values ('P. Testpersoon', false, 'p.testdata@example.invalid', 'NL00TEST0123456789', 'P. Testpersoon')
  returning id into v_abonnee_1;

  insert into public.relatie (naam, is_organisatie, email, iban, tenaamstelling)
  values ('Testbedrijf Logistiek B.V.', true, 'wagenpark.testdata@example.invalid', 'NL00TEST0987654321', 'Testbedrijf Logistiek B.V.')
  returning id into v_abonnee_2;

  insert into public.relatie_rol (relatie_id, rol) values
    (v_eigenaar,  'eigenaar'),
    (v_vve,       'eigenaar'),
    (v_gemeente,  'overheid'),
    (v_abonnee_1, 'abonnee'),
    (v_abonnee_2, 'abonnee');

  -- ---------------------------------------------------------------------------
  -- Contracten
  -- ---------------------------------------------------------------------------
  insert into public.contract (
    type, omschrijving, hoofdpartij_id, ingangsdatum, einddatum,
    opzegtermijn_maanden, stilzwijgende_verlenging, documentlink
  )
  values (
    'exploitatie', 'Exploitatieovereenkomst Testerhof', v_eigenaar,
    '2022-01-01', '2029-12-31', 6, true,
    '06_LOCATIES/LOC-001_Testgarage_Testerhof/01_Contract_en_Partijen/CON-0001_Exploitatiecontract_Getekend.pdf'
  )
  returning id into v_con_1;

  insert into public.contract (
    type, omschrijving, hoofdpartij_id, ingangsdatum, einddatum, opzegtermijn_maanden
  )
  values (
    'exploitatie', 'Exploitatieovereenkomst Voorbeeldplein', v_gemeente,
    '2020-07-01', '2027-06-30', 12
  )
  returning id into v_con_3;

  -- ---------------------------------------------------------------------------
  -- Locaties
  -- ---------------------------------------------------------------------------
  insert into public.locatie (
    naam, type, dienstverleningstype, straat, huisnummer, postcode, plaats,
    latitude, longitude, capaciteit, capaciteit_abonnement, parkeerhost_id,
    openingstijden, tarieven
  )
  values (
    'Testgarage Testerhof', 'garage', 'exploitatie',
    'Teststraat', '1', '5611 AA', 'Eindhoven',
    51.441642, 5.469722, 320, 60, v_host_zuid,
    '{"ma-vr": "06:00-23:00", "za-zo": "08:00-20:00", "24u": false}'::jsonb,
    '{"uur": 3.50, "dagmax": 18.00, "abonnement_maand": 145.00}'::jsonb
  )
  returning id into v_loc_1;

  insert into public.locatie (
    naam, type, dienstverleningstype, plaats, capaciteit, parkeerhost_id
  )
  values (
    'Adviesdossier Testkade', 'terrein', 'advies',
    'Rotterdam', 80, v_host_noord
  )
  returning id into v_loc_2;

  insert into public.locatie (
    naam, type, dienstverleningstype, straat, huisnummer, postcode, plaats,
    latitude, longitude, capaciteit, capaciteit_abonnement, parkeerhost_id,
    tarieven
  )
  values (
    'Testgarage Voorbeeldplein', 'garage', 'exploitatie',
    'Pleinweg', '10', '1011 AA', 'Voorbeeldstad',
    52.370216, 4.895168, 180, 25, v_host_noord,
    '{"uur": 2.80, "dagmax": 14.00, "abonnement_maand": 110.00}'::jsonb
  )
  returning id into v_loc_3;

  -- ---------------------------------------------------------------------------
  -- Contractpartijen — LOC-001 heeft er bewust twee (correctie 1b)
  -- ---------------------------------------------------------------------------
  insert into public.locatie_partij (locatie_id, relatie_id, rol, contract_id, primaire_contactpartij, actief_van)
  values (v_loc_1, v_eigenaar, 'eigenaar', v_con_1, true,  '2022-01-01');

  insert into public.locatie_partij (locatie_id, relatie_id, rol, contract_id, primaire_contactpartij, actief_van)
  values (v_loc_1, v_vve, 'vve', v_con_1, false, '2022-01-01');

  insert into public.locatie_partij (locatie_id, relatie_id, rol, contract_id, primaire_contactpartij, actief_van)
  values (v_loc_2, v_eigenaar, 'beheerder', null, true, '2025-03-01');

  insert into public.locatie_partij (locatie_id, relatie_id, rol, contract_id, primaire_contactpartij, actief_van)
  values (v_loc_3, v_gemeente, 'gemeente', v_con_3, true, '2020-07-01');

  -- ---------------------------------------------------------------------------
  -- Systeemhistorie — LOC-003 is gewisseld van partner (correctie 2)
  -- ---------------------------------------------------------------------------
  insert into public.systeem_historie (locatie_id, systeempartner, actief_van, koppeling_status, externe_locatie_id, externe_naam)
  values (v_loc_1, 'skidata', '2022-01-01', 'geen', 'FAC-42', 'Testerhof Parking');

  insert into public.systeem_historie (locatie_id, systeempartner, actief_van, koppeling_status)
  values (v_loc_2, 'geen', '2025-03-01', 'geen');

  insert into public.systeem_historie (locatie_id, systeempartner, actief_van, actief_tot, koppeling_status, externe_locatie_id)
  values (v_loc_3, 'ip_parking', '2020-07-01', '2025-05-01', 'geen', 'IPP-0031');

  insert into public.systeem_historie (locatie_id, systeempartner, actief_van, koppeling_status, externe_locatie_id)
  values (v_loc_3, 'skidata', '2025-05-01', 'geen', 'FAC-77');

  -- ---------------------------------------------------------------------------
  -- Apparatuur
  -- ---------------------------------------------------------------------------
  insert into public.apparaat (locatie_id, type, merk, model, serienummer, aanduiding, installatiedatum)
  values (v_loc_1, 'slagboom', 'SKIDATA', 'Barrier.Gate', 'TEST-SN-0001', 'inrit noord', '2022-01-15')
  returning id into v_app_1;

  insert into public.apparaat (locatie_id, type, merk, model, serienummer, aanduiding, installatiedatum)
  values (v_loc_1, 'betaalautomaat', 'SKIDATA', 'Cash.Pay', 'TEST-SN-0002', 'automaat begane grond', '2022-01-15');

  insert into public.apparaat (locatie_id, type, merk, serienummer, aanduiding, installatiedatum)
  values (v_loc_3, 'intercom', 'Commend', 'TEST-SN-0003', 'intercom uitrit', '2020-08-01');

  -- ---------------------------------------------------------------------------
  -- Abonnementen — één krijgt straks een kentekenwijziging (toetst M4)
  -- ---------------------------------------------------------------------------
  insert into public.abonnement (
    relatie_id, locatie_id, kenteken_huidig, product, startdatum,
    prijs_per_maand, abonnement_status, sepa_status, pasnummer, pas_uitgegeven_op
  )
  values (
    v_abonnee_1, v_loc_1, 'XX-123-Y', 'Onbeperkt maandabonnement', '2024-03-01',
    145.00, 'actief', 'akkoord', 'PAS-00412', '2024-03-01'
  )
  returning id into v_abo_1;

  insert into public.abonnement (
    relatie_id, locatie_id, kenteken_huidig, product, startdatum,
    prijs_per_maand, abonnement_status, sepa_status
  )
  values (
    v_abonnee_2, v_loc_1, 'VD-456-Z', 'Zakelijk maandabonnement', '2025-01-01',
    145.00, 'actief', 'akkoord'
  );

  insert into public.abonnement (
    relatie_id, locatie_id, kenteken_huidig, product, startdatum,
    prijs_per_maand, abonnement_status, sepa_status
  )
  values (
    v_abonnee_2, v_loc_3, 'GH-789-A', 'Zakelijk maandabonnement', '2026-07-15',
    110.00, 'aangevraagd', 'verzonden'
  );

  -- De wijziging die de trigger uit 0006 automatisch in kenteken_mutatie zet.
  -- Dit is precies wat mijlpaal M4 controleert.
  update public.abonnement
     set kenteken_huidig = 'ZZ-987-X'
   where id = v_abo_1;

  -- ---------------------------------------------------------------------------
  -- Omzet en bezetting — 90 dagen historie voor beide exploitatielocaties
  -- ---------------------------------------------------------------------------
  -- LOC-001 draait bewust onder prognose, zodat v_signaal_onderprestatie
  -- meteen een regel oplevert om de signaallus op te oefenen.

  insert into public.omzet_periode (locatie_id, datum, omzetsoort, bedrag_excl, btw_bedrag, aantal, bron)
  select
    v_loc_1,
    d::date,
    'kort_parkeren',
    round((420 + (random() * 160))::numeric, 2),
    round((420 + (random() * 160))::numeric * 0.21, 2),
    (95 + floor(random() * 40))::int,
    'skidata'
  from generate_series(current_date - 89, current_date - 1, interval '1 day') d;

  -- Abonnementsomzet wordt over de dagen uitgesmeerd, niet als maandbedrag op
  -- de eerste geboekt. Zie de toelichting bij omzet_periode.datum: anders scoort
  -- de locatie de eerste week van elke maand kunstmatig goed.
  insert into public.omzet_periode (locatie_id, datum, omzetsoort, bedrag_excl, btw_bedrag, aantal, bron)
  select
    v_loc_1, d::date, 'abonnement',
    290.00, 60.90, 60,
    'handmatig'
  from generate_series(current_date - 89, current_date - 1, interval '1 day') d;

  insert into public.omzet_periode (locatie_id, datum, omzetsoort, bedrag_excl, btw_bedrag, aantal, bron)
  select
    v_loc_3,
    d::date,
    'kort_parkeren',
    round((260 + (random() * 90))::numeric, 2),
    round((260 + (random() * 90))::numeric * 0.21, 2),
    (60 + floor(random() * 25))::int,
    'skidata'
  from generate_series(current_date - 89, current_date - 1, interval '1 day') d;

  insert into public.bezetting_periode (locatie_id, datum, bezetting_max, bezetting_gem, aantal_inritten, aantal_uitritten, bezettingsgraad, bron)
  select
    v_loc_1, d::date,
    (180 + floor(random() * 90))::int,
    round((120 + random() * 60)::numeric, 2),
    (95 + floor(random() * 40))::int,
    (94 + floor(random() * 40))::int,
    round((55 + random() * 25)::numeric, 2),
    'skidata'
  from generate_series(current_date - 89, current_date - 1, interval '1 day') d;

  insert into public.bezetting_periode (locatie_id, datum, bezetting_max, bezetting_gem, bezettingsgraad, bron)
  select
    v_loc_3, d::date,
    (90 + floor(random() * 50))::int,
    round((60 + random() * 30)::numeric, 2),
    round((45 + random() * 20)::numeric, 2),
    'skidata'
  from generate_series(current_date - 89, current_date - 1, interval '1 day') d;

  -- ---------------------------------------------------------------------------
  -- Prognoses — LOC-001 is bewust te hoog begroot
  -- ---------------------------------------------------------------------------
  insert into public.prognose (locatie_id, jaar, maand, verwachte_omzet, verwachte_bezetting, methode, vastgesteld_op)
  select
    v_loc_1,
    extract(year  from d)::int,
    extract(month from d)::int,
    32000.00, 72.0, 'begroting 2026', current_date - 200
  from generate_series(
         date_trunc('month', current_date - interval '3 months'),
         date_trunc('month', current_date + interval '2 months'),
         interval '1 month'
       ) d
  on conflict do nothing;

  insert into public.prognose (locatie_id, jaar, maand, verwachte_omzet, verwachte_bezetting, methode, vastgesteld_op)
  select
    v_loc_3,
    extract(year  from d)::int,
    extract(month from d)::int,
    8200.00, 52.0, 'vorig jaar +3%', current_date - 200
  from generate_series(
         date_trunc('month', current_date - interval '3 months'),
         date_trunc('month', current_date + interval '2 months'),
         interval '1 month'
       ) d
  on conflict do nothing;

  -- ---------------------------------------------------------------------------
  -- Storing en werkorder
  -- ---------------------------------------------------------------------------
  insert into public.storing (
    locatie_id, apparaat_id, melding, categorie, prioriteit, storing_status,
    gemeld_via, gemeld_door, gemeld_op, toegewezen_aan_id
  )
  values (
    v_loc_1, v_app_1, 'Slagboom inrit noord sluit niet volledig.', 'slagboom',
    'hoog', 'in_behandeling', 'intercom', 'Abonnee ter plaatse',
    now() - interval '2 days', v_host_zuid
  )
  returning id into v_storing_1;

  insert into public.werkorder (
    locatie_id, storing_id, soort, omschrijving, prioriteit,
    werkorder_status, toegewezen_aan_id, gepland_op
  )
  values (
    v_loc_1, v_storing_1, 'reparatie',
    'Slagboommechaniek nalopen en zo nodig leverancier inschakelen.',
    'hoog', 'ingepland', v_host_zuid, current_date + 1
  );

  insert into public.storing (
    locatie_id, melding, categorie, prioriteit, storing_status,
    gemeld_via, gemeld_op, opgepakt_op, opgelost_op, oplossing, toegewezen_aan_id
  )
  values (
    v_loc_3, 'Betaalautomaat neemt geen pin aan.', 'betaalautomaat',
    'kritiek', 'opgelost', 'telefoon',
    now() - interval '12 days', now() - interval '12 days' + interval '40 minutes',
    now() - interval '11 days', 'Pinmodule herstart na overleg met leverancier.',
    v_host_noord
  );

  -- ---------------------------------------------------------------------------
  -- Klantvraag — gekoppeld aan de open storing (D2/D3-brug)
  -- ---------------------------------------------------------------------------
  -- Let op: afgehandeld_op moet in dezelfde insert mee. De check constraint
  -- klantvraag_afgehandeld_heeft_tijdstip slaat toe op de insert, niet pas bij
  -- een latere update — precies zoals bedoeld.
  insert into public.klantvraag (
    relatie_id, locatie_id, abonnement_id, kanaal, categorie, onderwerp,
    samenvatting, klantvraag_status, afhandelwijze, storing_id,
    ontvangen_op, eerste_reactie_op, afgehandeld_op
  )
  values (
    v_abonnee_1, v_loc_1, v_abo_1, 'intercom', 'storing',
    'Kom de garage niet uit',
    'Abonnee stond voor de slagboom bij de inrit noord. Doorverbonden met host.',
    'afgehandeld', 'mens', v_storing_1,
    now() - interval '2 days',
    now() - interval '2 days' + interval '2 minutes',
    now() - interval '2 days' + interval '15 minutes'
  );

  insert into public.klantvraag (
    relatie_id, locatie_id, kanaal, categorie, onderwerp, samenvatting,
    klantvraag_status, ontvangen_op
  )
  values (
    v_abonnee_2, v_loc_1, 'mail', 'kentekenwijziging',
    'Nieuwe auto voor abonnement',
    'Verzoek om het kenteken van het abonnement te wijzigen.',
    'nieuw', now() - interval '3 hours'
  );

  -- ---------------------------------------------------------------------------
  -- Campagne met resultaat — toetst de terugkoppeling D1 -> D4
  -- ---------------------------------------------------------------------------
  insert into public.campagne (
    naam, doel, is_merkbreed, kanalen, startdatum, einddatum, budget,
    werkelijke_kosten, campagne_status, aanleiding, uit_signaal, documentlink
  )
  values (
    'Testactie Testerhof', 'Bezetting doordeweeks verhogen', false,
    array['instagram', 'sandwichbord'],
    current_date - 75, current_date - 45, 1500.00, 1420.00, 'afgerond',
    'Omzet bleef in het voorjaar 14% achter op prognose zonder interne oorzaak.',
    true,
    '04_MARKETING/02_Campagnes/CAM-0001_Testactie_Testerhof/'
  )
  returning id into v_campagne_1;

  insert into public.campagne_locatie (campagne_id, locatie_id)
  values (v_campagne_1, v_loc_1);

  insert into public.contentitem (
    campagne_id, locatie_id, titel, contenttype, kanaal,
    gepland_op, gepubliceerd_op, documentlink, statistieken
  )
  values (
    v_campagne_1, v_loc_1, 'Instagram carrousel doordeweeks parkeren', 'social', 'instagram',
    current_date - 74, current_date - 74,
    '04_MARKETING/02_Campagnes/CAM-0001_Testactie_Testerhof/02_Content/CAM-0001_Instagram_Post_01.png',
    '{"bereik": 4820, "interacties": 137, "kliks": 61}'::jsonb
  );

  insert into public.campagne_resultaat (
    campagne_id, locatie_id, venster_dagen,
    omzet_voor, omzet_tijdens, omzet_na, toegerekende_kosten, toelichting
  )
  values (
    v_campagne_1, v_loc_1, 30,
    13800.00, 15100.00, 15600.00, 1420.00,
    'Effect hield na afloop van de campagne aan.'
  );

  -- ---------------------------------------------------------------------------
  -- Kennisbank — één artikel dat de bot straks zou uitvoeren
  -- ---------------------------------------------------------------------------
  insert into public.kennisartikel (
    titel, categorie, vraag, antwoord, triggerwoorden, stappen,
    vereist_goedkeuring, systeem_actie, kennisartikel_status,
    eigenaar_id, laatst_herzien_op, herzien_voor
  )
  values (
    'Kenteken wijzigen op een lopend abonnement', 'abonnement',
    'Ik heb een andere auto, hoe wijzig ik mijn kenteken?',
    'Het kenteken op een lopend abonnement kan gewijzigd worden zodra de klant is '
    'geverifieerd. De wijziging gaat direct in en wordt doorgezet naar het '
    'parkeersysteem van de locatie.',
    array['kenteken', 'nummerplaat', 'andere auto', 'nieuwe auto', 'kenteken wijzigen'],
    array[
      'Verifieer de identiteit van de abonnee aan de hand van naam en abonnementsnummer.',
      'Controleer of het abonnement de status actief heeft.',
      'Werk kenteken_huidig bij op het abonnement.',
      'Controleer in v_werklijst_kentekenmutaties dat de mutatie is doorgezet.',
      'Bevestig aan de klant, met vermelding vanaf wanneer het nieuwe kenteken werkt.'
    ],
    false,
    'Werk abonnement.kenteken_huidig bij. De trigger legt de mutatie vast; de '
    'koppeling zet hem door naar de systeempartner en vinkt hem af.',
    'actueel', v_host_zuid, current_date - 20, current_date + 345
  )
  returning id into v_kennis_1;

  insert into public.kennisartikel (
    titel, categorie, vraag, antwoord, triggerwoorden,
    vereist_goedkeuring, goedkeuring_door, kennisartikel_status,
    eigenaar_id, laatst_herzien_op, herzien_voor
  )
  values (
    'Abonnement opzeggen', 'abonnement',
    'Hoe zeg ik mijn abonnement op?',
    'Opzeggen kan per het einde van de lopende maand, met inachtneming van de '
    'opzegtermijn uit het abonnement. De parkeerpas moet worden ingeleverd.',
    array['opzeggen', 'stoppen', 'beëindigen', 'opzegging'],
    true, 'Klantenservice', 'actueel',
    v_host_zuid, current_date - 40, current_date - 5   -- bewust verlopen
  );

  -- Koppel de openstaande kentekenvraag aan het artikel
  update public.klantvraag
     set kennisartikel_id = v_kennis_1
   where categorie = 'kentekenwijziging';

  raise notice 'Testdata geladen: 3 locaties, 3 abonnementen, 2 storingen, 1 campagne, 2 kennisartikelen.';
end
$$;


-- =============================================================================
-- Controlequery's — dit hoort eruit te komen
-- =============================================================================
--
-- M1  registers gevuld:
--     select locatie_code, locatie_naam, systeempartner, primaire_contactpartij
--     from public.v_locatie_dashboard order by locatie_code;
--     -> LOC-001 skidata / Vastgoedpartij Testerhof B.V.
--     -> LOC-002 geen     / Vastgoedpartij Testerhof B.V.
--     -> LOC-003 skidata  / Gemeente Voorbeeldstad
--
-- M4  kentekenwijziging automatisch vastgelegd:
--     select * from public.v_werklijst_kentekenmutaties;
--     -> 1 regel: XX-123-Y -> ZZ-987-X, nog niet verwerkt in het parkeersysteem
--
-- M6  dashboard per locatie:
--     select * from public.v_locatie_dashboard where locatie_code = 'LOC-001';
--     -> omzet, bezetting, 1 open storing, 2 actieve abonnementen
--
--     Signaallus:
--     select * from public.v_signaal_onderprestatie;
--     -> LOC-001 staat erin, LOC-002 (advies) nooit
--
--     Historie van de partnerwissel:
--     select l.code, sh.systeempartner, sh.actief_van, sh.actief_tot
--     from public.systeem_historie sh join public.locatie l on l.id = sh.locatie_id
--     where l.code = 'LOC-003' order by sh.actief_van;
--     -> ip_parking t/m 2025-05-01, daarna skidata
--
--     Kennisbankonderhoud:
--     select * from public.v_kennisbank_onderhoud where aandachtspunt <> 'in orde';
--     -> 'Abonnement opzeggen' staat op 'herziening verlopen'
--
-- =============================================================================
-- Opruimen (verwijdert ALLE data, ook echte — alleen op een testomgeving)
-- =============================================================================
--
--   truncate table
--     public.wijzigingslog, public.koppeling_run, public.campagne_resultaat,
--     public.contentitem, public.campagne_locatie, public.campagne,
--     public.kennisartikel, public.klantvraag, public.kenteken_mutatie,
--     public.abonnement, public.onderhoud, public.werkorder, public.storing,
--     public.rapportage, public.sepa_incasso, public.sepa_batch, public.factuur,
--     public.prognose, public.bezetting_periode, public.omzet_periode,
--     public.apparaat, public.systeem_historie, public.locatie_partij,
--     public.contract, public.locatie, public.relatie_rol, public.relatie,
--     public.medewerker
--   restart identity cascade;
