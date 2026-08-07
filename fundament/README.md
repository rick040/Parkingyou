# ParkingYou Fundament

*Het uitvoeringsplan en het databaseschema voor de overgang van losse Excel-sheets naar één verbonden systeem.*

Deze map staat los van het website-prototype in de hoofdmap van deze repository. Die twee raken elkaar niet.

---

## Begin hier

| Als je... | Lees dan |
|---|---|
| wilt weten wat het plan is | [`00_PLAN/Projectplan_v1.0.md`](00_PLAN/Projectplan_v1.0.md) |
| een besluit moet nemen | [`00_PLAN/Besluitenlogboek.md`](00_PLAN/Besluitenlogboek.md) |
| aan de slag gaat met taken | [`00_PLAN/Takenlijst_en_Mijlpalen.xlsx`](00_PLAN/Takenlijst_en_Mijlpalen.xlsx) |
| wilt toetsen of iets werkt | [`02_WERKMATERIAAL/Mijlpaal_Testrapporten.md`](02_WERKMATERIAAL/Mijlpaal_Testrapporten.md) |
| het datamodel wilt begrijpen | [`01_DATABASE/DATAMODEL.md`](01_DATABASE/DATAMODEL.md) |
| domeineigenaar bent | [`02_WERKMATERIAAL/Domeineigenaar_Rolbeschrijving.md`](02_WERKMATERIAAL/Domeineigenaar_Rolbeschrijving.md) |
| dit aan het team uitlegt | [`00_PLAN/Beslisdocument_Team.docx`](00_PLAN/Beslisdocument_Team.docx) |

---

## Wat hier staat

```
fundament/
├── 00_PLAN/
│   ├── Projectplan_v1.0.md            het hoofddocument — 175 taken, 11 mijlpalen
│   ├── Takenlijst_en_Mijlpalen.xlsx   dezelfde taken, om mee te werken
│   ├── Besluitenlogboek.md            zeven besluiten, met onderbouwing
│   ├── Beslisdocument_Team.docx       niet-technische versie voor directie en team
│   ├── bouw_takenlijst.py             genereert de xlsx uit het projectplan
│   └── bouw_beslisdocument.js         genereert de docx
│
├── 01_DATABASE/
│   ├── DATAMODEL.md                   veldenreferentie per tabel
│   ├── migrations/                    0001 t/m 0011, in volgorde uitvoeren
│   ├── seed/
│   │   ├── seed_referentiedata.sql    Connector Registry — hoort ook in productie
│   │   └── seed_testdata.sql          fictieve data om mijlpalen op te oefenen
│   └── import/                        CSV-sjablonen voor de 37 locaties en de abonnees
│
└── 02_WERKMATERIAAL/
    ├── Mijlpaal_Testrapporten.md      per mijlpaal een testscript met aftekenveld
    ├── Leverancier_API_Aanvraag_TEMPLATE.md
    ├── Domeineigenaar_Rolbeschrijving.md
    └── Spelregels_A4.md               het A4 voor aan de muur
```

---

## De database opzetten

```bash
export DATABASE_URL="postgresql://..."     # de connectiestring van het Supabase-project

# Migraties, in volgorde. ON_ERROR_STOP is essentieel: zonder die vlag
# loopt psql door na een fout en krijg je een half schema.
for f in 01_DATABASE/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" || break
done

# Referentiedata (hoort ook in productie)
psql "$DATABASE_URL" -f 01_DATABASE/seed/seed_referentiedata.sql
```

**Controle achteraf** — dit hoort eruit te komen:

```sql
select count(*) from information_schema.tables
 where table_schema = 'public' and table_type = 'BASE TABLE';   -- 29

select count(*) from information_schema.views
 where table_schema = 'public';                                  -- 11
```

### Oefenen met testdata

Op een aparte Supabase-branch of lokale database, **nooit op productie**:

```bash
psql "$DATABASE_URL" -f 01_DATABASE/seed/seed_testdata.sql
```

Dat levert drie fictieve locaties op, bewust zo gekozen dat je M1, M4 en M6 er direct op kunt oefenen: één exploitatielocatie met twee contractpartijen, één advieslocatie, en één locatie die in het verleden van systeempartner wisselde.

Alle namen en gegevens zijn verzonnen; e-mailadressen eindigen op `.invalid` zodat er nooit per ongeluk iets naar een echt adres gaat.

---

## De documenten opnieuw genereren

Het projectplan is de enige bron van waarheid voor de taken. De spreadsheet wordt eruit gegenereerd, zodat de twee niet uit elkaar kunnen lopen:

```bash
pip install openpyxl && python3 00_PLAN/bouw_takenlijst.py       # na elke wijziging in het projectplan
npm install docx     && node    00_PLAN/bouw_beslisdocument.js
```

Pas dus de taken aan in `Projectplan_v1.0.md`, niet in de xlsx — die wordt overschreven.

---

## Status

Het schema is getest op PostgreSQL 16: alle elf migraties plus beide seeds draaien schoon op een lege database, en de dashboardweergaven leveren de verwachte uitkomsten. Supabase draait 17; er zit niets in dit schema dat tussen die versies verschilt.

Wat er nog **niet** is gebeurd: er is geen Supabase-project aangemaakt en er zijn geen migraties op een echte omgeving toegepast. Dat is taak 0.19 en 0.20, de eerste stap van fase 0.

---

## De drie dingen die het snelst misgaan

1. **De leveranciersaanvragen te laat versturen.** Die bepalen de doorlooptijd van het hele project, niet het bouwen. Ze horen in week 1 de deur uit — taken 0.3 t/m 0.6.
2. **De oude drive "geleidelijk" uitfaseren.** Dat wordt nooit iets. Er hoort een datum op, en die datum moet gehaald worden — taken 0.17 en 0.50.
3. **Een formulier bouwen dat past bij de tabel in plaats van bij het werk.** Als een domeineigenaar een truc nodig heeft, is het ontwerp fout. Dan het formulier aanpassen, niet de gebruiker.
