-- =============================================================================
-- ParkingYou datalaag — 0003 KOPPELTABELLEN
-- =============================================================================
-- Dit bestand repareert correctie 1 en 2 uit Datamodel v2.0. Beide zijn goedkoop
-- om nu te bouwen en duur om over twee jaar te ontdekken:
--
--   locatie_partij    Een eigenaar kan meerdere locaties hebben, én een locatie
--                     kan meerdere contractpartijen hebben (VvE, gemeente,
--                     beheerder). Zonder deze tabel kun je de maandrapportage
--                     niet naar de juiste partij sturen en kun je een eigenaar
--                     met 6 locaties niet in één keer overzien.
--
--   systeem_historie  Locaties wisselen soms van systeempartner. Zonder historie
--                     weet je over drie jaar niet meer waarom de datastroom van
--                     LOC-014 in mei 2027 van formaat veranderde. Een tabel van
--                     tien regels die een structurele fout voorkomt.
-- =============================================================================

-- Nodig voor de exclusion constraints hieronder: die voorkomen overlappende
-- perioden, wat een gewone unique index niet kan.
create extension if not exists btree_gist;


-- -----------------------------------------------------------------------------
-- LOCATIE_PARTIJ — wie heeft welke rol bij welke locatie, en sinds wanneer
-- -----------------------------------------------------------------------------

create table public.locatie_partij (
  id                     uuid primary key default gen_random_uuid(),

  locatie_id             uuid not null references public.locatie(id)  on delete restrict,
  relatie_id             uuid not null references public.relatie(id)  on delete restrict,
  rol                    public.partij_rol not null,
  contract_id            uuid references public.contract(id) on delete set null,

  -- Wie krijgt de maandrapportage? Precies één partij per locatie.
  primaire_contactpartij boolean not null default false,

  actief_van             date not null default current_date,
  actief_tot             date,

  constraint locatie_partij_periode_logisch
    check (actief_tot is null or actief_tot >= actief_van),

  -- Dezelfde partij kan niet twee keer tegelijk dezelfde rol hebben op één locatie.
  -- De enum staat rechtstreeks in de gist-index; casten naar text zou hier niet
  -- werken omdat die cast stable is en geen immutable, wat een index vereist.
  exclude using gist (
    locatie_id with =,
    relatie_id with =,
    rol with =,
    daterange(actief_van, actief_tot, '[)') with &&
  )
);

select public.voeg_standaardvelden_toe('locatie_partij');
select public.voeg_wijzigingslog_toe('locatie_partij');

-- Hooguit één primaire contactpartij per locatie tegelijk. Dit is de reden dat
-- de eigenaarsrapportage altijd bij precies één adres uitkomt.
create unique index idx_locatie_partij_een_primaire
  on public.locatie_partij (locatie_id)
  where primaire_contactpartij and actief_tot is null;

create index idx_locatie_partij_locatie on public.locatie_partij (locatie_id);
create index idx_locatie_partij_relatie on public.locatie_partij (relatie_id);
create index idx_locatie_partij_actief  on public.locatie_partij (locatie_id)
  where actief_tot is null;

comment on table public.locatie_partij is
  'Koppeltabel locatie <-> contractpartij (Datamodel v2.0, correctie 1).
   Vervangt het veld "eigenaar" dat in Blauwdruk v1.0 op locatie stond.';
comment on column public.locatie_partij.actief_tot is
  'Leeg = deze partij is nu actief bij deze locatie. Ingevuld = historie, zodat
   een partijwissel navolgbaar blijft.';


-- -----------------------------------------------------------------------------
-- SYSTEEM_HISTORIE — welk parkeersysteem draaide wanneer op welke locatie
-- -----------------------------------------------------------------------------

create table public.systeem_historie (
  id                  uuid primary key default gen_random_uuid(),

  locatie_id          uuid not null references public.locatie(id) on delete restrict,
  systeempartner      public.systeempartner not null,

  actief_van          date not null default current_date,
  actief_tot          date,

  koppeling_status    public.koppeling_status not null default 'geen',

  -- Hoe heet deze locatie in het systeem van de leverancier? Dit veld is wat de
  -- koppeling in fase 2 nodig heeft om binnenkomende transacties aan de juiste
  -- LOC-code te hangen. SKIDATA noemt LOC-014 bijvoorbeeld "facility 42".
  externe_locatie_id  text,
  externe_naam        text,

  constraint systeem_historie_periode_logisch
    check (actief_tot is null or actief_tot >= actief_van),

  -- Twee systeempartners tegelijk op één locatie kan niet
  exclude using gist (
    locatie_id with =,
    daterange(actief_van, actief_tot, '[)') with &&
  )
);

select public.voeg_standaardvelden_toe('systeem_historie');
select public.voeg_wijzigingslog_toe('systeem_historie');

create index idx_systeem_historie_locatie on public.systeem_historie (locatie_id);
create index idx_systeem_historie_partner on public.systeem_historie (systeempartner)
  where actief_tot is null;
create unique index idx_systeem_historie_extern
  on public.systeem_historie (systeempartner, externe_locatie_id)
  where externe_locatie_id is not null and actief_tot is null;

comment on table public.systeem_historie is
  'Systeempartner per locatie, met historie (Datamodel v2.0, correctie 2).
   Vervangt het veld "systeempartner" dat in Blauwdruk v1.0 op locatie stond.';
comment on column public.systeem_historie.externe_locatie_id is
  'De identificatie van deze locatie in het bronsysteem. De koppeling gebruikt
   dit veld om binnenkomende transacties aan de juiste LOC-code te hangen.';


-- -----------------------------------------------------------------------------
-- Hulpweergaven — zodat "de huidige situatie" nergens nagebouwd hoeft te worden
-- -----------------------------------------------------------------------------
-- Zonder deze views zou elke query, elk dashboard en elke koppeling zelf de
-- "waar actief_tot leeg is"-logica moeten herhalen. Dat is precies hoe subtiele
-- verschillen tussen rapportages ontstaan.

create view public.v_locatie_huidige_partner as
select
  l.id            as locatie_id,
  l.code          as locatie_code,
  l.naam          as locatie_naam,
  sh.systeempartner,
  sh.koppeling_status,
  sh.externe_locatie_id,
  sh.actief_van   as partner_sinds
from public.locatie l
left join public.systeem_historie sh
  on sh.locatie_id = l.id
 and sh.actief_tot is null
 and sh.status = 'actief';

comment on view public.v_locatie_huidige_partner is
  'Per locatie de systeempartner die er nú op draait. Een locatie zonder regel
   hier is een openstaande actie in fase 0, geen fout.';


create view public.v_locatie_primaire_contactpartij as
select
  l.id          as locatie_id,
  l.code        as locatie_code,
  l.naam        as locatie_naam,
  r.id          as relatie_id,
  r.code        as relatie_code,
  r.naam        as relatie_naam,
  r.email       as relatie_email,
  lp.rol,
  lp.contract_id
from public.locatie l
left join public.locatie_partij lp
  on lp.locatie_id = l.id
 and lp.primaire_contactpartij
 and lp.actief_tot is null
 and lp.status = 'actief'
left join public.relatie r on r.id = lp.relatie_id;

comment on view public.v_locatie_primaire_contactpartij is
  'Naar wie gaat de maandrapportage van deze locatie? Dit is de bron voor de
   verzendlijst in fase 3 — een lege relatie_naam betekent: nog niet ingevuld.';
