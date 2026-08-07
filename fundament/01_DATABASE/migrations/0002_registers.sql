-- =============================================================================
-- ParkingYou datalaag — 0002 KERNREGISTERS
-- =============================================================================
-- De masterdata uit Blauwdruk §3.1: relaties, medewerkers, locaties, contracten
-- en apparatuur. Dit is "de gedeelde taal van het bedrijf" — elk domein verwijst
-- hiernaar, niets wordt gekopieerd.
--
-- Volgorde in dit bestand is de afhankelijkheidsvolgorde:
--   relatie -> relatie_rol -> medewerker -> locatie -> contract -> apparaat
-- =============================================================================


-- -----------------------------------------------------------------------------
-- RELATIE (REL-0001) — alle partijen
-- -----------------------------------------------------------------------------
-- Eén partij = één record. Een vastgoedeigenaar die óók abonnee is, staat hier
-- één keer, met twee rollen in relatie_rol. Dat is de reden dat 'type' geen veld
-- op deze tabel is: dan zou dezelfde partij twee keer in het register komen.

create sequence public.relatie_nummer_seq;

create table public.relatie (
  id               uuid primary key default gen_random_uuid(),
  nummer           integer not null default nextval('public.relatie_nummer_seq') unique,
  code             text generated always as (public.py_code('REL', nummer, 4)) stored unique,

  naam             text not null,
  is_organisatie   boolean not null default true,
  kvk_nummer       text,
  btw_nummer       text,

  -- Contactgegevens
  email            citext,
  telefoon         text,
  website          text,

  -- Adres
  straat           text,
  huisnummer       text,
  postcode         text,
  plaats           text,
  land             text not null default 'Nederland',

  -- Alleen relevant bij abonnees en leveranciers
  iban             text,
  tenaamstelling   text,

  constraint relatie_naam_niet_leeg check (length(trim(naam)) > 0)
);

select public.voeg_standaardvelden_toe('relatie');
select public.voeg_wijzigingslog_toe('relatie');

create index idx_relatie_naam  on public.relatie (lower(naam));
create index idx_relatie_email on public.relatie (email);

comment on table public.relatie is
  'Relatieregister (Blauwdruk §3.1). Eigenaren, abonnees, leveranciers en partners
   in één tabel. Rollen staan in relatie_rol, zodat één partij meerdere rollen kan
   hebben zonder dubbel te bestaan.';
comment on column public.relatie.iban is
  'Persoonsgegeven. Zie het verwerkingsregister voor bewaartermijn na opzegging.';


-- -----------------------------------------------------------------------------
-- RELATIE_ROL — welke pet draagt een partij?
-- -----------------------------------------------------------------------------

create table public.relatie_rol (
  id          uuid primary key default gen_random_uuid(),
  relatie_id  uuid not null references public.relatie(id) on delete cascade,
  rol         public.relatie_roltype not null,
  actief_van  date not null default current_date,
  actief_tot  date,

  unique (relatie_id, rol, actief_van),
  constraint relatie_rol_periode_logisch check (actief_tot is null or actief_tot >= actief_van)
);

select public.voeg_standaardvelden_toe('relatie_rol');

create index idx_relatie_rol_relatie on public.relatie_rol (relatie_id);
create index idx_relatie_rol_rol     on public.relatie_rol (rol) where actief_tot is null;

comment on column public.relatie_rol.actief_tot is
  'Leeg = de rol geldt nu. Ingevuld = historie, bijvoorbeeld een leverancier waar
   niet meer mee gewerkt wordt.';


-- -----------------------------------------------------------------------------
-- MEDEWERKER (MDW-01) — team en parkeerhosts
-- -----------------------------------------------------------------------------

create sequence public.medewerker_nummer_seq;

create table public.medewerker (
  id              uuid primary key default gen_random_uuid(),
  nummer          integer not null default nextval('public.medewerker_nummer_seq') unique,
  code            text generated always as (public.py_code('MDW', nummer, 2)) stored unique,

  voornaam        text not null,
  achternaam      text not null,
  volledige_naam  text generated always as (voornaam || ' ' || achternaam) stored,

  functie         text,
  is_parkeerhost  boolean not null default false,
  regio           text,
  email           citext unique,
  telefoon        text,

  in_dienst_van   date,
  in_dienst_tot   date,

  -- Koppeling naar het inlogaccount, zodat "wie deed dit" herleidbaar is
  auth_user_id    uuid,

  constraint medewerker_dienstverband_logisch
    check (in_dienst_tot is null or in_dienst_van is null or in_dienst_tot >= in_dienst_van)
);

select public.voeg_standaardvelden_toe('medewerker');
select public.voeg_wijzigingslog_toe('medewerker');

create index idx_medewerker_host on public.medewerker (regio) where is_parkeerhost;

comment on table public.medewerker is
  'Team- en middelenregister, deel 1 (Blauwdruk §3.1). Bevat GEEN personeels-
   dossiers, ziekteverzuim of salarisgegevens — die horen niet in dit systeem.';


-- -----------------------------------------------------------------------------
-- LOCATIE (LOC-001) — de spil van het hele systeem
-- -----------------------------------------------------------------------------
-- Regel #1 uit het Data Framework: geen enkel record in enig domein bestaat
-- zonder verwijzing naar een locatie. Dit is de tabel waar alles naar wijst.
--
-- Twee dingen die hier BEWUST NIET staan:
--   - systeempartner  -> zit in systeem_historie (0003), want locaties wisselen
--                        soms van partner en dan moet je oude transacties nog
--                        kunnen duiden. (Datamodel v2.0, correctie 2)
--   - eigenaar        -> zit in locatie_partij (0003), want een locatie kan
--                        meerdere contractpartijen hebben en een eigenaar kan
--                        meerdere locaties hebben. (Datamodel v2.0, correctie 1)

create sequence public.locatie_nummer_seq;

create table public.locatie (
  id                    uuid primary key default gen_random_uuid(),
  nummer                integer not null default nextval('public.locatie_nummer_seq') unique,
  code                  text generated always as (public.py_code('LOC', nummer, 3)) stored unique,

  naam                  text not null,
  type                  public.locatie_type not null default 'garage',

  -- Datamodel v2.0, correctie 4. Bepaalt of een locatie meetelt in omzet-
  -- rapportages, prognoses en de signaallus. Zonder dit veld vervuilen advies-
  -- en onderhoudslocaties elk dashboard met een omzet van nul.
  dienstverleningstype  public.dienstverleningstype not null default 'exploitatie',

  -- Adres
  straat                text,
  huisnummer            text,
  postcode              text,
  plaats                text not null,
  land                  text not null default 'Nederland',

  -- Voor kaartweergave en de externe oorzaakcheck in de signaallus
  -- (wegwerkzaamheden of evenementen rond deze coördinaten)
  latitude              numeric(9,6),
  longitude             numeric(9,6),

  capaciteit            integer,
  capaciteit_abonnement integer,

  openingstijden        jsonb,
  tarieven              jsonb,

  parkeerhost_id        uuid references public.medewerker(id) on delete set null,

  constraint locatie_capaciteit_positief
    check (capaciteit is null or capaciteit > 0),
  constraint locatie_abonnementplekken_passen
    check (capaciteit is null or capaciteit_abonnement is null
           or capaciteit_abonnement <= capaciteit),
  constraint locatie_coordinaten_compleet
    check ((latitude is null) = (longitude is null))
);

select public.voeg_standaardvelden_toe('locatie');
select public.voeg_wijzigingslog_toe('locatie');

create index idx_locatie_plaats  on public.locatie (plaats);
create index idx_locatie_host    on public.locatie (parkeerhost_id);
create index idx_locatie_dienst  on public.locatie (dienstverleningstype);

comment on table public.locatie is
  'Locatieregister (Blauwdruk §3.1). De spil: elk record in elk domein verwijst
   hiernaar. 37 locaties bij aanvang.';
comment on column public.locatie.dienstverleningstype is
  'Alleen bij ''exploitatie'' gelden omzetrapportages, prognoses en de signaallus.';
comment on column public.locatie.tarieven is
  'Vrije structuur, bijv. {"uur": 3.50, "dagmax": 18.00, "abonnement_maand": 145.00}.
   Wordt een eigen tabel zodra tariefhistorie nodig is voor omzetreconciliatie —
   nu bewust simpel gehouden (Blauwdruk §5.3: begin klein).';
comment on column public.locatie.openingstijden is
  'Vrije structuur, bijv. {"ma-vr": "06:00-23:00", "za-zo": "08:00-20:00", "24u": false}.';


-- -----------------------------------------------------------------------------
-- CONTRACT (CON-0001)
-- -----------------------------------------------------------------------------
-- Let op: er is bewust GEEN locatie_id op deze tabel. De koppeling contract <->
-- locatie loopt altijd via locatie_partij (0003), omdat één exploitatiecontract
-- meerdere locaties kan dekken en één locatie meerdere contractpartijen kan
-- hebben. Leverancierscontracten hebben simpelweg geen locatie_partij-regels.

create sequence public.contract_nummer_seq;

create table public.contract (
  id                      uuid primary key default gen_random_uuid(),
  nummer                  integer not null default nextval('public.contract_nummer_seq') unique,
  code                    text generated always as (public.py_code('CON', nummer, 4)) stored unique,

  type                    public.contract_type not null,
  omschrijving            text not null,

  hoofdpartij_id          uuid references public.relatie(id) on delete restrict,

  ingangsdatum            date,
  einddatum               date,
  opzegtermijn_maanden    integer,
  stilzwijgende_verlenging boolean not null default false,
  verlengingsduur_maanden integer,

  -- Verwijzing naar het document in SharePoint. Blauwdruk §4.1: documenten
  -- verwijzen naar data, en de database houdt de vindplaats van het document bij.
  documentlink            text,

  constraint contract_looptijd_logisch
    check (einddatum is null or ingangsdatum is null or einddatum >= ingangsdatum),
  constraint contract_opzegtermijn_positief
    check (opzegtermijn_maanden is null or opzegtermijn_maanden >= 0)
);

select public.voeg_standaardvelden_toe('contract');
select public.voeg_wijzigingslog_toe('contract');

create index idx_contract_partij   on public.contract (hoofdpartij_id);
create index idx_contract_einddatum on public.contract (einddatum)
  where einddatum is not null;

comment on column public.contract.documentlink is
  'Pad of URL naar het getekende contract in de documentlaag, bijv.
   06_LOCATIES/LOC-001_.../01_Contract_en_Partijen/CON-0001_Exploitatiecontract_Getekend.pdf';


-- -----------------------------------------------------------------------------
-- APPARAAT (APP-0001) — slagbomen, betaalautomaten, intercoms
-- -----------------------------------------------------------------------------

create sequence public.apparaat_nummer_seq;

create table public.apparaat (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.apparaat_nummer_seq') unique,
  code              text generated always as (public.py_code('APP', nummer, 4)) stored unique,

  locatie_id        uuid not null references public.locatie(id) on delete restrict,
  type              public.apparaat_type not null,

  merk              text,
  model             text,
  serienummer       text,
  aanduiding        text,   -- hoe het apparaat ter plaatse heet, bijv. "inrit noord"

  installatiedatum  date,
  garantie_tot      date,
  laatste_onderhoud date,
  volgend_onderhoud date,

  unique (serienummer)
);

select public.voeg_standaardvelden_toe('apparaat');
select public.voeg_wijzigingslog_toe('apparaat');

create index idx_apparaat_locatie on public.apparaat (locatie_id);
create index idx_apparaat_type    on public.apparaat (type);

comment on column public.apparaat.aanduiding is
  'De naam die de parkeerhost gebruikt. Zonder dit veld moet iemand bij een
   storingsmelding een serienummer opzoeken om te weten welke slagboom bedoeld wordt.';
