-- =============================================================================
-- ParkingYou datalaag — SEED: referentiedata
-- =============================================================================
-- Dit bestand vult de Connector Registry met de databronnen die vandaag al
-- bestaan of gepland zijn (Hub Architecture v0.2 §4, aangevuld met wat er sinds
-- die versie bekend is geworden).
--
-- Dit is GEEN testdata — deze regels horen ook in productie. De statussen zijn
-- de startsituatie; ze worden bijgewerkt zodra een leverancier antwoordt.
--
-- Draai dit na 0009_connector_registry.sql.
-- =============================================================================

insert into public.connector (
  naam, bron, domein, omschrijving, koppeltype, connector_status,
  levert_aan, sync_frequentie, is_automatiseringskandidaat, reden_nog_handmatig
) values

-- ---------------------------------------------------------------------------
-- Prioriteit 1 — de parkeersystemen. Dit is het kritieke pad van het project.
-- ---------------------------------------------------------------------------
('SKIDATA', 'skidata', 'D1/D2',
 'Transacties, bezetting en storingsmeldingen van de locaties op SKIDATA.',
 'geen', 'te_onderzoeken',
 'omzet_periode, bezetting_periode, storing', 'dagelijks (streven)',
 true, null),

('IP Parking', 'ip_parking', 'D1/D2',
 'Idem, voor de locaties op het IP Parking-platform (ParkBase-omgeving).',
 'geen', 'te_onderzoeken',
 'omzet_periode, bezetting_periode, storing', 'dagelijks (streven)',
 true, null),

('Scheidt & Bachmann', 'scheidt_bachmann', 'D1/D2',
 'Idem, voor de locaties op de entervo-omgeving.',
 'geen', 'te_onderzoeken',
 'omzet_periode, bezetting_periode, storing', 'dagelijks (streven)',
 true, null),

('Aeroparker', 'aeroparker', 'D1/D4',
 'Online reserveringen, reserveringsomzet en klantgegevens.',
 'geen', 'te_onderzoeken',
 'omzet_periode, relatie', 'dagelijks (streven)',
 true, null),

-- ---------------------------------------------------------------------------
-- Prioriteit 1 — klantcontact
-- ---------------------------------------------------------------------------
('Zendesk', 'zendesk', 'D3',
 'Alle klantvragen als tickets in de datalaag. Nog te bepalen of telefoon, '
 'socials en meldkamer hier ook samenkomen (besluit 4).',
 'geen', 'te_onderzoeken',
 'klantvraag', 'realtime via webhook (streven)',
 true, null),

('Meldkamer', 'overig', 'D2/D3',
 'Intercom-meldingen bij storingen. Tegelijk klantvraag en storingssignaal. '
 'Waar deze meldingen nu landen is nog niet in kaart gebracht.',
 'handmatig', 'te_onderzoeken',
 'klantvraag, storing', null,
 true, 'Onbekend welke registratie de meldkamer voert en of die te ontsluiten is. Uitzoekactie in fase 0.'),

-- ---------------------------------------------------------------------------
-- Prioriteit 2 — financieel
-- ---------------------------------------------------------------------------
('AFAS', 'afas', 'D1',
 'Grootboek, facturen en btw. AFAS blijft bron van waarheid voor de boekhouding; '
 'de datalaag levert aan en leest facturatiestatus terug.',
 'geen', 'te_onderzoeken',
 'factuur (status terug), grootboekaansluiting', 'dagelijks (streven)',
 true, null),

('Bank / PSP', 'bank', 'D1',
 'Banktransacties en SEPA-incassoresultaten, inclusief storneringen.',
 'geen', 'te_onderzoeken',
 'sepa_incasso', 'dagelijks (streven)',
 true, null),

-- ---------------------------------------------------------------------------
-- Prioriteit 2/3 — marketing
-- ---------------------------------------------------------------------------
('Google Analytics 4', 'google_analytics', 'D4',
 'Websitegedrag en online conversies (reserveringen).',
 'geen', 'te_koppelen',
 'contentitem.statistieken', 'dagelijks',
 true, null),

('Google Ads', 'google_ads', 'D4',
 'Campagneprestaties en kosten per campagne.',
 'geen', 'te_koppelen',
 'campagne.werkelijke_kosten, contentitem.statistieken', 'dagelijks',
 true, null),

('Canva', 'overig', 'D4',
 'Contentproductie. Ontwerpen worden gekoppeld aan contentitems via een link.',
 'handmatig', 'actief',
 'contentitem.ontwerp_url', null,
 true, 'Handmatig linken volstaat zolang het volume laag is. Automatiseren pas als het aantal contentitems per maand dat rechtvaardigt.'),

('Social planning (tool nog te kiezen)', 'overig', 'D4',
 'Publicatieplanning en publicatiestatistieken voor social.',
 'geen', 'voorgesteld',
 'contentitem', null,
 false, null),

-- ---------------------------------------------------------------------------
-- Uit te faseren
-- ---------------------------------------------------------------------------
('Excel-bestanden (huidig)', 'handmatig', 'Divers',
 'De losse sheets die nu als database dienstdoen. Worden eenmalig geïmporteerd '
 'en daarna bevroren.',
 'handmatig', 'uitfaseren',
 'eenmalige import naar registers en abonnement', null,
 true, 'Blijft tot de import van fase 0 en 1 is afgerond en gecontroleerd.'),

('Notion', 'overig', 'Divers',
 'Bevat onder meer PY Signing, Locaties, Issues en Campagnes. Wordt geëxporteerd; '
 'bruikbare data gaat naar de datalaag, de rest naar het archief.',
 'handmatig', 'uitfaseren',
 'eenmalige import', null,
 true, 'Reëel risico op een derde parallelle structuur zolang dit blijft bestaan. Einddatum afspreken in fase 0.');


-- -----------------------------------------------------------------------------
-- Controle na het laden
-- -----------------------------------------------------------------------------
-- Verwacht: 14 regels, waarvan 7 met status 'te_onderzoeken'.
--
--   select connector_status, count(*) from public.connector group by 1 order by 1;
--
-- De vier parkeersystemen plus Zendesk zijn het kritieke pad. Zodra hun
-- aanvraag_verstuurd_op gevuld is, is mijlpaal M0 gehaald:
--
--   select naam, aanvraag_verstuurd_op, aanvraag_antwoord_op
--   from public.connector
--   where bron in ('skidata','ip_parking','scheidt_bachmann','aeroparker');
