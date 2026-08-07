-- =============================================================================
-- ParkingYou datalaag — 0005 DOMEIN D2: OPERATIE
-- =============================================================================
-- Eigenaar: Operatie. Storingen, werkorders voor parkeerhosts en onderhouds-
-- historie van de apparatuur.
--
-- Waarom storingen en werkorders gescheiden zijn: één storing kan meerdere
-- bezoeken vergen, en een parkeerhost krijgt ook werkorders die niets met een
-- storing te maken hebben (pasuitgifte, dagelijkse ronde). Ze in één tabel
-- proppen levert een statusveld op dat twee dingen tegelijk probeert te zeggen.
--
-- Volume ter oriëntatie: ~100 storingen per maand over 37 locaties.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- STORING (TCK-00001)
-- -----------------------------------------------------------------------------

create sequence public.storing_nummer_seq;

create table public.storing (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.storing_nummer_seq') unique,
  code              text generated always as (public.py_code('TCK', nummer, 5)) stored unique,

  locatie_id        uuid not null references public.locatie(id) on delete restrict,
  apparaat_id       uuid references public.apparaat(id) on delete set null,

  melding           text not null,
  categorie         text,
  prioriteit        public.prioriteit not null default 'normaal',
  storing_status    public.storing_status not null default 'gemeld',

  -- Hoe kwam de melding binnen? De intercom is hier de interessante: een
  -- intercommelding bij een dichte slagboom is tegelijk een klantvraag (D3) én
  -- een storingssignaal (D2). Datamodel v2.0 §3.3 noemt dit de meest verborgen
  -- datastroom van het bedrijf.
  gemeld_via        public.kanaal,
  gemeld_door       text,

  gemeld_op         timestamptz not null default now(),
  opgepakt_op       timestamptz,
  opgelost_op       timestamptz,

  doorlooptijd      interval generated always as (opgelost_op - gemeld_op) stored,

  toegewezen_aan_id uuid references public.medewerker(id) on delete set null,
  oplossing         text,

  -- Referentie bij de systeempartner, als de storing daar ook een ticket heeft
  bron              public.databron not null default 'handmatig',
  externe_referentie text,

  constraint storing_tijdlijn_logisch
    check (opgelost_op is null or opgelost_op >= gemeld_op),
  constraint storing_opgelost_heeft_oplossing
    check (storing_status not in ('opgelost', 'afgesloten')
           or (opgelost_op is not null and oplossing is not null))
);

select public.voeg_standaardvelden_toe('storing');
select public.voeg_wijzigingslog_toe('storing');

create index idx_storing_locatie   on public.storing (locatie_id, gemeld_op desc);
create index idx_storing_apparaat  on public.storing (apparaat_id);
create index idx_storing_open      on public.storing (locatie_id)
  where storing_status not in ('opgelost', 'afgesloten');
create index idx_storing_host      on public.storing (toegewezen_aan_id)
  where storing_status not in ('opgelost', 'afgesloten');

comment on constraint storing_opgelost_heeft_oplossing on public.storing is
  'Een storing kan niet op opgelost gezet worden zonder te noteren hóé. Dit is
   wat de storingshistorie over een jaar bruikbaar maakt in plaats van een lijst
   afgevinkte regels.';

comment on column public.storing.doorlooptijd is
  'Automatisch berekend. Levert zonder extra werk de kerncijfers per locatie en
   per apparaattype op: waar staat het het vaakst stil, en hoe lang.';


-- -----------------------------------------------------------------------------
-- WERKORDER — wat een parkeerhost concreet moet gaan doen
-- -----------------------------------------------------------------------------

create sequence public.werkorder_nummer_seq;

create table public.werkorder (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.werkorder_nummer_seq') unique,
  code              text generated always as (public.py_code('WRK', nummer, 5)) stored unique,

  locatie_id        uuid not null references public.locatie(id) on delete restrict,
  storing_id        uuid references public.storing(id) on delete set null,

  soort             text not null,   -- bijv. 'pasuitgifte', 'dagelijkse ronde', 'reparatie'
  omschrijving      text not null,
  prioriteit        public.prioriteit not null default 'normaal',
  werkorder_status  public.werkorder_status not null default 'open',

  toegewezen_aan_id uuid references public.medewerker(id) on delete set null,
  gepland_op        date,
  uitgevoerd_op     timestamptz,
  bestede_tijd_min  integer,
  terugkoppeling    text,

  constraint werkorder_uitgevoerd_heeft_datum
    check (werkorder_status <> 'uitgevoerd' or uitgevoerd_op is not null)
);

select public.voeg_standaardvelden_toe('werkorder');
select public.voeg_wijzigingslog_toe('werkorder');

create index idx_werkorder_locatie on public.werkorder (locatie_id);
create index idx_werkorder_storing on public.werkorder (storing_id);
create index idx_werkorder_open    on public.werkorder (toegewezen_aan_id, gepland_op)
  where werkorder_status in ('open', 'ingepland');

comment on table public.werkorder is
  'Het werk van de parkeerhosts. Een werkorder kan uit een storing voortkomen
   (storing_id gevuld) of los bestaan, zoals pasuitgifte bij een nieuw abonnement.';


-- -----------------------------------------------------------------------------
-- ONDERHOUD — preventief en correctief onderhoud per apparaat
-- -----------------------------------------------------------------------------

create table public.onderhoud (
  id              uuid primary key default gen_random_uuid(),

  apparaat_id     uuid not null references public.apparaat(id) on delete cascade,
  storing_id      uuid references public.storing(id) on delete set null,

  datum           date not null default current_date,
  soort           text not null check (soort in ('preventief', 'correctief', 'inspectie', 'vervanging')),
  uitgevoerd_door_id uuid references public.relatie(id) on delete set null,

  omschrijving    text,
  kosten          numeric(10,2),
  documentlink    text
);

select public.voeg_standaardvelden_toe('onderhoud');

create index idx_onderhoud_apparaat on public.onderhoud (apparaat_id, datum desc);

comment on column public.onderhoud.uitgevoerd_door_id is
  'Verwijst naar het relatieregister, want onderhoud wordt doorgaans door een
   externe partij gedaan. Eigen werk laat je leeg en leg je vast in werkorder.';
