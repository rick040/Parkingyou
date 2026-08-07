# ParkingYou — Datamodel (referentie)

*Hoort bij de migraties in `migrations/`. 29 tabellen, 11 weergaven.*

---

## Hoe dit model in elkaar zit

Drie lagen, van binnen naar buiten:

1. **Kernregisters** — de gedeelde taal van het bedrijf. Locaties, relaties, contracten, medewerkers, apparatuur. Klein, strak beheerd, nergens gekopieerd.
2. **Domeintabellen** — D1 t/m D5. Elke tabel verwijst naar een locatie, een relatie, of allebei.
3. **Weergaven** — de dwarsdoorsnedes en werklijsten. Geen opgeslagen data, dus ze kunnen niet verouderen.

Alles wat de blauwdruk aan tabellen noemt zit erin, met de vier correcties uit Datamodel v2.0 ingebouwd in plaats van eromheen gebouwd.

---

## Drie afspraken die overal gelden

### 1. Elk record heeft een uuid én een leesbare code

```
id       uuid    technische sleutel, gebruikt voor koppelingen
nummer   integer volgnummer uit een sequence
code     text    afgeleid, dit is wat mensen noemen: LOC-014, ABO-00001
```

De code wordt door de database gegenereerd (`GENERATED ALWAYS AS`) en kan dus niet handmatig fout gaan of dubbel voorkomen. De uuid is de sleutel voor koppelingen, zodat een code in theorie zou kunnen wijzigen zonder dat er iets breekt.

| Prefix | Tabel | Breedte | Voorbeeld |
|---|---|---|---|
| `LOC` | locatie | 3 | LOC-014 |
| `REL` | relatie | 4 | REL-0033 |
| `CON` | contract | 4 | CON-0001 |
| `MDW` | medewerker | 2 | MDW-04 |
| `APP` | apparaat | 4 | APP-0012 |
| `ABO` | abonnement | 5 | ABO-00001 |
| `FAC` | factuur | 5 | FAC-00001 |
| `TCK` | storing | 5 | TCK-00001 |
| `WRK` | werkorder | 5 | WRK-00001 |
| `KLV` | klantvraag | 5 | KLV-00001 |
| `CAM` | campagne | 4 | CAM-0012 |
| `CNT` | contentitem | 5 | CNT-00001 |
| `KEN` | kennisartikel | 4 | KEN-0001 |

### 2. Elk record heeft een levenscyclus

Uit Hub Architecture v0.2 §5. Toegevoegd door `voeg_standaardvelden_toe()`, zodat het bij tabel 29 niet vergeten wordt:

| Veld | Betekenis |
|---|---|
| `status` | `actief` / `te_beoordelen` / `verouderd` / `archief` |
| `laatst_geverifieerd_op` | wanneer heeft een mens dit voor het laatst nagekeken |
| `vervangen_door` | verwijzing naar de opvolger, indien van toepassing |
| `opmerking` | vrije toelichting |
| `created_at` / `updated_at` | automatisch |

Niets wordt ooit verwijderd; alles wordt gestatust. Dat is governance-regel 5.

### 3. Wijzigingen worden bijgehouden — maar niet overal

`wijzigingslog` legt **per gewijzigd veld** vast wie wat wanneer veranderde. Aangehangen aan de registers, abonnementen, contracten, storingen en kennisartikelen.

Bewust **niet** aan `omzet_periode`, `bezetting_periode` en `koppeling_run`: dat is bulk-importdata waar de herkomst al in `bron` + `geimporteerd_op` staat. Een audittrail die volloopt met miljoenen importregels is geen audittrail meer.

---

## De kernregisters

### `locatie` — de spil

Elk record in elk domein verwijst hiernaar. Dit is de tabel die als eerste gevuld wordt (37 locaties) en waar alles op hangt.

| Veld | Type | Toelichting |
|---|---|---|
| `code` | text | LOC-001 t/m LOC-037 |
| `naam`, `type` | text, enum | garage / terrein / straatparkeren / overig |
| **`dienstverleningstype`** | enum | **exploitatie / advies / onderhoud / beheer_op_afstand** |
| `plaats`, `straat`, `postcode` | text | |
| `latitude`, `longitude` | numeric | voor kaartweergave en de externe oorzaakcheck |
| `capaciteit` | integer | totaal aantal plekken |
| `capaciteit_abonnement` | integer | hoeveel daarvan voor abonnementen |
| `openingstijden`, `tarieven` | jsonb | vrije structuur |
| `parkeerhost_id` | uuid | → medewerker |

**Twee velden staan hier bewust níét:**

- `systeempartner` → verhuisd naar `systeem_historie`
- `eigenaar` → verhuisd naar `locatie_partij`

`dienstverleningstype` is belangrijker dan het lijkt. Alleen bij `exploitatie` gelden omzetrapportages, prognoses en de signaallus. Zonder dit veld vervuilen advies- en onderhoudslocaties elk dashboard met een omzet van nul.

### `relatie` — alle partijen, één keer

Eigenaren, abonnees, leveranciers en partners staan in dezelfde tabel. Rollen staan apart in `relatie_rol`, zodat een vastgoedeigenaar die óók abonnee is niet twee keer in het register komt.

### `contract`

Heeft bewust **geen** `locatie_id`. De koppeling contract ↔ locatie loopt altijd via `locatie_partij`, omdat één exploitatiecontract meerdere locaties kan dekken. Leverancierscontracten hebben simpelweg geen `locatie_partij`-regels.

### `medewerker`, `apparaat`

Team- en middelenregister. `medewerker` bevat géén personeelsdossiers, verzuim of salaris — dat hoort niet in dit systeem. `apparaat` heeft naast het serienummer een veld `aanduiding` ("inrit noord"), want bij een storingsmelding wil niemand een serienummer opzoeken.

---

## De vier correcties uit Datamodel v2.0

Dit is waar dit model afwijkt van Blauwdruk v1.0, en waarom.

### Correctie 1 — `locatie_partij`

*Een eigenaar kan meerdere locaties hebben, én een locatie kan meerdere contractpartijen hebben.*

| Veld | Toelichting |
|---|---|
| `locatie_id`, `relatie_id` | de koppeling |
| `rol` | eigenaar / vve / gemeente / beheerder / medeondertekenaar |
| `contract_id` | welk contract regelt deze relatie |
| `primaire_contactpartij` | wie krijgt de maandrapportage |
| `actief_van` / `actief_tot` | leeg = nu actief |

Twee regels bewaken dit:

- Een partiële unique index staat **hooguit één primaire contactpartij per locatie tegelijk** toe. Daarom komt de eigenaarsrapportage altijd bij precies één adres uit.
- Een exclusion constraint verhindert dat dezelfde partij twee keer tegelijk dezelfde rol heeft op één locatie.

### Correctie 2 — `systeem_historie`

*Locaties wisselen soms van systeempartner.*

Naast partner en periode staat hier `externe_locatie_id`: hoe deze locatie heet in het systeem van de leverancier (SKIDATA noemt LOC-014 bijvoorbeeld "facility 42"). Dat veld is wat de koppeling in fase 2 nodig heeft om binnenkomende transacties aan de juiste LOC-code te hangen.

Een exclusion constraint verhindert twee actieve partners op dezelfde dag.

### Correctie 3 — `kenteken_mutatie`

*Kentekenwijziging is dé standaardvraag die geautomatiseerd moet worden.*

| Veld | Toelichting |
|---|---|
| `kenteken_oud` / `kenteken_nieuw` | |
| `gewijzigd_door` | klant_self_service / bot / medewerker / import |
| **`verwerkt_in_parkeersysteem`** | **de kern: is het écht doorgezet?** |
| `verwerkt_op`, `verwerkt_in`, `verwerkingsfout` | |

**Deze tabel wordt automatisch gevuld door een trigger op `abonnement`.** Een kentekenwijziging kán dus niet buiten de historie om. Zonder die trigger zou de historie afhangen van of iemand eraan denkt — en dan is hij precies op het moment dat het ertoe doet onvolledig.

`v_werklijst_kentekenmutaties` toont de wijzigingen die nog niet zijn doorgezet. Elke regel daar is een klant die morgen voor een dichte slagboom kan staan. Die lijst hoort elke ochtend leeg te zijn.

### Correctie 4 — `dienstverleningstype`

Zie `locatie` hierboven.

---

## De domeintabellen

### D1 — Financiën

| Tabel | Wat erin staat |
|---|---|
| `omzet_periode` | dagomzet per locatie en omzetsoort |
| `bezetting_periode` | bezettingsgraad, in- en uitritten per dag |
| `prognose` | verwachte omzet per locatie per maand |
| `factuur` | met `afas_referentie` als aansluiting op de boekhouding |
| `sepa_batch`, `sepa_incasso` | incasso's en storneringen |
| `rapportage` | welk rapport is wanneer naar wie gestuurd |

**Twee regels die er echt toe doen:**

*Idempotente import.* `omzet_periode` heeft een unique sleutel op (locatie, datum, omzetsoort, bron). Een tweede run van dezelfde dag overschrijft in plaats van te verdubbelen. Zonder dit is dubbele omzet na een herstelde koppeling een kwestie van tijd.

*Periodieke omzet uitsmeren.* Boek abonnementsomzet als dagbedragen, niet als één bedrag op de eerste van de maand. Het dashboard vergelijkt omzet-tot-nu-toe met de prognose náár rato; één maandbedrag op dag 1 laat een locatie de eerste week kunstmatig goed scoren en de rest van de maand kunstmatig slecht.

*Geen losse parkeertransacties.* We slaan dagtotalen op. Voor rapportages, prognosevergelijking en de signaallus is dat precies genoeg, terwijl losse transacties miljoenen regels en een AVG-vraagstuk opleveren. De brondetails blijven in het parkeersysteem.

**AFAS blijft bron van waarheid** voor grootboek, facturen en btw. Deze tabellen houden de operationele administratie bij en leveren aan. Twee systemen die allebei denken dat ze de facturatie beheren is de klassieke fout.

### D2 — Operatie

| Tabel | Wat erin staat |
|---|---|
| `storing` | melding, prioriteit, status, doorlooptijd (automatisch berekend) |
| `werkorder` | wat een parkeerhost concreet moet gaan doen |
| `onderhoud` | preventief en correctief onderhoud per apparaat |

Storingen en werkorders zijn gescheiden omdat één storing meerdere bezoeken kan vergen, en een host ook werkorders krijgt die niets met een storing te maken hebben (pasuitgifte, dagelijkse ronde).

Een constraint verhindert dat een storing op `opgelost` gaat zonder te noteren hóé. Dat is wat de storingshistorie over een jaar bruikbaar maakt in plaats van een lijst afgevinkte regels.

### D3 — Klantenservice

| Tabel | Wat erin staat |
|---|---|
| `abonnement` | één abonnement = één locatie = één kenteken |
| `kenteken_mutatie` | zie correctie 3 |
| `klantvraag` | met `storing_id` als brug naar D2 |

`abonnement.kenteken_genormaliseerd` is een afgeleide kolom zonder streepjes en spaties, in hoofdletters — nodig omdat klanten "XX-123-Y", "xx123y" en "XX 123 Y" door elkaar gebruiken en de koppeling met het parkeersysteem op één vorm moet matchen. Een partiële unique index erop verhindert twee actieve abonnementen voor hetzelfde kenteken op dezelfde locatie (meestal een dubbele import).

`klantvraag.storing_id` verbindt D3 met D2. Een intercommelding bij een dichte slagboom is tegelijk een klantvraag en een storingssignaal — volgens Datamodel v2.0 de meest verborgen datastroom van het bedrijf.

### D4 — Marketing

| Tabel | Wat erin staat |
|---|---|
| `campagne` | met `uit_signaal` om signaalgedreven campagnes te kunnen herkennen |
| `campagne_locatie` | koppeltabel; merkbrede campagnes hebben hier geen regels |
| `contentitem` | met `statistieken` (jsonb) per kanaal |
| `campagne_resultaat` | omzet vóór/tijdens/ná + ROI, per locatie |

`campagne_resultaat` is een eigen tabel omdat het effect **per locatie** wordt gemeten. Een campagne over drie locaties heeft drie resultaatregels — precies wat je wilt weten: werkt deze aanpak overal even goed?

`roi` blijft leeg zolang de kosten niet zijn toegerekend. Bewust: een ROI zonder kosten is een misleidend getal.

### D5 — Kennisbank

`kennisartikel` is meer dan tekst, want dit is de data die de bot straks uitvoert:

| Veld | Waarvoor |
|---|---|
| `triggerwoorden` | text[], waarop moet dit artikel gevonden worden |
| `stappen` | text[], uitvoerbaar voor mens én machine |
| `vereist_goedkeuring` | mag de bot dit zelf afhandelen |
| `systeem_actie` | wat er in de systemen moet gebeuren |
| `zoektekst` | tsvector, Nederlandse full-text search |
| `herzien_voor` | wanneer verloopt dit artikel |

Een constraint verhindert dat een artikel op `actueel` staat zonder herzieningsdatum. Dat is de regel die voorkomt dat de bot ooit uit ongecontroleerde kennis put.

Locatiespecifieke artikelen (`locatie_id` gevuld) gaan vóór algemene artikelen in dezelfde categorie.

### Systeemtabellen

`connector` is de Connector Registry uit Hub v0.2 §4, als tabel. De regel "geen databron zonder regel hier" krijgt tanden via een constraint: een handmatige koppeling **moet** een reden hebben waarom hij nog handmatig is.

`koppeling_run` logt elke import: hoeveel gelezen, hoeveel verwerkt, geslaagd of niet. Zonder deze tabel merk je een stilgevallen koppeling pas als iemand een rapportage mist.

---

## De weergaven

| Weergave | Waarvoor | Mijlpaal |
|---|---|---|
| `v_locatie_dashboard` | de dwarsdoorsnede: omzet, bezetting, storingen, abonnementen, campagnes per locatie | M6 |
| `v_signaal_onderprestatie` | locaties >10% onder prognose, met de eerste oorzaakcheck al gedaan | M11 |
| `v_werklijst_kentekenmutaties` | wijzigingen die nog niet in het parkeersysteem staan | M4 |
| `v_datakwaliteit` | alles wat nog niet is ingevuld | M1 |
| `v_connector_gezondheid` | welke koppelingen staan stil | M7 |
| `v_maandoverzicht_locatie` | basis van het eigenaarsrapport | M8 |
| `v_kennisbank_bruikbaar` | de enige bron waar de bot uit mag putten | M9/M10 |
| `v_kennisbank_onderhoud` | de werklijst van de kennisbankeigenaar | M9 |
| `v_locatie_huidige_partner` | welk systeem draait er nú | M1 |
| `v_locatie_primaire_contactpartij` | naar wie gaat de rapportage | M1/M8 |
| `v_locatie_abonnement_ruimte` | is er nog plek | M3 |

**Waarom views en geen tabellen:** een view kan niet verouderen. Er is geen verversingsstap die kan mislukken en geen tweede plek waar dezelfde cijfers anders uitkomen. Bij 37 locaties is de rekentijd verwaarloosbaar.

### Twee drempels in de signaallus

`v_signaal_onderprestatie` signaleert pas bij **minimaal 7 dagen data** in de lopende maand en **minstens 10% afwijking**. De prognose wordt naar rato van die dagen berekend.

Beide zijn startwaarden. Na een half jaar echte data moeten ze worden bijgesteld op wat werkelijk ruis blijkt te zijn — dat is een taak in fase 5, geen instelling om te vergeten.

---

## Rechten

Toegang loopt via Postgres-rollen, niet via Row Level Security. Reden: NocoDB verbindt met een databaseconnectie, niet met een ingelogde Supabase-gebruiker, dus RLS grijpt daar niet vanzelf.

| Rol | Schrijft in |
|---|---|
| `py_lezer` | niets — leest alles, basisrol die iedereen erft |
| `py_directie` | registers, contracten, connectors |
| `py_financien` | omzet, bezetting, prognoses, facturen, incasso, rapportages |
| `py_operatie` | storingen, werkorders, onderhoud, apparatuur, locatie (update) |
| `py_klantenservice` | abonnementen, kentekenmutaties, klantvragen, kennisartikelen |
| `py_marketing` | campagnes, content, resultaten |
| `py_koppeling` | alles wat door koppelingen gevuld wordt — technische rol, geen mens |

Lezen is breed, schrijven is smal: iedereen mag in andermans gebied kijken, niemand mag er iets veranderen.

**RLS staat aan op alle tabellen, zonder policies.** Daarmee krijgen `anon` en `authenticated` niets via de Supabase-API. Dat is geen theoretische voorzorg: zonder deze stap zou iedereen met de publieke sleutel van het project het volledige abonneebestand kunnen ophalen, inclusief kentekens en IBAN's. Zodra er een eigenaars- of klantportaal komt, worden per tabel expliciete policies toegevoegd.

**Wachtwoorden staan niet in de migraties.** De rollen zijn groepsrollen zonder inlog; per domein wordt eenmalig handmatig een inlogaccount aangemaakt met een wachtwoord uit de kluis.

---

## Migraties draaien

```bash
# In volgorde, ON_ERROR_STOP is essentieel
for f in migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

psql "$DATABASE_URL" -f seed/seed_referentiedata.sql   # hoort ook in productie
psql "$DATABASE_URL" -f seed/seed_testdata.sql         # ALLEEN op een testomgeving
```

Getest op PostgreSQL 16. Supabase draait 17; er zit niets in dit schema dat tussen die versies verschilt.

### Vereisten

De extensies `pgcrypto`, `citext` en `btree_gist` worden door `0001` en `0003` zelf aangemaakt. Op Supabase zijn ze alle drie standaard beschikbaar.

### Twee valkuilen bij het uitbreiden

Beide zijn tijdens het bouwen tegengekomen en kosten anders een half uur zoeken:

1. **`array_to_string` is STABLE, niet IMMUTABLE** en mag dus niet in een generated column. Gebruik voor array-zoekfuncties een aparte GIN-index op de array zelf.
2. **`to_tsvector('dutch', ...)` moet `to_tsvector('dutch'::regconfig, ...)`** zijn. Zonder expliciete cast valt Postgres terug op de sessie-instelling en is de expressie niet immutable.

Verder: geef een nieuwe index nooit de naam `idx_<tabel>_status` — die naam is al in gebruik door `voeg_standaardvelden_toe()`.
