-- =============================================================================
-- ParkingYou datalaag — 0004 DOMEIN D1: FINANCIËN
-- =============================================================================
-- Eigenaar: Financiën. Bevat omzet, bezetting, prognoses, facturen, incasso en
-- de administratie van verstuurde eigenaarsrapportages.
--
-- Twee grenzen die dit bestand bewaakt:
--
--   1. AFAS blijft bron van waarheid voor grootboek, facturen en btw. Deze
--      tabellen houden de OPERATIONELE administratie bij en leveren aan AFAS.
--      Twee systemen die allebei denken dat ze de facturatie beheren is de
--      klassieke fout (Datamodel v2.0 §3.2).
--
--   2. Alleen locaties met dienstverleningstype 'exploitatie' horen hier data
--      te hebben. Advies- en onderhoudslocaties hebben per definitie geen omzet
--      en zouden elk dashboard vervuilen met nullen.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- OMZET_PERIODE — omzet per locatie, per dag, per soort
-- -----------------------------------------------------------------------------
-- Bewuste keuze: we slaan dagtotalen op, geen losse parkeertransacties. Reden:
-- voor eigenaarsrapportages, prognosevergelijking en de signaallus is een
-- dagtotaal precies genoeg, terwijl losse transacties miljoenen regels en een
-- AVG-vraagstuk opleveren. De brondetails blijven in het parkeersysteem staan.
-- Als er ooit een aantoonbare behoefte aan transactiedetail ontstaat, komt daar
-- een aparte tabel voor — dan met een bewaartermijn.

create table public.omzet_periode (
  id             uuid primary key default gen_random_uuid(),

  locatie_id     uuid not null references public.locatie(id) on delete restrict,
  datum          date not null,
  omzetsoort     public.omzetsoort not null,

  bedrag_excl    numeric(12,2) not null default 0,
  btw_bedrag     numeric(12,2) not null default 0,
  bedrag_incl    numeric(12,2) generated always as (bedrag_excl + btw_bedrag) stored,
  aantal         integer,

  bron           public.databron not null,
  bron_referentie text,
  geimporteerd_op timestamptz not null default now(),

  -- Deze sleutel maakt de import herhaalbaar: een tweede run van dezelfde dag
  -- overschrijft in plaats van te verdubbelen. Zonder dit is dubbele omzet na
  -- een herstelde koppeling een kwestie van tijd.
  unique (locatie_id, datum, omzetsoort, bron)
);

select public.voeg_standaardvelden_toe('omzet_periode');
-- Bewust GEEN wijzigingslog: dit is bulk-importdata. Herkomst staat al in
-- bron + geimporteerd_op.

create index idx_omzet_locatie_datum on public.omzet_periode (locatie_id, datum desc);
create index idx_omzet_datum         on public.omzet_periode (datum desc);

comment on table public.omzet_periode is
  'Dagomzet per locatie en omzetsoort. Gevuld door de koppelingen uit fase 2/3.
   De unique-sleutel maakt imports idempotent.';

comment on column public.omzet_periode.datum is
  'REGEL: boek periodieke omzet over de dagen waarop hij betrekking heeft, niet
   als één bedrag op de eerste van de maand. Abonnementsomzet van 8.700 euro
   hoort als ~290 euro per dag in de tabel te staan. Reden: het dashboard en de
   signaallus vergelijken de omzet tot nu toe met de prognose naar rato. Eén
   maandbedrag op dag 1 laat een locatie de eerste week kunstmatig goed scoren
   en de rest van de maand kunstmatig slecht.';


-- -----------------------------------------------------------------------------
-- BEZETTING_PERIODE — hoe vol stond de locatie
-- -----------------------------------------------------------------------------

create table public.bezetting_periode (
  id                uuid primary key default gen_random_uuid(),

  locatie_id        uuid not null references public.locatie(id) on delete restrict,
  datum             date not null,

  bezetting_max     integer,
  bezetting_gem     numeric(8,2),
  aantal_inritten   integer,
  aantal_uitritten  integer,
  bezettingsgraad   numeric(5,2),   -- percentage van de capaciteit

  bron              public.databron not null,
  geimporteerd_op   timestamptz not null default now(),

  unique (locatie_id, datum, bron),
  constraint bezettingsgraad_realistisch
    check (bezettingsgraad is null or (bezettingsgraad >= 0 and bezettingsgraad <= 200))
);

select public.voeg_standaardvelden_toe('bezetting_periode');

create index idx_bezetting_locatie_datum on public.bezetting_periode (locatie_id, datum desc);

comment on constraint bezettingsgraad_realistisch on public.bezetting_periode is
  'Bovengrens 200% en niet 100%: bij kort parkeren kan de doorstroom op een dag
   groter zijn dan het aantal plekken. Boven 200% is het vrijwel zeker een
   rekenfout in de koppeling en wil je dat weten.';


-- -----------------------------------------------------------------------------
-- PROGNOSE — waar het signaal in de signaallus tegen afgezet wordt
-- -----------------------------------------------------------------------------
-- Zonder prognose geen signaallus: "omzet wijkt af" veronderstelt dat je weet
-- waarvan. Openstaande vraag uit Datamodel v2.0 §7: bestaan deze per locatie al?

create table public.prognose (
  id                uuid primary key default gen_random_uuid(),

  locatie_id        uuid not null references public.locatie(id) on delete restrict,
  jaar              integer not null,
  maand             integer not null check (maand between 1 and 12),

  verwachte_omzet   numeric(12,2),
  verwachte_bezetting numeric(5,2),

  methode           text,
  vastgesteld_op    date,
  vastgesteld_door  uuid references public.medewerker(id) on delete set null,

  unique (locatie_id, jaar, maand)
);

select public.voeg_standaardvelden_toe('prognose');
select public.voeg_wijzigingslog_toe('prognose');

create index idx_prognose_locatie on public.prognose (locatie_id, jaar desc, maand desc);

comment on column public.prognose.methode is
  'Hoe is deze prognose tot stand gekomen? Bijv. "vorig jaar +3%", "begroting 2026",
   "handmatig na contractwijziging". Nodig om een afwijking te kunnen duiden.';


-- -----------------------------------------------------------------------------
-- FACTUUR (FAC-00001)
-- -----------------------------------------------------------------------------

create sequence public.factuur_nummer_seq;

create table public.factuur (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.factuur_nummer_seq') unique,
  code              text generated always as (public.py_code('FAC', nummer, 5)) stored unique,

  relatie_id        uuid not null references public.relatie(id) on delete restrict,
  locatie_id        uuid references public.locatie(id) on delete set null,

  factuurdatum      date not null default current_date,
  vervaldatum       date,
  periode_van       date,
  periode_tot       date,

  bedrag_excl       numeric(12,2) not null,
  btw_bedrag        numeric(12,2) not null default 0,
  bedrag_incl       numeric(12,2) generated always as (bedrag_excl + btw_bedrag) stored,

  factuur_status    public.factuur_status not null default 'concept',

  -- De verwijzing terug naar AFAS. Zolang dit veld leeg is, is de factuur nog
  -- niet in de boekhouding geland — dat is de aansluitcontrole.
  afas_referentie   text,
  documentlink      text,

  constraint factuur_periode_logisch
    check (periode_tot is null or periode_van is null or periode_tot >= periode_van)
);

select public.voeg_standaardvelden_toe('factuur');
select public.voeg_wijzigingslog_toe('factuur');

create index idx_factuur_relatie on public.factuur (relatie_id);
create index idx_factuur_factuurstatus on public.factuur (factuur_status);
create index idx_factuur_openstaand on public.factuur (vervaldatum)
  where factuur_status = 'verzonden';

comment on column public.factuur.afas_referentie is
  'Leeg = nog niet in AFAS geboekt. Dit veld is de aansluiting tussen de
   operationele administratie hier en het grootboek daar.';


-- -----------------------------------------------------------------------------
-- SEPA_BATCH en SEPA_INCASSO
-- -----------------------------------------------------------------------------

create table public.sepa_batch (
  id              uuid primary key default gen_random_uuid(),
  batchreferentie text not null unique,

  incassodatum    date not null,
  aangemaakt_op   timestamptz not null default now(),
  verzonden_op    timestamptz,

  aantal_posten   integer not null default 0,
  totaalbedrag    numeric(12,2) not null default 0,

  documentlink    text
);

select public.voeg_standaardvelden_toe('sepa_batch');

create table public.sepa_incasso (
  id                uuid primary key default gen_random_uuid(),

  sepa_batch_id     uuid not null references public.sepa_batch(id) on delete cascade,
  factuur_id        uuid references public.factuur(id) on delete set null,
  relatie_id        uuid not null references public.relatie(id) on delete restrict,

  bedrag            numeric(12,2) not null,
  machtigingskenmerk text,

  gestorneerd       boolean not null default false,
  storneringsdatum  date,
  storneringsreden  text,

  constraint stornering_compleet
    check (not gestorneerd or storneringsdatum is not null)
);

select public.voeg_standaardvelden_toe('sepa_incasso');
select public.voeg_wijzigingslog_toe('sepa_incasso');

create index idx_sepa_incasso_batch   on public.sepa_incasso (sepa_batch_id);
create index idx_sepa_incasso_relatie on public.sepa_incasso (relatie_id);
create index idx_sepa_storneringen    on public.sepa_incasso (storneringsdatum)
  where gestorneerd;

comment on table public.sepa_incasso is
  'Eén regel per incassopoging. Storneringen zijn een veld en geen aparte tabel,
   zodat de poging en de uitkomst bij elkaar blijven staan.';


-- -----------------------------------------------------------------------------
-- RAPPORTAGE (RAP-2026-05-LOC-001)
-- -----------------------------------------------------------------------------
-- Administratie van wat er wanneer naar wie is gestuurd. Dit is wat mijlpaal M8
-- toetst: een gegenereerd rapport zonder regel hier is niet verzonden.

create table public.rapportage (
  id                uuid primary key default gen_random_uuid(),

  type              public.rapportage_type not null default 'eigenaarsrapport',
  locatie_id        uuid references public.locatie(id) on delete restrict,
  jaar              integer not null,
  maand             integer not null check (maand between 1 and 12),

  code              text generated always as (
                      'RAP-' || jaar::text || '-' || lpad(maand::text, 2, '0')
                    ) stored,

  gegenereerd_op    timestamptz,
  documentlink      text,

  verzonden_op      timestamptz,
  verzonden_aan_id  uuid references public.relatie(id) on delete set null,
  verzonden_aan_email citext,

  unique (type, locatie_id, jaar, maand)
);

select public.voeg_standaardvelden_toe('rapportage');
select public.voeg_wijzigingslog_toe('rapportage');

create index idx_rapportage_periode on public.rapportage (jaar desc, maand desc);
create index idx_rapportage_nietverzonden on public.rapportage (jaar, maand)
  where verzonden_op is null;

comment on column public.rapportage.verzonden_aan_id is
  'Wordt gevuld vanuit v_locatie_primaire_contactpartij. Zo is achteraf hard te
   maken dat de rapportage bij de juiste partij is beland — ook als de partij
   daarna is gewisseld.';
