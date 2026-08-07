-- =============================================================================
-- ParkingYou datalaag — 0007 DOMEIN D4: MARKETING
-- =============================================================================
-- Eigenaar: Marketing. Campagnes, content en het terugmeten van resultaat.
--
-- De reden dat campagne_resultaat een eigen tabel is en geen paar velden op
-- campagne: het effect wordt per locatie gemeten en over een venster vóór,
-- tijdens en ná de campagne. Een campagne over drie locaties heeft dus drie
-- resultaatregels, en dat is precies wat je wilt weten — werkt deze aanpak
-- overal even goed?
--
-- Dit sluit de signaallus uit Blauwdruk §9: omzetdaling -> oorzaakcheck ->
-- campagne -> effectmeting -> leren.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- CAMPAGNE (CAM-0001)
-- -----------------------------------------------------------------------------

create sequence public.campagne_nummer_seq;

create table public.campagne (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.campagne_nummer_seq') unique,
  code              text generated always as (public.py_code('CAM', nummer, 4)) stored unique,

  naam              text not null,
  doel              text,
  is_merkbreed      boolean not null default false,

  kanalen           text[],
  startdatum        date,
  einddatum         date,
  budget            numeric(10,2),
  werkelijke_kosten numeric(10,2),

  campagne_status   public.campagne_status not null default 'concept',

  -- Waar kwam deze campagne vandaan? Bij een campagne uit de signaallus staat
  -- hier de aanleiding, zodat achteraf te zien is of datagedreven campagnes het
  -- beter doen dan onderbuikcampagnes.
  aanleiding        text,
  uit_signaal       boolean not null default false,

  -- Verwijzing naar de campagnemap in de documentlaag
  documentlink      text,

  constraint campagne_looptijd_logisch
    check (einddatum is null or startdatum is null or einddatum >= startdatum)
);

select public.voeg_standaardvelden_toe('campagne');
select public.voeg_wijzigingslog_toe('campagne');

create index idx_campagne_campagnestatus on public.campagne (campagne_status);
create index idx_campagne_looptijd on public.campagne (startdatum, einddatum);

comment on column public.campagne.uit_signaal is
  'True als deze campagne is gestart naar aanleiding van een automatisch signaal
   uit de signaallus. Maakt na een jaar de vraag beantwoordbaar of signaal-
   gedreven campagnes beter renderen.';
comment on column public.campagne.documentlink is
  'Pad naar de campagnemap, bijv. 04_MARKETING/02_Campagnes/CAM-0012_Zomeractie_LOC-014/';


-- -----------------------------------------------------------------------------
-- CAMPAGNE_LOCATIE — welke locaties raakt deze campagne
-- -----------------------------------------------------------------------------
-- Een merkbrede campagne heeft geen regels hier; een locatiecampagne één of
-- meer. Zo hoeft "is dit een locatiecampagne" nergens dubbel bijgehouden.

create table public.campagne_locatie (
  id           uuid primary key default gen_random_uuid(),
  campagne_id  uuid not null references public.campagne(id) on delete cascade,
  locatie_id   uuid not null references public.locatie(id)  on delete restrict,

  unique (campagne_id, locatie_id)
);

select public.voeg_standaardvelden_toe('campagne_locatie');

create index idx_campagne_locatie_loc on public.campagne_locatie (locatie_id);


-- -----------------------------------------------------------------------------
-- CONTENTITEM (CNT-00001)
-- -----------------------------------------------------------------------------

create sequence public.contentitem_nummer_seq;

create table public.contentitem (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.contentitem_nummer_seq') unique,
  code              text generated always as (public.py_code('CNT', nummer, 5)) stored unique,

  campagne_id       uuid references public.campagne(id) on delete set null,
  locatie_id        uuid references public.locatie(id)  on delete set null,

  titel             text not null,
  contenttype       public.contenttype not null,
  kanaal            text,

  gepland_op        date,
  gepubliceerd_op   date,
  publicatie_url    text,

  -- Het bestand zelf leeft in de documentlaag; hier staat waar.
  documentlink      text,
  ontwerp_url       text,   -- bijv. de Canva-link

  -- Kanaalstatistieken, per kanaal verschillend van vorm
  statistieken      jsonb,

  constraint contentitem_gepubliceerd_heeft_datum
    check (gepubliceerd_op is null or gepland_op is null or gepubliceerd_op >= gepland_op - 365)
);

select public.voeg_standaardvelden_toe('contentitem');

create index idx_contentitem_campagne on public.contentitem (campagne_id);
create index idx_contentitem_locatie  on public.contentitem (locatie_id);
create index idx_contentitem_publicatie on public.contentitem (gepubliceerd_op desc);

comment on column public.contentitem.statistieken is
  'Vrije structuur omdat elk kanaal iets anders levert, bijv.
   {"bereik": 4820, "interacties": 137, "kliks": 61}. Wordt gevuld door de
   kanaalkoppelingen; handmatig invullen mag ook.';


-- -----------------------------------------------------------------------------
-- CAMPAGNE_RESULTAAT — de terugmeting die de lus sluit
-- -----------------------------------------------------------------------------

create table public.campagne_resultaat (
  id                uuid primary key default gen_random_uuid(),

  campagne_id       uuid not null references public.campagne(id) on delete cascade,
  locatie_id        uuid references public.locatie(id) on delete set null,

  -- Drie vensters van gelijke lengte, zodat de vergelijking eerlijk is
  venster_dagen     integer not null default 30,
  omzet_voor        numeric(12,2),
  omzet_tijdens     numeric(12,2),
  omzet_na          numeric(12,2),

  omzet_delta       numeric(12,2) generated always as (
                      coalesce(omzet_na, 0) - coalesce(omzet_voor, 0)
                    ) stored,

  toegerekende_kosten numeric(10,2),

  roi               numeric(10,4) generated always as (
                      case
                        when toegerekende_kosten is null or toegerekende_kosten = 0 then null
                        else (coalesce(omzet_na, 0) - coalesce(omzet_voor, 0)) / toegerekende_kosten
                      end
                    ) stored,

  gemeten_op        timestamptz not null default now(),
  toelichting       text,

  unique (campagne_id, locatie_id)
);

select public.voeg_standaardvelden_toe('campagne_resultaat');

create index idx_campagne_resultaat_campagne on public.campagne_resultaat (campagne_id);
create index idx_campagne_resultaat_locatie  on public.campagne_resultaat (locatie_id);

comment on table public.campagne_resultaat is
  'De terugkoppeling van D1 naar D4 uit Blauwdruk §9.1, stap 5. Wordt automatisch
   gevuld uit omzet_periode zodra het na-venster verstreken is.';
comment on column public.campagne_resultaat.roi is
  'Omzetdelta gedeeld door toegerekende kosten. 0,5 betekent: vijftig cent extra
   omzet per geïnvesteerde euro. Leeg zolang de kosten niet zijn toegerekend —
   bewust, want een ROI zonder kosten is een misleidend getal.';
