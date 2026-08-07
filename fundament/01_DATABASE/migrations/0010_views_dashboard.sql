-- =============================================================================
-- ParkingYou datalaag — 0010 DASHBOARDWEERGAVEN
-- =============================================================================
-- Dit bestand levert de dwarsdoorsnede die vandaag ontbreekt: per locatie in één
-- oogopslag omzet (D1), storingen (D2), klantvragen (D3) en campagnes (D4).
--
-- Blauwdruk §3.3 noemt dit als hoofdreden voor de hele indeling. Het is ook de
-- toets van mijlpaal M6: als deze view klopt, werkt het fundament.
--
-- Waarom views en geen tabellen: een view kan niet verouderen. Er is geen
-- verversingsstap die kan mislukken en geen tweede plek waar dezelfde cijfers
-- anders uitkomen. Bij 37 locaties is de rekentijd verwaarloosbaar.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- V_LOCATIE_DASHBOARD — de dwarsdoorsnede
-- -----------------------------------------------------------------------------

create view public.v_locatie_dashboard as
with periode as (
  select
    date_trunc('month', current_date)::date                         as maand_start,
    (date_trunc('month', current_date) - interval '1 month')::date  as vorige_maand_start,
    (date_trunc('month', current_date) - interval '1 day')::date    as vorige_maand_eind,
    -- Een maandprognose vergelijken met de omzet tot nu toe geeft begin van de
    -- maand altijd een enorme "afwijking". Daarom rekenen we de prognose naar
    -- rato van het aantal dagen waarover al data binnen is.
    extract(day from (date_trunc('month', current_date)
                      + interval '1 month' - interval '1 day'))::numeric as dagen_in_maand
),
omzet_deze_maand as (
  select
    o.locatie_id,
    sum(o.bedrag_excl) as bedrag,
    -- Het aantal dagen waarover daadwerkelijk omzet is aangeleverd, niet het
    -- aantal verstreken kalenderdagen. Zo klopt de vergelijking ook als een
    -- koppeling twee dagen achterloopt of een dag heeft overgeslagen.
    count(distinct o.datum) as dagen_met_data
  from public.omzet_periode o, periode p
  where o.datum >= p.maand_start
  group by o.locatie_id
),
omzet_vorige_maand as (
  select o.locatie_id, sum(o.bedrag_excl) as bedrag
  from public.omzet_periode o, periode p
  where o.datum >= p.vorige_maand_start and o.datum <= p.vorige_maand_eind
  group by o.locatie_id
),
bezetting_30d as (
  select b.locatie_id, round(avg(b.bezettingsgraad), 1) as graad
  from public.bezetting_periode b
  where b.datum >= current_date - 30
  group by b.locatie_id
),
prognose_deze_maand as (
  select pr.locatie_id, pr.verwachte_omzet
  from public.prognose pr
  where pr.jaar  = extract(year  from current_date)::int
    and pr.maand = extract(month from current_date)::int
),
storingen_open as (
  select s.locatie_id,
         count(*)                                          as aantal,
         count(*) filter (where s.prioriteit = 'kritiek')   as aantal_kritiek,
         min(s.gemeld_op)                                   as oudste_melding
  from public.storing s
  where s.storing_status not in ('opgelost', 'afgesloten')
  group by s.locatie_id
),
abonnementen as (
  select a.locatie_id,
         count(*) filter (where a.abonnement_status = 'actief')      as actief,
         count(*) filter (where a.abonnement_status = 'aangevraagd') as aangevraagd
  from public.abonnement a
  group by a.locatie_id
),
kenteken_openstaand as (
  select a.locatie_id, count(*) as aantal
  from public.kenteken_mutatie km
  join public.abonnement a on a.id = km.abonnement_id
  where not km.verwerkt_in_parkeersysteem
  group by a.locatie_id
),
klantvragen_open as (
  select k.locatie_id, count(*) as aantal
  from public.klantvraag k
  where k.klantvraag_status <> 'afgehandeld'
  group by k.locatie_id
),
campagnes_lopend as (
  select cl.locatie_id, count(*) as aantal
  from public.campagne_locatie cl
  join public.campagne c on c.id = cl.campagne_id
  where c.campagne_status = 'actief'
  group by cl.locatie_id
)
select
  l.code                                    as locatie_code,
  l.naam                                    as locatie_naam,
  l.plaats,
  l.dienstverleningstype,
  l.capaciteit,
  hp.systeempartner,
  hp.koppeling_status,
  pc.relatie_naam                           as primaire_contactpartij,
  mw.volledige_naam                         as parkeerhost,

  -- D1
  coalesce(od.bedrag, 0)                    as omzet_deze_maand,
  coalesce(ov.bedrag, 0)                    as omzet_vorige_maand,
  pg.verwachte_omzet                        as prognose_hele_maand,
  round(pg.verwachte_omzet * coalesce(od.dagen_met_data, 0) / p.dagen_in_maand, 2)
                                            as prognose_tot_nu,
  coalesce(od.dagen_met_data, 0)::int       as dagen_met_data,
  -- Afwijking ten opzichte van de naar rato berekende prognose. Blijft leeg
  -- zolang er nog geen dag data in de maand zit; een percentage op nul dagen
  -- zegt niets.
  case
    when pg.verwachte_omzet is null or pg.verwachte_omzet = 0
      or coalesce(od.dagen_met_data, 0) = 0 then null
    else round(
           ((coalesce(od.bedrag, 0) - (pg.verwachte_omzet * od.dagen_met_data / p.dagen_in_maand))
             / (pg.verwachte_omzet * od.dagen_met_data / p.dagen_in_maand)) * 100, 1)
  end                                       as afwijking_prognose_pct,
  bz.graad                                  as bezettingsgraad_30d,

  -- D2
  coalesce(so.aantal, 0)                    as storingen_open,
  coalesce(so.aantal_kritiek, 0)            as storingen_kritiek,
  so.oudste_melding                         as oudste_open_storing,

  -- D3
  coalesce(ab.actief, 0)                    as abonnementen_actief,
  coalesce(ab.aangevraagd, 0)               as abonnementen_aangevraagd,
  coalesce(km.aantal, 0)                    as kentekenmutaties_openstaand,
  coalesce(kv.aantal, 0)                    as klantvragen_open,

  -- D4
  coalesce(ca.aantal, 0)                    as campagnes_lopend

from public.locatie l
cross join periode p
left join public.v_locatie_huidige_partner        hp on hp.locatie_id = l.id
left join public.v_locatie_primaire_contactpartij pc on pc.locatie_id = l.id
left join public.medewerker mw on mw.id = l.parkeerhost_id
left join omzet_deze_maand       od on od.locatie_id = l.id
left join omzet_vorige_maand     ov on ov.locatie_id = l.id
left join prognose_deze_maand    pg on pg.locatie_id = l.id
left join bezetting_30d          bz on bz.locatie_id = l.id
left join storingen_open         so on so.locatie_id = l.id
left join abonnementen           ab on ab.locatie_id = l.id
left join kenteken_openstaand    km on km.locatie_id = l.id
left join klantvragen_open       kv on kv.locatie_id = l.id
left join campagnes_lopend       ca on ca.locatie_id = l.id
where l.status = 'actief';

comment on view public.v_locatie_dashboard is
  'De dwarsdoorsnede per locatie uit Blauwdruk §3.3. Dit is de weergave die
   mijlpaal M6 toetst en waar het eigenaarsportaal en de dashboards op bouwen.';


-- -----------------------------------------------------------------------------
-- V_SIGNAAL_ONDERPRESTATIE — stap 1 van de signaallus
-- -----------------------------------------------------------------------------
-- Blauwdruk §9.1: "het dashboard signaleert: omzet LOC-014 wijkt af van prognose".
-- Alleen exploitatielocaties, want alleen die hebben per definitie omzet.

create view public.v_signaal_onderprestatie as
select
  d.locatie_code,
  d.locatie_naam,
  d.plaats,
  d.omzet_deze_maand,
  d.prognose_tot_nu,
  d.prognose_hele_maand,
  d.afwijking_prognose_pct,
  d.dagen_met_data,
  d.storingen_open,
  d.storingen_kritiek,
  d.campagnes_lopend,
  case
    when d.storingen_kritiek > 0 then 'kritieke storing open — eerst Operatie'
    when d.storingen_open   > 0  then 'storing open — mogelijke oorzaak bij Operatie'
    when d.campagnes_lopend > 0  then 'campagne loopt al'
    else 'geen interne oorzaak gevonden — extern onderzoeken of campagne overwegen'
  end as vervolgstap
from public.v_locatie_dashboard d
where d.dienstverleningstype = 'exploitatie'
  and d.prognose_tot_nu is not null
  -- Niet signaleren op een handvol dagen: een lang weekend of één regenweek
  -- zou anders elke maand vals alarm geven.
  and d.dagen_met_data >= 7
  and d.afwijking_prognose_pct < -10
order by d.afwijking_prognose_pct;

comment on view public.v_signaal_onderprestatie is
  'Locaties die meer dan 10% onder de naar rato berekende prognose draaien, met
   de eerste oorzaakcheck al uitgevoerd. Twee bewuste drempels: minimaal 7 dagen
   data in de maand, en minimaal 10% afwijking. Beide zijn startwaarden — na een
   half jaar echte data worden ze bijgesteld op wat werkelijk ruis blijkt.';


-- -----------------------------------------------------------------------------
-- V_MAANDOVERZICHT_LOCATIE — de basis van het eigenaarsrapport
-- -----------------------------------------------------------------------------

create view public.v_maandoverzicht_locatie as
select
  l.code                                  as locatie_code,
  l.naam                                  as locatie_naam,
  date_trunc('month', o.datum)::date      as maand,
  o.omzetsoort,
  sum(o.bedrag_excl)                      as omzet_excl,
  sum(o.btw_bedrag)                       as btw,
  sum(o.bedrag_incl)                      as omzet_incl,
  sum(o.aantal)                           as aantal_transacties
from public.locatie l
join public.omzet_periode o on o.locatie_id = l.id
where l.dienstverleningstype = 'exploitatie'
group by l.code, l.naam, date_trunc('month', o.datum), o.omzetsoort;

comment on view public.v_maandoverzicht_locatie is
  'Voedt de automatische eigenaarsrapportage in fase 3 (mijlpaal M8).';


-- -----------------------------------------------------------------------------
-- V_WERKLIJST_KENTEKENMUTATIES — de dagelijkse controle van klantenservice
-- -----------------------------------------------------------------------------
-- Elke regel hier is een klant die mogelijk voor een dichte slagboom staat.

create view public.v_werklijst_kentekenmutaties as
select
  km.id,
  a.code                as abonnement_code,
  r.naam                as abonnee,
  r.email               as abonnee_email,
  l.code                as locatie_code,
  l.naam                as locatie_naam,
  hp.systeempartner,
  km.kenteken_oud,
  km.kenteken_nieuw,
  km.gewijzigd_op,
  km.gewijzigd_door,
  km.verwerkingsfout,
  round(extract(epoch from (now() - km.gewijzigd_op)) / 3600)::int as uren_openstaand
from public.kenteken_mutatie km
join public.abonnement a on a.id = km.abonnement_id
join public.relatie    r on r.id = a.relatie_id
join public.locatie    l on l.id = a.locatie_id
left join public.v_locatie_huidige_partner hp on hp.locatie_id = l.id
where not km.verwerkt_in_parkeersysteem
order by km.gewijzigd_op;

comment on view public.v_werklijst_kentekenmutaties is
  'Kentekenwijzigingen die nog niet in het parkeersysteem staan. Elke regel is
   een klant die morgen voor een dichte slagboom kan staan — dit is de lijst die
   elke ochtend leeg hoort te zijn.';


-- -----------------------------------------------------------------------------
-- V_DATAKWALITEIT — wat is er nog niet ingevuld?
-- -----------------------------------------------------------------------------
-- Deze view is het afvinkinstrument van fase 0. Zolang hier regels in staan, is
-- mijlpaal M1 niet gehaald.

create view public.v_datakwaliteit as
select 'locatie zonder systeempartner' as bevinding, l.code as record, l.naam as toelichting
from public.locatie l
left join public.systeem_historie sh on sh.locatie_id = l.id and sh.actief_tot is null
where l.status = 'actief' and sh.id is null

union all
select 'locatie zonder contractpartij', l.code, l.naam
from public.locatie l
left join public.locatie_partij lp on lp.locatie_id = l.id and lp.actief_tot is null
where l.status = 'actief' and lp.id is null

union all
select 'locatie zonder primaire contactpartij', l.code, l.naam
from public.locatie l
where l.status = 'actief'
  and not exists (
    select 1 from public.locatie_partij lp
    where lp.locatie_id = l.id and lp.primaire_contactpartij and lp.actief_tot is null
  )

union all
select 'exploitatielocatie zonder capaciteit', l.code, l.naam
from public.locatie l
where l.status = 'actief' and l.dienstverleningstype = 'exploitatie' and l.capaciteit is null

union all
select 'exploitatielocatie zonder parkeerhost', l.code, l.naam
from public.locatie l
where l.status = 'actief' and l.dienstverleningstype = 'exploitatie' and l.parkeerhost_id is null

union all
select 'actief abonnement zonder kenteken', a.code, r.naam
from public.abonnement a
join public.relatie r on r.id = a.relatie_id
where a.abonnement_status = 'actief' and a.kenteken_huidig is null

union all
select 'actief abonnement zonder SEPA-akkoord', a.code, r.naam
from public.abonnement a
join public.relatie r on r.id = a.relatie_id
where a.abonnement_status = 'actief' and a.sepa_status <> 'akkoord'

union all
select 'connector zonder eigenaar', c.naam, c.omschrijving
from public.connector c
where c.connector_status = 'actief' and c.eigenaar_id is null;

comment on view public.v_datakwaliteit is
  'Alles wat nog niet is ingevuld, op één plek. Fase 0 is klaar als deze view
   leeg is voor de eerste vijf bevindingen. Daarna blijft hij de maandelijkse
   controle van de domeineigenaren.';
