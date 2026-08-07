-- =============================================================================
-- ParkingYou datalaag — 0011 ROLLEN EN RECHTEN
-- =============================================================================
-- Dit bestand maakt de toegangsmatrix uit de mappenstructuur afdwingbaar in
-- plaats van adviserend.
--
-- Waarom Postgres-rollen en niet alleen Row Level Security: de formulierlaag
-- (NocoDB) verbindt met een databaseconnectie, niet met een ingelogde Supabase-
-- gebruiker. RLS grijpt daar dus niet vanzelf. Rechten per rol werken wél, en
-- elke NocoDB-base verbindt met de rol van zijn eigen domein.
--
-- BELANGRIJK — wachtwoorden staan bewust NIET in dit bestand.
-- De rollen hieronder zijn groepsrollen zonder inlog. Per domein maak je
-- eenmalig een inlogaccount aan, buiten versiebeheer om:
--
--   create role py_login_financien with login password '<uit de wachtwoordkluis>';
--   grant py_financien to py_login_financien;
--
-- Zet die wachtwoorden in de kluis, niet in git en niet in een mail.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. De domeinrollen
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'py_lezer') then
    create role py_lezer nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'py_directie') then
    create role py_directie nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'py_financien') then
    create role py_financien nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'py_operatie') then
    create role py_operatie nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'py_klantenservice') then
    create role py_klantenservice nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'py_marketing') then
    create role py_marketing nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'py_koppeling') then
    create role py_koppeling nologin;
  end if;
end
$$;

comment on role py_lezer           is 'Leest alles behalve persoonsgegevens. Basisrol, iedereen erft hem.';
comment on role py_directie        is 'Beheert de registers en de systeeminrichting.';
comment on role py_financien       is 'D1: omzet, facturen, incasso, prognoses, rapportages.';
comment on role py_operatie        is 'D2: storingen, werkorders, apparatuur, locatiedossiers.';
comment on role py_klantenservice  is 'D3 + D5: abonnementen, klantvragen, kennisbank.';
comment on role py_marketing       is 'D4: campagnes, content, resultaten.';
comment on role py_koppeling       is 'Technische rol voor de automatiseringslaag. Geen mens logt hiermee in.';

-- Elke domeinrol kan alles wat de basislezer kan
grant py_lezer to py_directie, py_financien, py_operatie, py_klantenservice, py_marketing, py_koppeling;


-- -----------------------------------------------------------------------------
-- 2. Basis: leesrecht op het schema
-- -----------------------------------------------------------------------------

grant usage on schema public to py_lezer;
grant select on all tables in schema public to py_lezer;

-- Ook voor tabellen die later nog bijkomen
alter default privileges in schema public grant select on tables to py_lezer;


-- -----------------------------------------------------------------------------
-- 3. Schrijfrechten per domein
-- -----------------------------------------------------------------------------
-- Spiegelt de eigenaarschapstabel uit Blauwdruk §7.3 en de toegangsmatrix uit
-- de mappenstructuur. Lezen is breed, schrijven is smal — dat is precies de
-- bedoeling: iedereen mag in andermans gebied kijken, niemand mag er iets
-- veranderen.

-- Directie: de registers en de systeeminrichting
grant insert, update, delete on
  public.locatie, public.relatie, public.relatie_rol, public.contract,
  public.medewerker, public.locatie_partij, public.systeem_historie,
  public.connector
to py_directie;

-- Financiën
grant insert, update, delete on
  public.omzet_periode, public.bezetting_periode, public.prognose,
  public.factuur, public.sepa_batch, public.sepa_incasso, public.rapportage
to py_financien;

-- Operatie: eigen tabellen plus de apparatuur en het locatiedossier
grant insert, update, delete on
  public.storing, public.werkorder, public.onderhoud, public.apparaat
to py_operatie;
grant update on public.locatie to py_operatie;

-- Klantenservice: D3 en D5
grant insert, update, delete on
  public.abonnement, public.kenteken_mutatie, public.klantvraag,
  public.kennisartikel
to py_klantenservice;

-- Marketing
grant insert, update, delete on
  public.campagne, public.campagne_locatie, public.contentitem,
  public.campagne_resultaat
to py_marketing;

-- De automatiseringslaag schrijft in alles wat door koppelingen gevuld wordt
grant insert, update, delete on
  public.omzet_periode, public.bezetting_periode, public.klantvraag,
  public.storing, public.kenteken_mutatie, public.contentitem,
  public.campagne_resultaat, public.koppeling_run, public.factuur,
  public.sepa_incasso
to py_koppeling;
grant update on public.connector to py_koppeling;

-- Sequences: nodig omdat elke insert een volgnummer trekt
grant usage, select on all sequences in schema public
to py_directie, py_financien, py_operatie, py_klantenservice, py_marketing, py_koppeling;

alter default privileges in schema public grant usage, select on sequences
to py_directie, py_financien, py_operatie, py_klantenservice, py_marketing, py_koppeling;

-- De wijzigingslog is voor iedereen leesbaar en voor niemand bewerkbaar.
-- Het log wordt door triggers gevuld en mag daarna niet meer wijzigen.
revoke insert, update, delete on public.wijzigingslog from public;


-- -----------------------------------------------------------------------------
-- 4. Row Level Security — dicht als standaard
-- -----------------------------------------------------------------------------
-- Supabase stelt het schema via PostgREST beschikbaar aan de rollen 'anon' en
-- 'authenticated'. Zolang er geen klant- of eigenaarsportaal is, hoort daar
-- niets doorheen te komen. RLS aanzetten zonder policies is precies dat: alles
-- dicht, tenzij expliciet opengezet.
--
-- Dit is geen theoretische voorzorg. Zonder deze stap zou iedereen met de
-- publieke sleutel van het project het volledige abonneebestand kunnen ophalen,
-- inclusief kentekens en IBAN's.
--
-- De domeinrollen hierboven zijn geen 'anon'/'authenticated' en worden door RLS
-- niet geraakt; NocoDB blijft dus gewoon werken.

do $$
declare
  v_tabel text;
begin
  for v_tabel in
    select tablename from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', v_tabel);
  end loop;
end
$$;

-- Wat er wél doorheen mag zodra er een portaal komt, wordt hier expliciet
-- toegevoegd — per tabel, met een policy die zegt welke rij bij welke gebruiker
-- hoort. Tot die tijd staat er bewust niets.

-- De rol 'anon' bestaat alleen op Supabase. Op een kale Postgres (bijvoorbeeld
-- een lokale testomgeving) slaan we deze stap over in plaats van te struikelen.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on all tables    in schema public from anon;
    revoke all on all sequences in schema public from anon;
  end if;
end
$$;

comment on schema public is
  'ParkingYou datalaag. Rechten lopen via de py_*-rollen (zie 0011). RLS staat
   aan zonder policies: anon en authenticated krijgen niets tot een portaal
   expliciet wordt opengezet.';
