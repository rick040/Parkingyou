# ParkingYou Fundament — Projectplan v1.0

*Van losse Excel-sheets naar één verbonden systeem. Uitvoeringsplan met takenlijst en mijlpalen.*

**Versie 1.0 · augustus 2026 · status: ter besluitvorming**

---

## Inhoud

1. [Managementsamenvatting](#1-managementsamenvatting)
2. [Wat er verandert ten opzichte van de bestaande documenten](#2-wat-er-verandert-ten-opzichte-van-de-bestaande-documenten)
3. [De zes besluiten](#3-de-zes-besluiten)
4. [Architectuur](#4-architectuur)
5. [Fasering en mijlpalen](#5-fasering-en-mijlpalen)
6. [De takenlijst](#6-de-takenlijst)
7. [Governance](#7-governance)
8. [Risico's](#8-risicos)
9. [Wat er nog open staat](#9-wat-er-nog-open-staat)

---

## 1. Managementsamenvatting

ParkingYou exploiteert 37 locaties met Excel als feitelijke database. Rapportages worden met de hand gemaakt, systemen praten niet met elkaar, en niemand kan in één handeling zien hoe één locatie ervoor staat.

Er liggen vier goede architectuurdocumenten. Wat ontbrak, was een uitvoerbaar plan: een takenlijst, mijlpalen, en een manier om onderweg te toetsen of het werkt. Dit document is dat plan.

**De kern in vijf punten:**

1. **Eén database als bron van waarheid.** Supabase (PostgreSQL), met NocoDB erbovenop als formulierlaag zodat de zeven domeineigenaren er zelf in kunnen werken zonder ooit een tabel te zien. Het schema ligt klaar en is getest — 29 tabellen, 11 weergaven.

2. **Het kritieke pad is niet het bouwen.** De doorlooptijd wordt bepaald door de API-toegang van SKIDATA, IP Parking, Scheidt & Bachmann en Aeroparker. Die aanvragen gaan de eerste week de deur uit, niet in maand drie.

3. **Elf mijlpalen met uitgeschreven testscripts.** Niet "fase 1 is klaar", maar: *wijzig een kenteken via het formulier en controleer of de mutatie is vastgelegd én doorgezet.* Elke mijlpaal heeft genummerde teststappen en een aftekenveld.

4. **Twaalf maanden, in zes fasen.** Elke fase levert op zichzelf al waarde op. Fasen mogen uitlopen; de volgorde ligt vast.

5. **Adoptie is ingebouwd, niet toegevoegd.** Elk domein levert eerst één zichtbare winst vóór er één regel wordt gemigreerd, en elke domeineigenaar bouwt zijn eigen domein mee.

**Wat het oplevert, per domein:**

| Domein | Vandaag | Na dit project |
|---|---|---|
| Financiën | maandrapportage kost dagen | kost minuten, automatisch verzonden |
| Operatie | storingen in mailboxen en hoofden | storingshistorie per locatie en per apparaat |
| Klantenservice | 250 vragen per maand, alles handwerk | standaardvragen automatisch, uitzonderingen met context |
| Marketing | campagnes op onderbuik | signaal uit data, ROI teruggemeten |
| Kennisbank | verspreid over mensen | één bron, met herzieningsdatum |

---

## 2. Wat er verandert ten opzichte van de bestaande documenten

De vier bestaande documenten zijn achter elkaar geschreven en spreken elkaar op drie punten tegen. Dit plan hakt die knopen door.

| # | Conflict | Besluit | Waarom |
|---|---|---|---|
| 1 | Mappenstructuur v1.0: "Supabase/Postgres". Datamodel v2.0: "Airtable" | **Supabase + NocoDB** | Beide documenten hebben gelijk over het probleem dat ze oplossen. Postgres geeft eigenaarschap en geen limieten; NocoDB geeft de zeven domeineigenaren een formulierlaag die als Airtable voelt. De formulierlaag is inwisselbaar, de data blijft staan. |
| 2 | Datamodel v2.0: 350 productieve uren per jaar is te weinig voor deze roadmap | **Rick + Claude Code als bouwers** | De analyse klopte toen hij geschreven werd. Met AI als bouwer comprimeert het technische werk — schema's, koppelingen, importscripts — van weken naar uren. Wat níét comprimeert: leveranciers, dataverzameling en gedragsverandering. Daar is dit plan omheen gebouwd. |
| 3 | Data Framework: `PY-LOC-014`. Alle latere documenten: `LOC-014` | **`LOC-014`** | Kortste vorm, consistent met de mappenstructuur die al is uitgeschreven. |

### Wat het kritieke pad écht is

De blauwdruk gaat ervan uit dat bouwen de bottleneck is. Dat is niet meer waar. De onsamendrukbare delen zijn:

1. **API-toegang van de vier parkeersystemen.** Doorlooptijd weken tot maanden, volledig afhankelijk van derden. Dit start in week 1.
2. **Het verzamelen van de 37 locatiedossiers.** Contractpartijen, dienstverleningstype, systeempartner. Mensenwerk, een paar dagdelen.
3. **AFAS-scope opvragen** bij de consultant. Bepaalt of AFAS bron of ontvanger is.
4. **Gedragsverandering in het team.** Laat zich niet versnellen.

Daarom starten in fase 0 alle vier tegelijk, en loopt het technische bouwwerk daar parallel aan.

---

## 3. De zes besluiten

| # | Besluit | Keuze | Status |
|---|---|---|---|
| 1 | Datalaag | Supabase (PostgreSQL), regio eu-central-1 | **genomen** |
| 2 | Formulierlaag | NocoDB, gekoppeld op Supabase | **genomen** |
| 3 | Automatiseringslaag | Supabase Edge Functions + `pg_cron`; Make/n8n alleen voor mens-in-de-lus | **advies, te bevestigen** |
| 4 | Klantenservice-kanaal | Zendesk uitbreiden of alleen mail houden | **open — blokkeert fase 4** |
| 5 | Boekhouding | AFAS blijft bron van waarheid, datalaag levert aan | **advies, scope opvragen** |
| 6 | Documentlaag | SharePoint-teamsite; Notion uitfaseren | **advies** |

### Toelichting bij besluit 1 en 2

De twee brondocumenten kozen tegengesteld, en allebei met een goed argument. Supabase geeft eigenaarschap over de data, geen record- of API-limieten, en sluit aan op elke tool. Airtable geeft toegankelijkheid voor zeven niet-technische mensen.

Het is geen of-of. NocoDB is open source, draait rechtstreeks op een bestaande Postgres-database, en biedt formulieren, lijstweergaven en rollen die voor de gebruiker niet van Airtable te onderscheiden zijn. Het verschil: als NocoDB morgen wegvalt, staat de data er nog. Bij Airtable niet.

De prijs is een halve dag extra opzetwerk in fase 0. Dat is het waard.

### Toelichting bij besluit 3

De blauwdruk noemt Make, n8n of Power Automate. Dat advies past bij een organisatie waar een mens de koppelingen klikt.

Nu Claude Code de bouwer is, is dat niet meer de goedkoopste route. Een koppeling als code in deze repository is versioneerbaar, testbaar, en kost geen maandelijkse licentie per scenario. Concreet: **Supabase Edge Functions voor de koppelingen, `pg_cron` voor de planning.**

Middleware-as-a-service blijft wél de juiste keuze voor flows waar een mens tussen zit: goedkeuringsmails, notificaties naar hosts, escalaties. Daar is de visuele bouwer het punt.

Dit besluit is omkeerbaar en hoeft pas in fase 2 definitief te zijn.

### Toelichting bij besluit 4 — het enige dat echt open is

Zendesk bestaat al voor mail. De vraag is of telefoon, socials en meldkamer daar ook samenkomen.

Dit besluit blokkeert fase 0 tot en met 3 niet, maar wel fase 4. Er is één ding dat eerst uitgezocht moet worden: **wat de meldkamer precies doet en waar die meldingen nu landen.** Een intercommelding bij een dichte slagboom is tegelijk een klantvraag en een storingssignaal. Zolang onbekend is waar die stroom heen gaat, is elke keuze voor een klantenservicekanaal half geïnformeerd. Dat uitzoekwerk staat als taak 0.31 in fase 0.

---

## 4. Architectuur

De vier lagen uit Hub Architecture v0.2, ingevuld met de gekozen tools.

```
┌──────────────────────────────────────────────────────────────┐
│ LAAG 4 — CONSUMPTIE                                          │
│ NocoDB-weergaven · dashboards · eigenaarsrapportages ·       │
│ klantenservicebot · signaallus                               │
└──────────────────────────┬───────────────────────────────────┘
┌──────────────────────────┴───────────────────────────────────┐
│ LAAG 3 — DE HUB (bron van waarheid)                          │
│ Supabase / PostgreSQL — 29 tabellen, 11 weergaven            │
│ Registers · D1 Financiën · D2 Operatie · D3 Klantenservice   │
│ D4 Marketing · D5 Kennisbank                                 │
└──────────────────────────┬───────────────────────────────────┘
┌──────────────────────────┴───────────────────────────────────┐
│ LAAG 2 — INTEGRATIE                                          │
│ Supabase Edge Functions + pg_cron (code in deze repo)        │
│ Make/n8n alleen voor flows met een mens erin                 │
│ Elke bron heeft een regel in de Connector Registry           │
└──────────────────────────┬───────────────────────────────────┘
┌──────────────────────────┴───────────────────────────────────┐
│ LAAG 1 — BRONSYSTEMEN                                        │
│ SKIDATA · IP Parking · Scheidt & Bachmann · Aeroparker ·     │
│ AFAS · bank/PSP · Zendesk · GA4/Ads · Canva                  │
└──────────────────────────────────────────────────────────────┘
```

**De regel die dit draagbaar houdt:** een nieuwe tool toevoegen betekent één connector in laag 2 bouwen die naar het bestaande contract in laag 3 schrijft. Aan laag 3 en 4 verandert niets.

**Documentlaag.** SharePoint blijft, maar alleen voor documenten. De structuur staat in `ParkingYou_Mappenstructuur.md` en verandert niet. De database bevat de verwijzing naar het document (veld `documentlink`), nooit andersom.

Het datamodel is uitgewerkt in [`../01_DATABASE/DATAMODEL.md`](../01_DATABASE/DATAMODEL.md). De migraties in `../01_DATABASE/migrations/` zijn getest en direct uitvoerbaar.

---

## 5. Fasering en mijlpalen

Zes fasen, elf mijlpalen. Elke mijlpaal heeft een uitgeschreven testscript in [`../02_WERKMATERIAAL/Mijlpaal_Testrapporten.md`](../02_WERKMATERIAAL/Mijlpaal_Testrapporten.md), met genummerde stappen, verwacht resultaat, en een aftekenveld.

| Fase | Periode | Mijlpaal | Wat er dan staat |
|---|---|---|---|
| **0. Fundament** | week 1–4 | **M0** Besluiten genomen, kritiek pad gestart | Vier leveranciersaanvragen de deur uit, besluiten 1–3 en 6 vastgelegd |
| | | **M1** Registers live | 37 locaties in Supabase, zichtbaar in NocoDB, `v_datakwaliteit` leeg |
| | | **M2** Documentlaag live | Nieuwe SharePoint-structuur in gebruik, oude drive alleen-lezen |
| **1. Abonnementen** | week 4–8 | **M3** Abonnementen gemigreerd | Alle abonnees in de datalaag, Excel-bestanden bevroren |
| | | **M4** Kentekenwijziging end-to-end | Formulier werkt, mutatie wordt automatisch vastgelegd |
| **2. Eerste koppeling** | week 6–14 | **M5** Pilot-parkeersysteem levert data | Dagelijkse automatische import, herhaalbaar |
| | | **M6** Dashboard per locatie | De dwarsdoorsnede werkt voor alle exploitatielocaties |
| **3. Uitrollen** | maand 4–7 | **M7** Alle platformen + AFAS gekoppeld | Nul locaties met een gat in de data |
| | | **M8** Eigenaarsrapportages automatisch | Maandrapport gegenereerd én verzonden zonder handwerk |
| **4. Klantenservice** | maand 6–9 | **M9** Kanaal gekoppeld + kennisbank gevuld | Klantvragen in de datalaag, 20 kernartikelen actueel |
| **5. Automatiseren** | maand 9–12 | **M10** AI-klantenservice live | Standaardvragen zonder mens, escalatie mét context |
| | | **M11** Signaallus actief | Signaal → oorzaak → campagne → ROI, rond |

**Volgorde is heilig, tempo niet.** Elke fase mag uitlopen. Fasen overslaan wreekt zich: een bot op een lege kennisbank, een dashboard zonder datalaag.

**Belangrijkste afwijking van de bestaande roadmaps:** fase 0 en het kritieke pad starten gelijktijdig, en de kennisbank schuift naar voren omdat het schrijfwerk is dat parallel kan lopen — precies zoals Datamodel v2.0 al voorstelde.

---

## 6. De takenlijst

175 taken. Ook als spreadsheet: [`Takenlijst_en_Mijlpalen.xlsx`](Takenlijst_en_Mijlpalen.xlsx).

**Eigenaren:** `R` = Rick · `C` = Claude Code · `DIR` = directie · `D1`–`D5` = domeineigenaren · `EXT` = externe partij (leverancier, consultant)

**Inspanning** is de schatting voor de eigenaar van de taak, in uren.

---

### Fase 0 — Fundament (week 1–4)

#### 0A. Het kritieke pad — deze week de deur uit

Dit blok is het belangrijkste van het hele plan. Alles hierin heeft een doorlooptijd die niet door ons wordt bepaald, dus het start op dag één.

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.1 | Contactpersonen achterhalen bij SKIDATA, IP Parking, Scheidt & Bachmann, Aeroparker | R | 2 | — |
| 0.2 | Aanvraagbrief opstellen per leverancier (sjabloon in 02_WERKMATERIAAL) | C | 1 | 0.1 |
| 0.3 | Aanvraag versturen naar SKIDATA — API/export, formaten, kosten, voorwaarden | R | 0,5 | 0.2 |
| 0.4 | Aanvraag versturen naar IP Parking | R | 0,5 | 0.2 |
| 0.5 | Aanvraag versturen naar Scheidt & Bachmann | R | 0,5 | 0.2 |
| 0.6 | Aanvraag versturen naar Aeroparker | R | 0,5 | 0.2 |
| 0.7 | AFAS-consultant benaderen: welke connectoren zitten in onze licentie, doet AFAS al facturatie/incasso? | R | 1 | — |
| 0.8 | Zendesk: huidige inrichting en API-mogelijkheden in kaart brengen | D3 | 2 | — |
| 0.9 | Aanvraagdata vastleggen in `connector.aanvraag_verstuurd_op` | R | 0,5 | 0.3–0.6 |
| 0.10 | Herinnering inplannen: geen antwoord na 10 werkdagen = nabellen | R | 0,25 | 0.9 |

#### 0B. Besluiten en mandaat

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.11 | Besluit 1 en 2 formeel vastleggen in het besluitenlogboek | DIR | 1 | — |
| 0.12 | Besluit 3 (automatiseringslaag) bevestigen of afwijzen | R+DIR | 1 | — |
| 0.13 | Besluit 6 (SharePoint-teamsite, Notion uitfaseren) nemen, mét einddatum voor Notion | DIR | 1 | — |
| 0.14 | Zeven domeineigenaren formeel aanwijzen — rol, niet persoon | DIR | 2 | — |
| 0.15 | Kick-off met de domeineigenaren: wat verandert er, wat wordt van hen verwacht | R | 3 | 0.14 |
| 0.16 | Afspraak vastleggen: 2 uur per week per domeineigenaar, in de agenda | DIR | 1 | 0.15 |
| 0.17 | Bevriezingsdatum oude drive afspreken en communiceren | DIR | 1 | 0.14 |
| 0.18 | Maandelijks voortgangsoverleg inplannen voor de hele looptijd | R | 0,5 | 0.14 |

#### 0C. De datalaag opzetten

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.19 | Supabase-project `parkingyou-productie` aanmaken (eu-central-1) | R | 0,5 | 0.11 |
| 0.20 | Migraties 0001–0011 toepassen | C | 0,5 | 0.19 |
| 0.21 | `seed_referentiedata.sql` laden (Connector Registry) | C | 0,25 | 0.20 |
| 0.22 | Schema controleren: 29 tabellen, 11 weergaven, RLS actief | C | 0,5 | 0.20 |
| 0.23 | Domeinrollen aanmaken met inlogaccounts; wachtwoorden in de kluis | R | 1 | 0.20 |
| 0.24 | Automatische back-up controleren en bewaartermijn instellen | R | 0,5 | 0.19 |
| 0.25 | Supabase-branch `test` aanmaken voor het oefenen van mijlpalen | C | 0,5 | 0.20 |

#### 0D. De formulierlaag

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.26 | NocoDB opzetten (cloud of self-hosted) en verbinden met Supabase | R+C | 3 | 0.23 |
| 0.27 | Base per domein aanmaken, elk met de eigen domeinrol als connectie | C | 2 | 0.26 |
| 0.28 | Formulier + lijstweergave voor het locatieregister | C | 2 | 0.27 |
| 0.29 | Formulier voor contractpartijen en systeempartner-historie | C | 2 | 0.27 |
| 0.30 | Inloggegevens uitdelen en per domeineigenaar 30 minuten uitleg geven | R | 4 | 0.28 |

#### 0E. Uitzoekwerk dat besluiten blokkeert

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.31 | **Meldkamer in kaart brengen:** wat doen ze, wat registreren ze, waar landt het, is het te ontsluiten? | D2 | 4 | — |
| 0.32 | Bestaan er prognoses per locatie? Zo ja, waar en hoe gemaakt? | D1 | 2 | — |
| 0.33 | Inventariseren welk parkeersysteem op hoeveel locaties draait (bepaalt de pilot) | D2 | 2 | — |
| 0.34 | AVG: verwerkingsregister actualiseren voor de nieuwe datalaag | DIR | 3 | 0.20 |
| 0.35 | AVG: bewaartermijn kentekens en abonneegegevens na opzegging vastleggen | DIR | 2 | 0.34 |
| 0.36 | AVG: verwerkersovereenkomst met Supabase controleren en archiveren | DIR | 1 | 0.19 |

#### 0F. De registers vullen

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.37 | Locatiesjabloon invullen: 37 locaties, basisgegevens | D2 | 6 | 0.28 |
| 0.38 | Per locatie het dienstverleningstype bepalen (exploitatie/advies/onderhoud/beheer) | D2+DIR | 2 | 0.37 |
| 0.39 | Per locatie de systeempartner en het externe locatie-ID vastleggen | D2 | 3 | 0.37 |
| 0.40 | Per locatie de contractpartijen vastleggen, inclusief wie primair contact is | DIR | 4 | 0.37 |
| 0.41 | Lopende contracten koppelen aan locaties, met documentlink naar SharePoint | DIR | 4 | 0.40 |
| 0.42 | Parkeerhosts invoeren en aan locaties koppelen | D2 | 2 | 0.37 |
| 0.43 | Apparatuur per locatie invoeren (slagbomen, automaten, intercoms) | D2 | 6 | 0.37 |
| 0.44 | Import uitvoeren en `v_datakwaliteit` leegwerken | C+D2 | 3 | 0.37–0.43 |

#### 0G. De documentlaag

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 0.45 | SharePoint-teamsite aanmaken met de structuur uit de mappenstructuur | R | 3 | 0.13 |
| 0.46 | Rechten per hoofdmap instellen volgens de toegangsmatrix | R | 2 | 0.45 |
| 0.47 | 90_TEMPLATES vullen: één versie per sjabloonsoort, ontdubbeld | alle | 6 | 0.45 |
| 0.48 | Locatiedossiers aanmaken: 37 mappen met vaste indeling | D2 | 2 | 0.45 |
| 0.49 | Vitale documenten overzetten (regel: wat je de komende 90 dagen nodig hebt) | alle | 12 | 0.47 |
| 0.50 | Oude drive op alleen-lezen zetten op de afgesproken datum | R | 1 | 0.17, 0.49 |
| 0.51 | Notion exporteren en archiveren in 99_ARCHIEF | R | 2 | 0.13 |
| 0.52 | Spelregels-A4 ophangen en in de kennisbank plaatsen | R | 1 | 0.45 |

> **▶ MIJLPAAL M0** na 0.9 · **▶ MIJLPAAL M1** na 0.44 · **▶ MIJLPAAL M2** na 0.52

---

### Fase 1 — Abonnementen (week 4–8)

*Dit is de grootste directe pijnverlichting: het einde van de losse abonneebestanden.*

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 1.1 | Alle bestaande abonneebestanden verzamelen en inventariseren | D3 | 3 | M1 |
| 1.2 | Bepalen welk bestand leidend is bij tegenstrijdigheden | D3+D1 | 2 | 1.1 |
| 1.3 | Kentekens normaliseren en dubbelingen opsporen | C | 2 | 1.1 |
| 1.4 | Ontbrekende gegevens aanvullen (IBAN, machtigingskenmerk, startdatum) | D3 | 8 | 1.3 |
| 1.5 | Abonnees invoeren in het relatieregister | C | 2 | 1.4 |
| 1.6 | Abonnementen importeren, gekoppeld aan locatie en relatie | C | 3 | 1.5 |
| 1.7 | Importcontrole: aantallen vergelijken, tien records handmatig naslaan | D3 | 3 | 1.6 |
| 1.8 | `capaciteit_abonnement` per locatie invullen en tegen de import controleren | D2 | 2 | 1.6 |
| 1.9 | Formulier: nieuw abonnement aanvragen | C | 3 | M1 |
| 1.10 | Formulier: kenteken wijzigen | C | 2 | 1.9 |
| 1.11 | Formulier: abonnement opzeggen, met opzegreden | C | 2 | 1.9 |
| 1.12 | Weergave: abonnementen per locatie, met vrije plekken | C | 1 | 1.9 |
| 1.13 | Weergave: openstaande kentekenmutaties als dagelijkse werklijst | C | 1 | 1.10 |
| 1.14 | Weergave: abonnementen zonder SEPA-akkoord | C | 1 | 1.6 |
| 1.15 | Klantenservice instrueren op de nieuwe formulieren | R | 3 | 1.9–1.11 |
| 1.16 | Twee weken parallel draaien: Excel én datalaag, verschillen noteren | D3 | 4 | 1.15 |
| 1.17 | Verschillen uit 1.16 analyseren en oplossen | C+D3 | 3 | 1.16 |
| 1.18 | Excel-abonneebestanden op alleen-lezen zetten en archiveren | D3 | 1 | 1.17 |
| 1.19 | Procedure kentekenwijziging herschrijven naar de nieuwe werkwijze | D3 | 2 | 1.10 |
| 1.20 | Procedure abonnementsaanvraag herschrijven | D3 | 2 | 1.9 |
| 1.21 | AVG-check: staan er geen kentekens meer buiten de datalaag? | DIR | 2 | 1.18 |
| 1.22 | Eerste zichtbare winst voor D3 opleveren: abonnee-opzoek in seconden | R | 1 | 1.12 |

> **▶ MIJLPAAL M3** na 1.18 · **▶ MIJLPAAL M4** na 1.13

---

### Fase 2 — Eerste koppeling en dashboard (week 6–14)

*Eén parkeersysteem als pilot. Pas als er één werkt, weet je wat de andere twee kosten.*

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 2.1 | Pilotplatform kiezen: het systeem met de meeste locaties dat antwoord heeft gegeven | R | 1 | 0.33, M0 |
| 2.2 | Koppeldocumentatie van de leverancier doornemen | C | 3 | 2.1 |
| 2.3 | Testtoegang aanvragen en verkrijgen | R | 2 | 2.1 |
| 2.4 | Externe locatie-ID's vastleggen in `systeem_historie` | D2 | 2 | 2.3 |
| 2.5 | Connector bouwen: omzet per locatie per dag ophalen | C | 8 | 2.3, 2.4 |
| 2.6 | Connector bouwen: bezettingsgegevens ophalen | C | 4 | 2.5 |
| 2.7 | Foutafhandeling en logging naar `koppeling_run` | C | 3 | 2.5 |
| 2.8 | Idempotentie testen: dezelfde dag twee keer importeren mag niet verdubbelen | C | 2 | 2.5 |
| 2.9 | Historische data inlezen: minimaal 12 maanden terug | C | 4 | 2.8 |
| 2.10 | Reconciliatie: totalen vergelijken met het leveranciersportaal, per maand | D1 | 4 | 2.9 |
| 2.11 | Afwijkingen uit 2.10 verklaren en documenteren | C+D1 | 4 | 2.10 |
| 2.12 | Planning instellen via `pg_cron`, dagelijks 06:00 | C | 1 | 2.11 |
| 2.13 | Alarmering bij een mislukte of uitgebleven run | C | 3 | 2.12 |
| 2.14 | Connector Registry bijwerken: status actief, frequentie, eigenaar | R | 0,5 | 2.12 |
| 2.15 | Prognoses per locatie vaststellen of opstellen | D1 | 6 | 0.32 |
| 2.16 | Prognoses invoeren in de datalaag | D1 | 2 | 2.15 |
| 2.17 | Boekingsregel toepassen: abonnementsomzet per dag, niet per maand | C+D1 | 2 | 2.9 |
| 2.18 | Dashboard bouwen op `v_locatie_dashboard` | C | 6 | 2.12 |
| 2.19 | Dashboard: overzicht alle locaties, sorteerbaar op afwijking | C | 3 | 2.18 |
| 2.20 | Dashboard: detailweergave per locatie | C | 3 | 2.18 |
| 2.21 | Toegang tot het dashboard regelen per rol | R | 1 | 2.18 |
| 2.22 | Signaaldrempels toetsen op echte data en zo nodig bijstellen | C+D1 | 2 | 2.19 |
| 2.23 | Team-demo van het dashboard | R | 2 | 2.21 |
| 2.24 | Eerste zichtbare winst voor D1 en D2: cijfers per locatie zonder handwerk | R | 1 | 2.23 |
| 2.25 | Doorlooptijd en kosten van deze koppeling vastleggen als raming voor de rest | R | 1 | 2.14 |

> **▶ MIJLPAAL M5** na 2.14 · **▶ MIJLPAAL M6** na 2.23

---

### Fase 3 — Uitrollen (maand 4–7)

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 3.1 | Tweede parkeersysteem koppelen (patroon uit fase 2 hergebruiken) | C | 10 | M5 |
| 3.2 | Reconciliatie tweede systeem | D1 | 3 | 3.1 |
| 3.3 | Derde parkeersysteem koppelen | C | 10 | 3.2 |
| 3.4 | Reconciliatie derde systeem | D1 | 3 | 3.3 |
| 3.5 | Aeroparker koppelen: reserveringen en reserveringsomzet | C | 8 | M5 |
| 3.6 | Reconciliatie Aeroparker | D1 | 3 | 3.5 |
| 3.7 | Controle: elke exploitatielocatie levert data over de laatste 7 dagen | C | 2 | 3.4, 3.6 |
| 3.8 | Gaten uit 3.7 oplossen | C | 6 | 3.7 |
| 3.9 | Storingsmeldingen uit de parkeersystemen naar `storing` doorzetten | C | 8 | 3.4 |
| 3.10 | AFAS-koppeling ontwerpen op basis van de scope uit 0.7 | C | 4 | 0.7 |
| 3.11 | AFAS: facturen aanleveren vanuit de datalaag | C | 10 | 3.10 |
| 3.12 | AFAS: factuurstatus teruglezen naar `factuur.afas_referentie` | C | 6 | 3.11 |
| 3.13 | Aansluitcontrole datalaag ↔ AFAS over één volledige maand | D1 | 4 | 3.12 |
| 3.14 | Bankkoppeling: SEPA-incassoresultaten en storneringen inlezen | C | 8 | 3.12 |
| 3.15 | Sjabloon eigenaarsrapport ontwerpen, met D1 en directie | D1 | 6 | M6 |
| 3.16 | Rapportgenerator bouwen op `v_maandoverzicht_locatie` | C | 10 | 3.15 |
| 3.17 | Rapporten wegschrijven naar de juiste map in SharePoint, met naamgeving | C | 4 | 3.16 |
| 3.18 | Verzendlijst uit `v_locatie_primaire_contactpartij` halen | C | 2 | 3.16 |
| 3.19 | Verzending automatiseren, met vastlegging in `rapportage` | C | 6 | 3.18 |
| 3.20 | Proefdraai: alle rapporten genereren zonder te verzenden, en controleren | D1 | 4 | 3.19 |
| 3.21 | Eerste echte maandronde begeleiden en nalopen | D1+R | 4 | 3.20 |
| 3.22 | Eigenaren informeren over het nieuwe rapportformaat | DIR | 3 | 3.21 |
| 3.23 | Werkorders voor hosts: storing wordt automatisch werkorder | C | 6 | 3.9 |
| 3.24 | Mobiele weergave voor hosts (werklijst per regio) | C | 4 | 3.23 |
| 3.25 | Hosts instrueren op de werkorderweergave | D2 | 4 | 3.24 |
| 3.26 | Onderhoudshistorie per apparaat vullen vanuit bestaande administratie | D2 | 6 | M1 |
| 3.27 | Marketingkoppelingen: GA4 en Google Ads | C | 8 | M6 |
| 3.28 | Campagneregistratie inrichten in NocoDB voor D4 | C | 4 | M6 |

> **▶ MIJLPAAL M7** na 3.8 · **▶ MIJLPAAL M8** na 3.21

---

### Fase 4 — Klantenservice en kennisbank (maand 6–9)

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 4.1 | Besluit 4 nemen op basis van het meldkameronderzoek | DIR | 2 | 0.31 |
| 4.2 | Klantenservicekanaal inrichten volgens besluit 4 | D3 | 8 | 4.1 |
| 4.3 | Koppeling bouwen: tickets naar `klantvraag` | C | 10 | 4.2 |
| 4.4 | Automatische herkenning van locatie en abonnee bij een binnenkomend ticket | C | 6 | 4.3 |
| 4.5 | Categorieënlijst vaststellen op basis van drie maanden echte vragen | D3 | 4 | 4.3 |
| 4.6 | Intercom-/meldkamerstroom koppelen aan `klantvraag` én `storing` | C | 8 | 4.1 |
| 4.7 | Weergave: klantvragen per locatie en per categorie | C | 2 | 4.5 |
| 4.8 | Nulmeting: hoeveel vragen per categorie, hoeveel tijd per vraag | D3 | 3 | 4.7 |
| 4.9 | Top 20 meestgestelde vragen bepalen uit de nulmeting | D3 | 2 | 4.8 |
| 4.10 | Kennisartikelen schrijven voor de top 20 | D5 | 20 | 4.9 |
| 4.11 | Per artikel triggerwoorden en stappen invullen | D5 | 8 | 4.10 |
| 4.12 | Per artikel bepalen of goedkeuring nodig is en welke systeemactie hoort | D5+D3 | 4 | 4.11 |
| 4.13 | Locatiespecifieke bijzonderheden vastleggen voor alle 37 locaties | D5+D2 | 16 | M1 |
| 4.14 | Herzieningsdata instellen; alle actuele artikelen krijgen een houdbaarheid | D5 | 2 | 4.12 |
| 4.15 | Artikelen laten reviewen door een tweede lezer | D3 | 6 | 4.14 |
| 4.16 | Formulier voor het beheren van kennisartikelen in NocoDB | C | 3 | M1 |
| 4.17 | Maandelijkse onderhoudsronde inrichten op `v_kennisbank_onderhoud` | D5 | 1 | 4.16 |
| 4.18 | Bestaand bronmateriaal uit 05_KENNISBANK omzetten naar artikelen | D5 | 8 | 4.16 |
| 4.19 | Kennisbank ontsluiten voor het team (zoekfunctie) | C | 4 | 4.15 |
| 4.20 | Onboarding nieuwe collega's op de kennisbank baseren | D3 | 3 | 4.19 |
| 4.21 | Eerste zichtbare winst voor D3: elk antwoord op één plek | R | 1 | 4.19 |
| 4.22 | Effect meten: is de gemiddelde afhandeltijd gedaald? | D3 | 2 | 4.21 |

> **▶ MIJLPAAL M9** na 4.15

---

### Fase 5 — Automatiseren (maand 9–12)

| # | Taak | Eigenaar | Uren | Hangt af van |
|---|---|---|---|---|
| 5.1 | Botarchitectuur ontwerpen op `v_kennisbank_bruikbaar` | C | 6 | M9 |
| 5.2 | Bot bouwen: vraag herkennen en artikel matchen | C | 12 | 5.1 |
| 5.3 | Bot: identiteitsverificatie van de klant | C | 8 | 5.2 |
| 5.4 | Bot: kentekenwijziging uitvoeren, inclusief vastlegging | C | 8 | 5.3 |
| 5.5 | Bot: escalatieregels — wat gaat altijd naar een mens | C+D3 | 4 | 5.2 |
| 5.6 | Bot: escalatie mét volledige context doorgeven | C | 4 | 5.5 |
| 5.7 | Testset van 50 echte vragen samenstellen uit de historie | D3 | 4 | 5.2 |
| 5.8 | Bot testen op de testset, resultaten scoren | C+D3 | 6 | 5.7 |
| 5.9 | Bijsturen op de gevonden fouten | C | 8 | 5.8 |
| 5.10 | Schaduwdraaien: bot stelt voor, mens keurt goed, twee weken lang | D3 | 8 | 5.9 |
| 5.11 | Live met de veiligste categorie eerst | D3+R | 4 | 5.10 |
| 5.12 | Categorieën stapsgewijs uitbreiden | D3 | 6 | 5.11 |
| 5.13 | Doorzetten van kentekenwijzigingen naar de parkeersystemen automatiseren | C | 10 | M7 |
| 5.14 | Bewaken dat `v_werklijst_kentekenmutaties` dagelijks leegloopt | D3 | 2 | 5.13 |
| 5.15 | SEPA-flow: machtiging aanvragen bij een nieuw abonnement | C | 10 | M8 |
| 5.16 | SEPA-flow: incassobatch genereren | C | 8 | 5.15 |
| 5.17 | SEPA-flow: storneringen automatisch verwerken en opvolgen | C | 6 | 5.16, 3.14 |
| 5.18 | Signaallus: signalering activeren op `v_signaal_onderprestatie` | C | 4 | M7 |
| 5.19 | Signaallus: automatische interne oorzaakcheck bij Operatie | C | 6 | 5.18 |
| 5.20 | Signaallus: externe oorzaakcheck (werkzaamheden, evenementen rond de GPS-locatie) | C | 8 | 5.19 |
| 5.21 | Signaallus: campagne-aanleiding met context naar Marketing | C | 6 | 5.20 |
| 5.22 | Signaallus: ROI automatisch terugmeten na afloop van het na-venster | C | 8 | 5.21 |
| 5.23 | Signaaldrempels bijstellen op een half jaar echte data | D1+C | 3 | 5.18 |
| 5.24 | Volledige lus testen op één locatie, van signaal tot ROI | R+D4 | 4 | 5.22 |
| 5.25 | Jaarlijkse schoonmaakdag inplannen, structureel in de agenda | DIR | 1 | — |
| 5.26 | Evaluatie: wat is er gehaald, wat gaat naar jaar twee | R+DIR | 4 | 5.24 |

> **▶ MIJLPAAL M10** na 5.12 · **▶ MIJLPAAL M11** na 5.24

---

### Samenvatting van de inspanning

| Fase | Taken | Uren R+C | Uren domeineigenaren | Uren directie |
|---|---|---|---|---|
| 0. Fundament | 52 | 36 | 53 | 20 |
| 1. Abonnementen | 22 | 21 | 30 | 2 |
| 2. Koppeling + dashboard | 25 | 48,5 | 22 | 0 |
| 3. Uitrollen | 28 | 116 | 37 | 3 |
| 4. Klantenservice + kennisbank | 22 | 34 | 87 | 2 |
| 5. Automatiseren | 26 | 112 | 45 | 1 |
| **Totaal** | **175** | **367,5** | **274** | **28** |

Verdeeld over 12 maanden komt dat neer op ruim **7 uur per week voor Rick en Claude samen**, en **gemiddeld 45 minuten per week per domeineigenaar** — ruim binnen de afgesproken 2 uur.

Twee kanttekeningen bij deze getallen. De uren voor Claude zijn geen doorlooptijd maar begeleidingstijd: het bouwen zelf gaat sneller, maar specificeren, controleren en bijsturen niet. En de zwaarte zit in fase 3 en 5, precies waar de externe afhankelijkheden het grootst zijn — daar is de kans op uitloop het hoogst.

---

## 7. Governance

### Eigenaarschap

Eigenaarschap is een rol, geen persoon. Bij een personeelswissel verhuist de rol, niet de chaos.

| Gebied | Eigenaar | Beslist over |
|---|---|---|
| Registers, 00_ORGANISATIE | Directie | structuurwijzigingen, nieuwe domeinen |
| D1-tabellen, 01_FINANCIEN | Financiën | rapportageformats, facturatie- en incassostromen |
| D2-tabellen, 02_OPERATIE, 06_LOCATIES | Operatie | werkinstructies, locatiedossiers, apparatuurdata |
| D3/D5-tabellen, 03_KLANTENSERVICE, 05_KENNISBANK | Klantenservice | procedures, standaardteksten, kennisartikelen |
| D4-tabellen, 04_MARKETING | Marketing | merk, campagnes, contentbibliotheek |
| 90_TEMPLATES | per domein | de eigen sjablonen |

De eigenaar is de enige die de indeling van zijn gebied mag wijzigen. Iedereen mag er wél in werken.

### De vijf spelregels

1. **Data in de database, documenten in de mappen.** Begin je een lijst in Excel? Stop — dat is een tabel.
2. **Eén origineel, nul kopieën.** Deel een link. Sjablonen komen altijd uit 90_TEMPLATES.
3. **Nieuwe bestanden volgen de naamgeving.** Zonder uitzondering — de automatisering leunt erop.
4. **Klaar of achterhaald? Archief.** De werkstructuur bevat alleen wat actueel is.
5. **Eén schoonmaakdag per jaar.** In de agenda, heilig.

### De vier governance-regels van de hub

1. Eén bron van waarheid per databron — nooit dezelfde data in twee systemen.
2. Elk nieuw domein of tool volgt het domeincontract voordat het wordt opgenomen.
3. **Elke databron staat in de Connector Registry vóór gebruik.** In dit schema afgedwongen: een handmatige connector moet een reden hebben waarom hij nog handmatig is.
4. Niets wordt verwijderd, alles wordt gestatust.

### Adoptie

Vier maatregelen, uit Datamodel v2.0 §5, allemaal verwerkt in de takenlijst:

1. **De formuliereis is een ontwerpeis.** Niemand ziet ooit een ruwe tabel. Als iets niet als formulier kan, is het ontwerp fout — niet de gebruiker.
2. **Per domein één eigenaar die meebouwt.** Eigenaarschap ontstaat door bouwen, niet door instructie. (Taken 0.14–0.16)
3. **Elk domein levert eerst één zichtbare winst.** Taken 1.22, 2.24 en 4.21 staan er expliciet voor in de lijst.
4. **De oude drive gaat op alleen-lezen op een afgesproken datum.** Niet "we faseren uit" — een datum. (Taken 0.17 en 0.50)

---

## 8. Risico's

| Risico | Kans | Impact | Wat we doen |
|---|---|---|---|
| **Een leverancier levert geen API of vraagt een onredelijk bedrag** | hoog | hoog | Aanvragen in week 1, zodat er tijd is voor een alternatief. Terugvaloptie: periodieke rapportage-export inlezen. Dat is minder elegant maar levert dezelfde tabellen. |
| **Het team blijft in Excel werken** | middel | hoog | De formuliereis, de zichtbare winst per domein, en een harde bevriezingsdatum. Als na fase 1 nog steeds in Excel wordt gewerkt, is dat een signaal dat het formulier niet deugt — dan het formulier aanpassen, niet de gebruiker. |
| **Onvolledige of tegenstrijdige brondata** | hoog | middel | `v_datakwaliteit` maakt het meetbaar in plaats van een onderbuikgevoel. Fase 0 is pas klaar als die view leeg is. |
| **AFAS blijkt beperkter dan gehoopt** | middel | middel | Uitvraag in week 1 (taak 0.7). Terugvaloptie: handmatige export met een vaste maandritme. |
| **Notion blijft als derde structuur bestaan** | middel | middel | Einddatum vastleggen bij besluit 6, exporteren in taak 0.51. |
| **Doorlooptijd loopt uit** | hoog | laag | De volgorde ligt vast, het tempo niet. Elke fase levert op zichzelf waarde; uitlopen kost geen eerder resultaat. |
| **Rick valt weg** | laag | hoog | Alles staat in deze repository: schema, migraties, plan, besluiten. Geen kennis in één hoofd. |
| **AVG-incident met kentekens of IBAN's** | laag | hoog | RLS staat dicht als standaard, rechten per domeinrol, wijzigingshistorie op persoonsgegevens, bewaartermijnen in taak 0.35. |

---

## 9. Wat er nog open staat

Deze punten blokkeren fase 0 niet, maar moeten wel een antwoord krijgen.

| Onderwerp | Vraag | Wanneer nodig | Taak |
|---|---|---|---|
| **Meldkamer** | Wat registreren ze, waar landt het, is het te ontsluiten? | vóór besluit 4 | 0.31 |
| **AFAS-scope** | Doet AFAS al facturatie en incasso, of alleen boekhouding? | vóór fase 3 | 0.7 |
| **Prognoses** | Bestaan die al per locatie? Zonder prognose geen signaallus. | vóór fase 2 | 0.32, 2.15 |
| **Budget** | Wat mag tooling per maand kosten? Bepaalt NocoDB-hosting en dashboardkeuze. | vóór fase 0 afsluit | 0.11 |
| **Eigenaarsportaal** | Krijgen eigenaren ooit eigen inzage? Zo ja, dan moeten daar RLS-policies voor komen. | jaar 2 | — |
| **Verwerkersovereenkomsten** | Met eigenaren, over de gegevens die wij namens hen verwerken. | vóór fase 3 | 0.34 |

---

*Bijbehorende documenten: [`Besluitenlogboek.md`](Besluitenlogboek.md) · [`Takenlijst_en_Mijlpalen.xlsx`](Takenlijst_en_Mijlpalen.xlsx) · [`../01_DATABASE/DATAMODEL.md`](../01_DATABASE/DATAMODEL.md) · [`../02_WERKMATERIAAL/Mijlpaal_Testrapporten.md`](../02_WERKMATERIAAL/Mijlpaal_Testrapporten.md)*
