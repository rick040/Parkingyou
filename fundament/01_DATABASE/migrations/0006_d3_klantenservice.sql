-- =============================================================================
-- ParkingYou datalaag — 0006 DOMEIN D3: KLANTENSERVICE
-- =============================================================================
-- Eigenaar: Klantenservice. Abonnementen, kentekenmutaties en klantvragen.
-- Dit is het domein met de grootste automatiseringskans van het bedrijf:
-- ~250 klantvragen per maand, waarvan het overgrote deel repetitief.
--
-- Bevestigd model (Datamodel v2.0 §2): één abonnement = één locatie = één
-- kenteken. Een klant met drie plekken heeft drie abonnementen. Dat is een
-- schoon model — het blijft zo.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- ABONNEMENT (ABO-00001)
-- -----------------------------------------------------------------------------

create sequence public.abonnement_nummer_seq;

create table public.abonnement (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.abonnement_nummer_seq') unique,
  code              text generated always as (public.py_code('ABO', nummer, 5)) stored unique,

  relatie_id        uuid not null references public.relatie(id) on delete restrict,
  locatie_id        uuid not null references public.locatie(id) on delete restrict,

  -- Het actieve kenteken. Elke wijziging hiervan wordt automatisch vastgelegd in
  -- kenteken_mutatie door de trigger onderaan dit bestand.
  kenteken_huidig   text,
  kenteken_genormaliseerd text generated always as (
                      upper(replace(replace(coalesce(kenteken_huidig, ''), '-', ''), ' ', ''))
                    ) stored,

  product           text,
  startdatum        date,
  einddatum         date,
  prijs_per_maand   numeric(10,2),

  abonnement_status public.abonnement_status not null default 'aangevraagd',
  sepa_status       public.sepa_status not null default 'nog_niet_verzonden',
  machtigingskenmerk text,

  -- Toegangsmiddel
  pasnummer         text,
  pas_uitgegeven_op date,

  opzegreden        text,
  opgezegd_op       date,

  constraint abonnement_looptijd_logisch
    check (einddatum is null or startdatum is null or einddatum >= startdatum),
  constraint abonnement_opgezegd_heeft_datum
    check (abonnement_status <> 'opgezegd' or opgezegd_op is not null),
  constraint abonnement_actief_heeft_kenteken
    check (abonnement_status <> 'actief' or kenteken_huidig is not null)
);

select public.voeg_standaardvelden_toe('abonnement');
select public.voeg_wijzigingslog_toe('abonnement');

create index idx_abonnement_relatie on public.abonnement (relatie_id);
create index idx_abonnement_locatie on public.abonnement (locatie_id);
create index idx_abonnement_actief  on public.abonnement (locatie_id)
  where abonnement_status = 'actief';
create index idx_abonnement_kenteken on public.abonnement (kenteken_genormaliseerd);

-- Twee actieve abonnementen voor hetzelfde kenteken op dezelfde locatie is
-- altijd een fout — meestal een dubbele import.
create unique index idx_abonnement_uniek_actief
  on public.abonnement (locatie_id, kenteken_genormaliseerd)
  where abonnement_status = 'actief';

comment on column public.abonnement.kenteken_genormaliseerd is
  'Kenteken zonder streepjes en spaties, in hoofdletters. Nodig omdat klanten
   "XX-123-Y", "xx123y" en "XX 123 Y" door elkaar gebruiken en de koppeling met
   het parkeersysteem op één vorm moet matchen.';
comment on column public.abonnement.kenteken_huidig is
  'Persoonsgegeven. Mutatiehistorie staat in kenteken_mutatie; zie het
   bewaartermijnenbeleid voor de termijn na opzegging.';


-- -----------------------------------------------------------------------------
-- KENTEKEN_MUTATIE — de belangrijkste tabel voor het automatiseringsdoel
-- -----------------------------------------------------------------------------
-- Datamodel v2.0, correctie 3. Kentekenwijziging is dé standaardvraag die
-- geautomatiseerd moet worden. Je moet kunnen aantonen dát en wannéér de
-- wijziging is doorgezet naar SKIDATA / IP Parking / S&B. Als die doorzetting
-- faalt, staat er iemand voor een dichte slagboom — en dan wil je binnen
-- seconden zien waar het misging.
--
-- Bijkomend voordeel: dit is meteen de AVG-verantwoording op kentekens.

create table public.kenteken_mutatie (
  id                       uuid primary key default gen_random_uuid(),

  abonnement_id            uuid not null references public.abonnement(id) on delete cascade,

  kenteken_oud             text,
  kenteken_nieuw           text not null,

  gewijzigd_op             timestamptz not null default now(),
  gewijzigd_door           public.mutatiebron not null default 'medewerker',
  gewijzigd_door_id        uuid references public.medewerker(id) on delete set null,

  -- De kern van deze tabel: is de wijziging ook echt in het parkeersysteem
  -- terechtgekomen? Zolang dit onwaar is, staat er een openstaande actie.
  verwerkt_in_parkeersysteem boolean not null default false,
  verwerkt_op              timestamptz,
  verwerkt_in              public.systeempartner,
  verwerkingsfout          text,

  constraint kenteken_mutatie_verwerkt_heeft_tijdstip
    check (not verwerkt_in_parkeersysteem or verwerkt_op is not null)
);

select public.voeg_standaardvelden_toe('kenteken_mutatie');

create index idx_kenteken_mutatie_abo on public.kenteken_mutatie (abonnement_id, gewijzigd_op desc);

-- Dit is de werklijst van de klantenservice: wijzigingen die nog niet in het
-- parkeersysteem staan. Deze index maakt dat een instant query.
create index idx_kenteken_mutatie_openstaand on public.kenteken_mutatie (gewijzigd_op)
  where not verwerkt_in_parkeersysteem;

comment on table public.kenteken_mutatie is
  'Mutatiehistorie van kentekens (Datamodel v2.0, correctie 3). Wordt automatisch
   gevuld door een trigger op abonnement — een wijziging kan dus niet buiten de
   historie om.';


-- Automatische vastlegging. Zonder deze trigger zou de historie afhangen van of
-- iemand eraan denkt, en dan is hij precies op het moment dat het ertoe doet
-- onvolledig.
create or replace function public.log_kentekenwijziging()
returns trigger
language plpgsql
as $$
begin
  if new.kenteken_huidig is distinct from old.kenteken_huidig
     and new.kenteken_huidig is not null then

    insert into public.kenteken_mutatie (
      abonnement_id, kenteken_oud, kenteken_nieuw, gewijzigd_door
    )
    values (
      new.id,
      old.kenteken_huidig,
      new.kenteken_huidig,
      -- De formulierlaag mag deze bron overschrijven; 'medewerker' is de
      -- veilige aanname als niemand iets meegeeft.
      coalesce(
        nullif(current_setting('parkingyou.mutatiebron', true), '')::public.mutatiebron,
        'medewerker'
      )
    );
  end if;
  return new;
end;
$$;

create trigger trg_abonnement_kentekenwijziging
  after update of kenteken_huidig on public.abonnement
  for each row execute function public.log_kentekenwijziging();

comment on function public.log_kentekenwijziging is
  'Schrijft elke kentekenwijziging weg naar kenteken_mutatie met
   verwerkt_in_parkeersysteem = false. De koppeling in fase 2/3 pikt die regels
   op, zet ze door naar de systeempartner en vinkt ze af.';


-- -----------------------------------------------------------------------------
-- KLANTVRAAG (KLV-00001)
-- -----------------------------------------------------------------------------

create sequence public.klantvraag_nummer_seq;

create table public.klantvraag (
  id                uuid primary key default gen_random_uuid(),
  nummer            integer not null default nextval('public.klantvraag_nummer_seq') unique,
  code              text generated always as (public.py_code('KLV', nummer, 5)) stored unique,

  relatie_id        uuid references public.relatie(id) on delete set null,
  locatie_id        uuid references public.locatie(id) on delete set null,
  abonnement_id     uuid references public.abonnement(id) on delete set null,

  kanaal            public.kanaal not null,
  categorie         text,
  onderwerp         text,
  samenvatting      text,

  klantvraag_status public.klantvraag_status not null default 'nieuw',
  afhandelwijze     public.afhandelwijze,

  -- Gevuld in 0008: welk kennisartikel is gebruikt om deze vraag te beantwoorden?
  -- De kolom staat hier, de foreign key wordt daar toegevoegd omdat kennisartikel
  -- pas in dat bestand bestaat.
  kennisartikel_id  uuid,

  ontvangen_op      timestamptz not null default now(),
  eerste_reactie_op timestamptz,
  afgehandeld_op    timestamptz,
  behandeld_door_id uuid references public.medewerker(id) on delete set null,

  -- Een intercommelding bij een dichte slagboom is tegelijk klantvraag en
  -- storingssignaal. Deze koppeling is wat die twee werelden verbindt.
  storing_id        uuid references public.storing(id) on delete set null,

  bron              public.databron not null default 'handmatig',
  externe_referentie text,

  constraint klantvraag_afgehandeld_heeft_tijdstip
    check (klantvraag_status <> 'afgehandeld' or afgehandeld_op is not null)
);

select public.voeg_standaardvelden_toe('klantvraag');

create index idx_klantvraag_relatie  on public.klantvraag (relatie_id);
create index idx_klantvraag_locatie  on public.klantvraag (locatie_id, ontvangen_op desc);
create index idx_klantvraag_open     on public.klantvraag (ontvangen_op)
  where klantvraag_status <> 'afgehandeld';
create index idx_klantvraag_categorie on public.klantvraag (categorie, ontvangen_op desc);
create unique index idx_klantvraag_extern
  on public.klantvraag (bron, externe_referentie)
  where externe_referentie is not null;

comment on column public.klantvraag.afhandelwijze is
  'automatisch / mens / escalatie. Dit veld is de teller waarmee mijlpaal M10
   gemeten wordt: welk aandeel van de vragen ging zonder mens goed?';
comment on column public.klantvraag.storing_id is
  'Verbindt D3 met D2. Zonder dit veld blijft de intercomstroom onzichtbaar —
   volgens Datamodel v2.0 §3.3 de meest verborgen datastroom van het bedrijf.';


-- -----------------------------------------------------------------------------
-- Hulpweergave — is er nog plek op deze locatie?
-- -----------------------------------------------------------------------------
-- Nodig bij de beoordeling van een abonnementsaanvraag (Blauwdruk §9.2, stap 2).

create view public.v_locatie_abonnement_ruimte as
select
  l.id                       as locatie_id,
  l.code                     as locatie_code,
  l.naam                     as locatie_naam,
  l.capaciteit,
  l.capaciteit_abonnement,
  count(a.id) filter (where a.abonnement_status = 'actief')      as actieve_abonnementen,
  count(a.id) filter (where a.abonnement_status = 'aangevraagd') as openstaande_aanvragen,
  case
    when l.capaciteit_abonnement is null then null
    else l.capaciteit_abonnement - count(a.id) filter (where a.abonnement_status = 'actief')
  end                        as vrije_abonnementsplekken
from public.locatie l
left join public.abonnement a on a.locatie_id = l.id
group by l.id, l.code, l.naam, l.capaciteit, l.capaciteit_abonnement;

comment on view public.v_locatie_abonnement_ruimte is
  'Vrije abonnementsplekken per locatie. NULL bij vrije_abonnementsplekken
   betekent: capaciteit_abonnement is nog niet ingevuld in het locatieregister.';
