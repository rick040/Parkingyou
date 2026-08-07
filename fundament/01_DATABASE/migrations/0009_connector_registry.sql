-- =============================================================================
-- ParkingYou datalaag — 0009 CONNECTOR REGISTRY
-- =============================================================================
-- Hub Architecture v0.2 §4: het overzicht van élke databron, huidig én
-- toekomstig. De regel eromheen is streng en de moeite waard:
--
--   "Geen enkele databron mag gebruikt worden zonder hier eerst een regel te
--    hebben — dit voorkomt dat je over 2 jaar weer niet weet wat er allemaal loopt."
--
-- Het staat als tabel en niet als Excel, precies om de reden die de blauwdruk
-- zelf noemt: een lijst is data.
--
-- Governance-regel 4 uit Hub v0.2 §6 krijgt hier tanden: elke handmatige stap
-- moet een reden hebben waarom hij nog handmatig is. Dat veld is verplicht.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- CONNECTOR — één regel per databron
-- -----------------------------------------------------------------------------

create table public.connector (
  id                    uuid primary key default gen_random_uuid(),

  naam                  text not null unique,
  bron                  public.databron not null,
  domein                text not null,          -- D1..D5, of meerdere
  omschrijving          text,

  koppeltype            public.koppeling_status not null default 'geen',
  connector_status      public.connector_status not null default 'voorgesteld',

  levert_aan            text,                   -- welke tabellen deze bron vult
  sync_frequentie       text,                   -- 'dagelijks 06:00', 'realtime', 'maandelijks'

  eigenaar_id           uuid references public.medewerker(id) on delete set null,
  leverancier_id        uuid references public.relatie(id) on delete set null,
  contactpersoon        text,

  -- Governance-regel 4: handmatig is altijd tijdelijk
  is_automatiseringskandidaat boolean not null default false,
  reden_nog_handmatig   text,

  -- Aanvraagadministratie. Dit is het kritieke pad in fase 0: de doorlooptijd
  -- van deze aanvragen bepaalt wanneer fase 2 kan beginnen.
  aanvraag_verstuurd_op date,
  aanvraag_antwoord_op  date,
  documentatie_link     text,

  laatste_succesvolle_run timestamptz,

  constraint connector_handmatig_heeft_reden
    check (koppeltype <> 'handmatig' or reden_nog_handmatig is not null)
);

select public.voeg_standaardvelden_toe('connector');
select public.voeg_wijzigingslog_toe('connector');

create index idx_connector_connectorstatus on public.connector (connector_status);
create index idx_connector_bron   on public.connector (bron);

comment on constraint connector_handmatig_heeft_reden on public.connector is
  'Hub v0.2 §6, regel 4: handmatige invoer is altijd tijdelijk en moet een reden
   hebben. Zonder deze constraint verdwijnt die regel binnen een half jaar uit
   het geheugen van iedereen.';
comment on column public.connector.aanvraag_verstuurd_op is
  'Wanneer is bij deze leverancier de koppelmogelijkheid opgevraagd? Mijlpaal M0
   is gehaald zodra dit veld voor alle vier de parkeersystemen gevuld is.';


-- -----------------------------------------------------------------------------
-- KOPPELING_RUN — draaide de import, en wat kwam eruit
-- -----------------------------------------------------------------------------
-- Zonder deze tabel merk je een stilgevallen koppeling pas als iemand een
-- rapportage mist. Met deze tabel is "welke koppeling heeft vandaag niet
-- gedraaid" één query.

create table public.koppeling_run (
  id                uuid primary key default gen_random_uuid(),

  connector_id      uuid not null references public.connector(id) on delete cascade,

  gestart_op        timestamptz not null default now(),
  geeindigd_op      timestamptz,
  geslaagd          boolean,

  records_gelezen   integer,
  records_verwerkt  integer,
  records_genegeerd integer,

  periode_van       date,
  periode_tot       date,

  foutmelding       text,
  details           jsonb
);

create index idx_koppeling_run_connector on public.koppeling_run (connector_id, gestart_op desc);
create index idx_koppeling_run_mislukt   on public.koppeling_run (gestart_op desc)
  where geslaagd is not true;

comment on table public.koppeling_run is
  'Uitvoeringslog van de koppelingen. Bewust zonder levenscyclusvelden: dit is
   een technisch log, geen bedrijfsdata.';


-- Houdt connector.laatste_succesvolle_run bij, zodat de registry zelf laat zien
-- wat er leeft en wat er stilstaat.
create or replace function public.werk_connector_laatste_run_bij()
returns trigger
language plpgsql
as $$
begin
  if new.geslaagd then
    update public.connector
       set laatste_succesvolle_run = coalesce(new.geeindigd_op, new.gestart_op)
     where id = new.connector_id;
  end if;
  return new;
end;
$$;

create trigger trg_koppeling_run_bijwerken
  after insert or update of geslaagd on public.koppeling_run
  for each row execute function public.werk_connector_laatste_run_bij();


-- -----------------------------------------------------------------------------
-- Weergave: welke koppelingen staan stil?
-- -----------------------------------------------------------------------------

create view public.v_connector_gezondheid as
select
  c.naam,
  c.bron,
  c.domein,
  c.connector_status,
  c.koppeltype,
  c.sync_frequentie,
  c.laatste_succesvolle_run,
  case
    when c.connector_status <> 'actief'          then 'niet actief'
    when c.laatste_succesvolle_run is null       then 'nog nooit gedraaid'
    when c.laatste_succesvolle_run < now() - interval '48 hours' then 'langer dan 48 uur stil'
    when c.laatste_succesvolle_run < now() - interval '26 hours' then 'gemist etmaal'
    else 'in orde'
  end as gezondheid,
  (select count(*) from public.koppeling_run r
    where r.connector_id = c.id
      and r.geslaagd is not true
      and r.gestart_op > now() - interval '7 days') as mislukte_runs_7d
from public.connector c;

comment on view public.v_connector_gezondheid is
  'Het ochtendoverzicht: draait alles nog? Alles met gezondheid <> ''in orde'' is
   werk. Geldt ook voor mijlpaal M7 — nul locaties met een gat.';
