-- =============================================================================
-- ParkingYou datalaag — 0001 FUNDAMENT
-- =============================================================================
-- Wat dit bestand doet: de bouwstenen die élke tabel in dit systeem gebruikt.
--   1. Extensies
--   2. ID-generatie   -> de codes uit de blauwdruk (LOC-014, ABO-00001) afdwingen
--   3. Enums          -> vaste keuzelijsten i.p.v. vrije tekst
--   4. Standaardvelden -> levenscyclus (Hub v0.2 §5) + tijdstempels
--   5. Wijzigingslog  -> de historie die Excel niet kan bijhouden
--
-- Volgorde: dit bestand MOET als eerste draaien. Alle volgende migraties
-- roepen de functies hieruit aan.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extensies
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- hoofdletterongevoelige tekst (e-mail, kenteken)


-- -----------------------------------------------------------------------------
-- 2. ID-generatie
-- -----------------------------------------------------------------------------
-- De blauwdruk schrijft codes voor in de vorm LOC-001, REL-0001, ABO-00001.
-- Die worden hier automatisch gegenereerd, zodat niemand ze handmatig hoeft
-- bij te houden en er nooit twee records dezelfde code krijgen.
--
-- Elke tabel heeft:
--   id      uuid  -> technische sleutel, voor koppelingen tussen tabellen
--   nummer  int   -> volgnummer uit een sequence
--   code    text  -> afgeleid van nummer, dit is wat mensen zien en noemen
--
-- Waarom niet de code als primaire sleutel: codes zijn voor mensen, uuid's voor
-- machines. Als er ooit een code moet wijzigen, breekt er dan niets.

create or replace function public.py_code(prefix text, nummer integer, breedte integer)
returns text
language sql
immutable
strict
as $$
  select prefix || '-' || lpad(nummer::text, breedte, '0')
$$;

comment on function public.py_code is
  'Bouwt een leesbare recordcode, bijv. py_code(''LOC'', 14, 3) => ''LOC-014''.
   Moet IMMUTABLE zijn omdat generated columns dat vereisen.';


-- -----------------------------------------------------------------------------
-- 3. Enums — de vaste keuzelijsten
-- -----------------------------------------------------------------------------
-- Regel: alles wat een beperkte set waarden heeft, wordt een enum. Zo kan er
-- geen "Actief", "actief " en "ACTIEF" naast elkaar ontstaan — precies het
-- probleem dat de huidige Excel-sheets hebben.

-- Levenscyclus (Hub Architecture v0.2 §5) — geldt voor élk record
create type public.levenscyclus_status as enum (
  'actief',
  'te_beoordelen',
  'verouderd',
  'archief'
);

-- Locatieregister
create type public.locatie_type as enum ('garage', 'terrein', 'straatparkeren', 'overig');

-- Datamodel v2.0 correctie 4: niet alle locaties zijn exploitatie.
-- Alleen 'exploitatie' telt mee in omzetrapportages, prognoses en de signaallus.
create type public.dienstverleningstype as enum (
  'exploitatie',
  'advies',
  'onderhoud',
  'beheer_op_afstand'
);

create type public.systeempartner as enum (
  'skidata',
  'ip_parking',
  'scheidt_bachmann',
  'aeroparker',
  'geen',
  'overig'
);

-- Hoe komt data van dit systeem binnen? Hub v0.2 §3 eis 3.
create type public.koppeling_status as enum ('api', 'export', 'handmatig', 'geen');

-- Waar komt een record vandaan? Elk geïmporteerd record legt dit vast, zodat bij
-- een afwijking altijd te herleiden is welke koppeling hem heeft aangeleverd.
create type public.databron as enum (
  'skidata',
  'ip_parking',
  'scheidt_bachmann',
  'aeroparker',
  'afas',
  'bank',
  'zendesk',
  'google_analytics',
  'google_ads',
  'website',
  'handmatig',
  'import',
  'overig'
);

-- Relatieregister — één partij kan meerdere rollen hebben, vandaar een aparte
-- tabel relatie_rol (zie 0002) in plaats van één veld op relatie.
-- De enum heet bewust anders dan die tabel: een type en een tabel kunnen in
-- Postgres niet dezelfde naam dragen.
create type public.relatie_roltype as enum (
  'eigenaar',
  'abonnee',
  'leverancier',
  'partner',
  'systeempartner',
  'overheid'
);

-- Datamodel v2.0 correctie 1b: een locatie kan meerdere contractpartijen hebben.
create type public.partij_rol as enum (
  'eigenaar',
  'vve',
  'gemeente',
  'beheerder',
  'medeondertekenaar'
);

create type public.contract_type as enum (
  'exploitatie',
  'abonnement',
  'leverancier',
  'onderhoud',
  'verwerkersovereenkomst',
  'overig'
);

-- D1 Financiën
create type public.omzetsoort as enum ('kort_parkeren', 'abonnement', 'reservering', 'overig');
create type public.factuur_status as enum ('concept', 'verzonden', 'betaald', 'gestorneerd', 'oninbaar');
create type public.rapportage_type as enum ('eigenaarsrapport', 'intern');

-- D2 Operatie
create type public.prioriteit as enum ('laag', 'normaal', 'hoog', 'kritiek');
create type public.storing_status as enum (
  'gemeld',
  'in_behandeling',
  'wacht_op_leverancier',
  'opgelost',
  'afgesloten'
);
create type public.werkorder_status as enum ('open', 'ingepland', 'uitgevoerd', 'geannuleerd');
create type public.apparaat_type as enum (
  'slagboom',
  'betaalautomaat',
  'intercom',
  'camera',
  'kentekenherkenning',
  'toegangszuil',
  'overig'
);

-- D3 Klantenservice
create type public.abonnement_status as enum ('aangevraagd', 'actief', 'opgezegd', 'geblokkeerd');
create type public.sepa_status as enum ('nog_niet_verzonden', 'verzonden', 'akkoord', 'mislukt');
create type public.kanaal as enum ('mail', 'telefoon', 'intercom', 'web', 'social', 'meldkamer');
create type public.klantvraag_status as enum ('nieuw', 'in_behandeling', 'wacht_op_klant', 'afgehandeld');
create type public.afhandelwijze as enum ('automatisch', 'mens', 'escalatie');

-- Wie voerde een kentekenwijziging door? Datamodel v2.0 §2, KENTEKEN_MUTATIE.
create type public.mutatiebron as enum ('klant_self_service', 'bot', 'medewerker', 'import');

-- D4 Marketing
create type public.campagne_status as enum ('concept', 'gepland', 'actief', 'afgerond', 'geannuleerd');
create type public.contenttype as enum ('social', 'print', 'signing', 'advertentie', 'video', 'overig');

-- D5 Kennisbank
create type public.kennisartikel_status as enum ('concept', 'actueel', 'verouderd');

-- Connector Registry (Hub v0.2 §4)
create type public.connector_status as enum (
  'voorgesteld',
  'te_onderzoeken',
  'te_koppelen',
  'actief',
  'uitfaseren',
  'vervallen'
);


-- -----------------------------------------------------------------------------
-- 4. Standaardvelden — levenscyclus en tijdstempels
-- -----------------------------------------------------------------------------
-- Hub v0.2 §5 eist dat élk record een status, een verificatiedatum en een
-- verwijzing naar zijn opvolger heeft. In plaats van dat bij elke tabel over te
-- typen (en het bij tabel nummer 14 te vergeten) doet deze functie het.
--
-- Gebruik onderaan elke tabeldefinitie:  select public.voeg_standaardvelden_toe('locatie');

create or replace function public.zet_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.voeg_standaardvelden_toe(p_tabel text)
returns void
language plpgsql
as $$
begin
  execute format($f$
    alter table public.%1$I
      add column if not exists status                 public.levenscyclus_status not null default 'actief',
      add column if not exists laatst_geverifieerd_op date,
      add column if not exists vervangen_door         uuid references public.%1$I(id),
      add column if not exists opmerking              text,
      add column if not exists created_at             timestamptz not null default now(),
      add column if not exists updated_at             timestamptz not null default now();
  $f$, p_tabel);

  -- Index op status: vrijwel elke weergave filtert op "alleen wat actueel is".
  execute format(
    'create index if not exists %1$I on public.%2$I (status)',
    'idx_' || p_tabel || '_status', p_tabel
  );

  execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$I', p_tabel);
  execute format($f$
    create trigger trg_%1$s_updated_at
      before update on public.%1$I
      for each row execute function public.zet_updated_at();
  $f$, p_tabel);
end;
$$;

comment on function public.voeg_standaardvelden_toe is
  'Geeft een tabel de systeembrede levenscyclusvelden uit Hub Architecture v0.2 §5
   plus created_at/updated_at. Aanroepen na elke create table.';


-- -----------------------------------------------------------------------------
-- 5. Wijzigingslog
-- -----------------------------------------------------------------------------
-- Waarom dit bestaat: de blauwdruk (§4.2) noemt "een geschiedenis van
-- wijzigingen" als een van de dingen die Excel niet kan. Concreet nut:
--   - AVG-verantwoording op kentekens (persoonsgegeven)
--   - kunnen aantonen wie een abonnement heeft opgezegd, en wanneer
--   - fouten in een import kunnen terugdraaien
--
-- Let op: de trigger logt PER GEWIJZIGD VELD, niet per record. Dat is precies
-- wat je wilt bij "wie wijzigde dit kenteken", maar het zou ontploffen op
-- transactietabellen met miljoenen import-regels. Daarom hangen we de trigger
-- bewust alleen aan de tabellen waar herleidbaarheid telt (registers,
-- abonnementen, contracten) en NIET aan transactie/omzet-tabellen.

create table public.wijzigingslog (
  id            bigint generated always as identity primary key,
  tabel         text        not null,
  record_id     uuid        not null,
  record_code   text,
  actie         text        not null check (actie in ('insert', 'update', 'delete')),
  veld          text,
  oude_waarde   text,
  nieuwe_waarde text,
  gewijzigd_door text       not null default current_user,
  gewijzigd_op  timestamptz not null default now()
);

create index idx_wijzigingslog_record on public.wijzigingslog (tabel, record_id, gewijzigd_op desc);
create index idx_wijzigingslog_datum  on public.wijzigingslog (gewijzigd_op desc);

comment on table public.wijzigingslog is
  'Veldniveau-historie van de kerntabellen. Wordt nooit geschoond: dit is de
   audittrail. Alleen gekoppeld aan tabellen waar herleidbaarheid telt.';

create or replace function public.log_wijziging()
returns trigger
language plpgsql
as $$
declare
  v_oud   jsonb;
  v_nieuw jsonb;
  v_veld  text;
  v_code  text;
  -- Velden die bij elke update meebewegen en geen informatie toevoegen:
  v_negeer text[] := array['updated_at', 'created_at'];
begin
  if tg_op = 'INSERT' then
    v_nieuw := to_jsonb(new);
    insert into public.wijzigingslog (tabel, record_id, record_code, actie)
    values (tg_table_name, new.id, v_nieuw->>'code', 'insert');
    return new;

  elsif tg_op = 'DELETE' then
    v_oud := to_jsonb(old);
    insert into public.wijzigingslog (tabel, record_id, record_code, actie)
    values (tg_table_name, old.id, v_oud->>'code', 'delete');
    return old;
  end if;

  -- UPDATE: één regel per daadwerkelijk gewijzigd veld
  v_oud   := to_jsonb(old);
  v_nieuw := to_jsonb(new);
  v_code  := v_nieuw->>'code';

  for v_veld in select jsonb_object_keys(v_nieuw) loop
    if v_veld = any(v_negeer) then
      continue;
    end if;
    if (v_oud->>v_veld) is distinct from (v_nieuw->>v_veld) then
      insert into public.wijzigingslog (
        tabel, record_id, record_code, actie, veld, oude_waarde, nieuwe_waarde
      )
      values (
        tg_table_name, new.id, v_code, 'update', v_veld, v_oud->>v_veld, v_nieuw->>v_veld
      );
    end if;
  end loop;

  return new;
end;
$$;

create or replace function public.voeg_wijzigingslog_toe(p_tabel text)
returns void
language plpgsql
as $$
begin
  execute format('drop trigger if exists trg_%1$s_log on public.%1$I', p_tabel);
  execute format($f$
    create trigger trg_%1$s_log
      after insert or update or delete on public.%1$I
      for each row execute function public.log_wijziging();
  $f$, p_tabel);
end;
$$;

comment on function public.voeg_wijzigingslog_toe is
  'Hangt de veldniveau-audittrail aan een tabel. Bewust NIET gebruiken op
   transactie- en omzettabellen: die krijgen bulk-imports en zouden het log
   vullen zonder dat iemand er ooit naar kijkt.';
