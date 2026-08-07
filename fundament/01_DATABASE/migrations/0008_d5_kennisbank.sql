-- =============================================================================
-- ParkingYou datalaag — 0008 DOMEIN D5: KENNISBANK ("De Almanak")
-- =============================================================================
-- Eigenaar: Klantenservice. Alles wat ParkingYou wéét, op één plek.
--
-- Waarom dit een tabel is en geen Word-document: dit is exact de data die later
-- in de klantenservicebot geladen wordt (Data Framework §5). Een artikel heeft
-- daarvoor meer nodig dan tekst — het heeft triggerwoorden, uitvoerbare stappen,
-- en de vraag of er menselijke goedkeuring nodig is. Dat past niet in proza.
--
-- De volgorde in de roadmap is niet toevallig: de bot kan pas bestaan als deze
-- tabel gevuld is. Vullen is schrijfwerk dat parallel kan lopen aan het bouwen.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- KENNISARTIKEL (KEN-0001)
-- -----------------------------------------------------------------------------

create sequence public.kennisartikel_nummer_seq;

create table public.kennisartikel (
  id                  uuid primary key default gen_random_uuid(),
  nummer              integer not null default nextval('public.kennisartikel_nummer_seq') unique,
  code                text generated always as (public.py_code('KEN', nummer, 4)) stored unique,

  titel               text not null,
  categorie           text not null,

  -- Leeg = algemeen geldend. Gevuld = geldt alleen voor deze locatie en gaat
  -- vóór het algemene artikel in dezelfde categorie.
  locatie_id          uuid references public.locatie(id) on delete cascade,

  vraag               text,
  antwoord            text not null,

  -- De velden die dit artikel machine-uitvoerbaar maken (Data Framework §5)
  triggerwoorden      text[],
  stappen             text[],
  vereist_goedkeuring boolean not null default false,
  goedkeuring_door    text,
  systeem_actie       text,

  kennisartikel_status public.kennisartikel_status not null default 'concept',

  eigenaar_id         uuid references public.medewerker(id) on delete set null,
  laatst_herzien_op   date,
  herzien_voor        date,

  -- Voor de zoekfunctie en straks voor de bot
  -- Twee dingen die hier misgaan als je ze niet weet:
  --   'dutch' moet expliciet naar regconfig gecast worden, anders valt Postgres
  --   terug op de sessie-instelling en is de expressie niet immutable.
  --   array_to_string is STABLE en niet IMMUTABLE, en mag dus niet in een
  --   generated column. De triggerwoorden worden daarom apart doorzocht via
  --   hun eigen GIN-index hieronder.
  zoektekst           tsvector generated always as (
                        to_tsvector('dutch'::regconfig,
                          coalesce(titel, '')   || ' ' ||
                          coalesce(vraag, '')   || ' ' ||
                          coalesce(antwoord, '')
                        )
                      ) stored,

  constraint kennisartikel_actueel_is_herzien
    check (kennisartikel_status <> 'actueel' or laatst_herzien_op is not null),
  constraint kennisartikel_goedkeuring_heeft_rol
    check (not vereist_goedkeuring or goedkeuring_door is not null)
);

select public.voeg_standaardvelden_toe('kennisartikel');
select public.voeg_wijzigingslog_toe('kennisartikel');

create index idx_kennisartikel_zoek     on public.kennisartikel using gin (zoektekst);
create index idx_kennisartikel_trigger  on public.kennisartikel using gin (triggerwoorden);
create index idx_kennisartikel_categorie on public.kennisartikel (categorie);
create index idx_kennisartikel_locatie  on public.kennisartikel (locatie_id);
create index idx_kennisartikel_herzien  on public.kennisartikel (herzien_voor)
  where kennisartikel_status = 'actueel';

comment on constraint kennisartikel_actueel_is_herzien on public.kennisartikel is
  'Een artikel mag niet op ''actueel'' staan zonder herzieningsdatum. Dit is de
   regel die voorkomt dat de bot ooit uit ongecontroleerde kennis put.';
comment on column public.kennisartikel.triggerwoorden is
  'Woorden waarop dit artikel gevonden moet worden, bijv.
   {kenteken, nummerplaat, andere auto, nieuwe auto}.';
comment on column public.kennisartikel.systeem_actie is
  'Wat moet er in de systemen gebeuren, bijv. "werk abonnement.kenteken_huidig bij
   en zet door naar de systeempartner". Dit is wat de bot in fase 5 uitvoert.';
comment on column public.kennisartikel.locatie_id is
  'Locatiespecifieke artikelen gaan vóór algemene artikelen in dezelfde categorie.';


-- -----------------------------------------------------------------------------
-- De koppeling die in 0006 was voorbereid
-- -----------------------------------------------------------------------------
-- klantvraag.kennisartikel_id kon daar nog geen foreign key krijgen omdat
-- kennisartikel toen nog niet bestond. Hier wordt hij alsnog gelegd.

alter table public.klantvraag
  add constraint klantvraag_kennisartikel_fk
  foreign key (kennisartikel_id) references public.kennisartikel(id) on delete set null;

create index idx_klantvraag_kennisartikel on public.klantvraag (kennisartikel_id);

comment on column public.klantvraag.kennisartikel_id is
  'Welk artikel is gebruikt om deze vraag te beantwoorden? Levert twee dingen op:
   welke artikelen het meest renderen, en welke categorieën vragen krijgen
   waarvoor nog geen artikel bestaat.';


-- -----------------------------------------------------------------------------
-- Weergaven voor de bot en voor het onderhoud van de kennisbank
-- -----------------------------------------------------------------------------

create view public.v_kennisbank_bruikbaar as
select
  k.id,
  k.code,
  k.titel,
  k.categorie,
  k.vraag,
  k.antwoord,
  k.triggerwoorden,
  k.stappen,
  k.vereist_goedkeuring,
  k.systeem_actie,
  k.locatie_id,
  l.code as locatie_code,
  k.laatst_herzien_op,
  k.herzien_voor
from public.kennisartikel k
left join public.locatie l on l.id = k.locatie_id
where k.kennisartikel_status = 'actueel'
  and k.status = 'actief'
  and (k.herzien_voor is null or k.herzien_voor >= current_date);

comment on view public.v_kennisbank_bruikbaar is
  'De enige weergave waar de klantenservicebot uit mag putten. Artikelen die
   over hun herzieningsdatum heen zijn, vallen er automatisch uit — liever geen
   antwoord dan een verouderd antwoord.';


create view public.v_kennisbank_onderhoud as
select
  k.code,
  k.titel,
  k.categorie,
  k.kennisartikel_status,
  k.laatst_herzien_op,
  k.herzien_voor,
  m.volledige_naam as eigenaar,
  case
    when k.kennisartikel_status = 'concept' then 'nog niet gepubliceerd'
    when k.kennisartikel_status = 'verouderd' then 'gemarkeerd als verouderd'
    when k.herzien_voor is not null and k.herzien_voor < current_date then 'herziening verlopen'
    when k.herzien_voor is not null and k.herzien_voor < current_date + 30 then 'herziening binnen 30 dagen'
    else 'in orde'
  end as aandachtspunt
from public.kennisartikel k
left join public.medewerker m on m.id = k.eigenaar_id
where k.status = 'actief';

comment on view public.v_kennisbank_onderhoud is
  'De werklijst van de kennisbankeigenaar. Filter op aandachtspunt <> ''in orde''
   en je hebt precies het werk dat openstaat.';
