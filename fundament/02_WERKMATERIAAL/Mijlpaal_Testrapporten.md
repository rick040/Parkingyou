# Mijlpaal-testrapporten

*Per mijlpaal een uitgeschreven testscript. Doorlopen, afvinken, ondertekenen.*

---

## Hoe je dit gebruikt

Een mijlpaal is niet gehaald omdat de taken zijn afgevinkt. Hij is gehaald als het testscript hieronder van boven naar beneden klopt.

**Regels:**

1. **De aftekenaar is niet de bouwer.** Bij een technische mijlpaal tekent de domeineigenaar af, niet Rick of Claude. Wie het gebouwd heeft, is de slechtste tester.
2. **Eén stap fout = mijlpaal niet gehaald.** Geen "grotendeels". Noteer wat er misging, los het op, en doorloop het hele script opnieuw.
3. **Test op echte data**, behalve waar het script uitdrukkelijk anders zegt.
4. **Vul de datum in.** Een afgetekend rapport zonder datum is geen bewijs.

De testomgeving (Supabase-branch `test`, taak 0.25) is er om te oefenen. De aftekening gebeurt op productie.

---

# FASE 0 — FUNDAMENT

## M0 · Besluiten genomen, kritiek pad gestart

**Wanneer:** einde week 1 · **Tekent af:** directie

Deze mijlpaal gaat niet over techniek maar over doorlooptijd. Als hij te laat is, schuift het hele project mee.

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Open het besluitenlogboek | Besluiten 1, 2, 3 en 6 hebben status *genomen*, met datum en naam | ☐ |
| 2 | Controleer de zeven domeineigenaren | Elke rol heeft een naam; elke naam weet het | ☐ |
| 3 | Query: `select naam, aanvraag_verstuurd_op from connector where bron in ('skidata','ip_parking','scheidt_bachmann','aeroparker');` | Vier regels, alle vier met een datum | ☐ |
| 4 | Controleer de verzonden mails | Vier aanvragen daadwerkelijk verstuurd, met een concrete vraag erin | ☐ |
| 5 | Is de AFAS-consultant benaderd? | Ja, met de twee vragen uit taak 0.7 | ☐ |
| 6 | Staat de nabelherinnering in de agenda? | Ja, op werkdag 10 na verzending | ☐ |
| 7 | Is de bevriezingsdatum van de oude drive afgesproken én gecommuniceerd? | Een datum, geen "binnenkort" | ☐ |

> **Als stap 3 of 4 faalt, is dit de enige mijlpaal waarbij doorgaan geen zin heeft.** Alles in fase 2 en 3 wacht hierop.

**Afgetekend door:** ______________________ **Datum:** ____________

---

## M1 · Registers live

**Wanneer:** einde week 3–4 · **Tekent af:** eigenaar Operatie (D2)

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Log in op NocoDB met je eigen account | Je ziet je eigen domein, niet dat van een ander | ☐ |
| 2 | Open het locatieregister | 37 locaties, met codes LOC-001 t/m LOC-037 | ☐ |
| 3 | Zoek drie willekeurige locaties op | Naam, adres, capaciteit en dienstverleningstype zijn gevuld | ☐ |
| 4 | Bekijk bij die drie de systeempartner | Voor elke locatie staat er één actieve partner | ☐ |
| 5 | Bekijk bij die drie de contractpartijen | Minimaal één partij, precies één daarvan gemarkeerd als primair contact | ☐ |
| 6 | Zoek een locatie op met méér dan één contractpartij | Alle partijen zichtbaar, met hun rol | ☐ |
| 7 | Query: `select * from v_datakwaliteit;` | Geen regels van de eerste vijf soorten bevindingen | ☐ |
| 8 | Query: `select dienstverleningstype, count(*) from locatie group by 1;` | Verdeling klopt met de werkelijkheid; het aantal advies-/onderhoudslocaties is bewust bepaald, niet per ongeluk leeg gelaten | ☐ |
| 9 | Wijzig een locatienaam en sla op | Wijziging zichtbaar; `select * from wijzigingslog where tabel='locatie' order by gewijzigd_op desc limit 1;` toont oude en nieuwe waarde | ☐ |
| 10 | Probeer een tweede primaire contactpartij toe te voegen op dezelfde locatie | **Wordt geweigerd** door de database | ☐ |

> Stap 10 is geen formaliteit. Als die wél lukt, is de index verkeerd aangelegd en komt de eigenaarsrapportage in fase 3 bij twee partijen tegelijk uit.

**Afgetekend door:** ______________________ **Datum:** ____________

---

## M2 · Documentlaag live, oude drive bevroren

**Wanneer:** einde week 4 · **Tekent af:** directie

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Open de SharePoint-teamsite | De negen hoofdmappen staan er, met de juiste nummering | ☐ |
| 2 | Controleer de diepte van drie willekeurige takken | Nergens dieper dan vier niveaus | ☐ |
| 3 | Open 06_LOCATIES | 37 locatiedossiers, elk met dezelfde vijf submappen | ☐ |
| 4 | Open 90_TEMPLATES | Eén versie per sjabloonsoort, geen dubbelingen | ☐ |
| 5 | Maak een nieuw document aan volgens de naamgevingsregel | Lukt; de naam voldoet aan `JJJJ-MM-DD_Onderwerp_LOC-XXX_v01` | ☐ |
| 6 | Log in als iemand uit Marketing en probeer te schrijven in 01_FINANCIEN | **Wordt geweigerd** | ☐ |
| 7 | Probeer een bestand toe te voegen aan de oude drive | **Wordt geweigerd** — alleen-lezen | ☐ |
| 8 | Zoek een willekeurig oud document op in de oude drive | Nog steeds vindbaar en leesbaar | ☐ |
| 9 | Is de Notion-export gemaakt en gearchiveerd? | Staat in 99_ARCHIEF/01_Notion_Export | ☐ |
| 10 | Hangt het spelregels-A4 zichtbaar op? | Ja, en iedereen heeft het gezien | ☐ |

**Afgetekend door:** ______________________ **Datum:** ____________

---

# FASE 1 — ABONNEMENTEN

## M3 · Abonnementen gemigreerd

**Wanneer:** einde week 7–8 · **Tekent af:** eigenaar Klantenservice (D3)

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Tel de regels in de oorspronkelijke Excel-bestanden, na ontdubbeling | Noteer het getal: __________ | ☐ |
| 2 | Query: `select count(*) from abonnement;` | Zelfde getal als stap 1 | ☐ |
| 3 | Kies tien abonnees willekeurig en vergelijk handmatig met de Excel | Naam, kenteken, locatie, prijs, startdatum en status kloppen alle tien | ☐ |
| 4 | Query: `select abonnement_status, count(*) from abonnement group by 1;` | Verdeling is plausibel; geen onverwachte berg 'aangevraagd' | ☐ |
| 5 | Query: `select * from v_datakwaliteit where bevinding like '%abonnement%';` | Leeg, of elke regel is verklaard en genoteerd | ☐ |
| 6 | Query: `select * from v_locatie_abonnement_ruimte where vrije_abonnementsplekken < 0;` | Geen regels — nergens meer abonnementen dan plekken | ☐ |
| 7 | Zoek een abonnee op naam in NocoDB | Gevonden binnen enkele seconden, met alle abonnementen van die klant | ☐ |
| 8 | Probeer een tweede actief abonnement aan te maken voor hetzelfde kenteken op dezelfde locatie | **Wordt geweigerd** | ☐ |
| 9 | Staan de Excel-bestanden op alleen-lezen en gearchiveerd? | Ja, met archiefdatum als prefix | ☐ |
| 10 | Vraag de klantenservice: waar zoek je nu een abonnee op? | Antwoord is NocoDB, niet Excel | ☐ |

> Stap 6 vindt de klassieke migratiefout: overboeking die in losse sheets onzichtbaar was.

**Afgetekend door:** ______________________ **Datum:** ____________

---

## M4 · Kentekenwijziging werkt end-to-end

**Wanneer:** einde week 8 · **Tekent af:** eigenaar Klantenservice (D3)

Dit is de belangrijkste test van fase 1. Kentekenwijziging is de meest voorkomende klantvraag en de eerste die geautomatiseerd wordt.

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Kies een testabonnement en noteer het huidige kenteken | Noteer: __________ | ☐ |
| 2 | Wijzig het kenteken via het NocoDB-formulier — niet via SQL | Formulier accepteert de wijziging | ☐ |
| 3 | Query: `select kenteken_huidig from abonnement where code = '<ABO-code>';` | Toont het nieuwe kenteken | ☐ |
| 4 | Query: `select * from kenteken_mutatie where abonnement_id = '<id>' order by gewijzigd_op desc limit 1;` | Eén nieuwe regel, met het oude én het nieuwe kenteken | ☐ |
| 5 | Controleer in die regel het veld `verwerkt_in_parkeersysteem` | Staat op **false** | ☐ |
| 6 | Query: `select * from v_werklijst_kentekenmutaties;` | De wijziging staat in de werklijst, met abonnee, locatie en systeempartner erbij | ☐ |
| 7 | Voer de wijziging handmatig door in het parkeersysteem en vink de regel af | `verwerkt_in_parkeersysteem` wordt true, `verwerkt_op` krijgt een tijdstip | ☐ |
| 8 | Query opnieuw: `select * from v_werklijst_kentekenmutaties;` | De regel is verdwenen | ☐ |
| 9 | Voer een kenteken in met streepjes én één zonder | Beide leiden tot dezelfde `kenteken_genormaliseerd` | ☐ |
| 10 | Query: `select * from wijzigingslog where tabel='abonnement' and veld='kenteken_huidig';` | De wijziging is ook in de audittrail terug te vinden | ☐ |

> Stap 5 lijkt vreemd — we controleren dat iets *niet* is gebeurd. Dat is precies het punt: de datalaag weet dat de wijziging nog niet bij de slagboom is aangekomen. Zonder dat onderscheid ontdek je een mislukte doorzetting pas als de klant belt.

**Afgetekend door:** ______________________ **Datum:** ____________

---

# FASE 2 — EERSTE KOPPELING

## M5 · Pilot-parkeersysteem levert data

**Wanneer:** week 12–14 · **Tekent af:** eigenaar Financiën (D1)

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Draai de import handmatig voor gisteren | Voltooit zonder fout | ☐ |
| 2 | Query: `select count(*), sum(bedrag_excl) from omzet_periode where datum = current_date - 1;` | Regels voor alle pilotlocaties | ☐ |
| 3 | Open het leveranciersportaal en vergelijk het dagtotaal per locatie | Verschil kleiner dan 1%, of verklaard en genoteerd | ☐ |
| 4 | Draai dezelfde import nóg een keer | Aantallen en bedragen zijn **onveranderd** — geen verdubbeling | ☐ |
| 5 | Query: `select * from koppeling_run order by gestart_op desc limit 5;` | Beide runs gelogd, met aantallen en `geslaagd = true` | ☐ |
| 6 | Vergelijk de maandtotalen van drie afgesloten maanden met het portaal | Aansluiting binnen 1% per maand | ☐ |
| 7 | Wacht 24 uur zonder iets te doen | De geplande run heeft vanzelf gedraaid | ☐ |
| 8 | Query: `select * from v_connector_gezondheid where naam = '<pilot>';` | Gezondheid: *in orde* | ☐ |
| 9 | Zet de koppeling bewust stuk (verkeerd wachtwoord) en draai opnieuw | Run wordt gelogd met `geslaagd = false` en een foutmelding; er komt een alarm | ☐ |
| 10 | Herstel de koppeling | Volgende run slaagt weer | ☐ |
| 11 | Controleer `connector.laatste_succesvolle_run` | Is bijgewerkt | ☐ |

> Stap 4 en stap 9 zijn de twee die er echt toe doen. Een koppeling die dubbel importeert of stil faalt, is erger dan geen koppeling: je vertrouwt cijfers die niet kloppen.

**Afgetekend door:** ______________________ **Datum:** ____________

---

## M6 · Dashboard per locatie

**Wanneer:** week 14 · **Tekent af:** eigenaar Financiën (D1) en eigenaar Operatie (D2) samen

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Open het dashboard voor één locatie | Omzet deze maand, bezetting, open storingen, actieve abonnementen en lopende campagnes staan op één scherm | ☐ |
| 2 | Vergelijk de omzet met de handmatige berekening van vorige maand | Komt overeen | ☐ |
| 3 | Controleer de systeempartner en de primaire contactpartij op het scherm | Kloppen met het register | ☐ |
| 4 | Open het overzicht van alle locaties | 37 regels, sorteerbaar op afwijking van prognose | ☐ |
| 5 | Query: `select locatie_code from v_locatie_dashboard where dienstverleningstype <> 'exploitatie' and omzet_deze_maand > 0;` | **Geen regels** — advieslocaties hebben geen omzet | ☐ |
| 6 | Query: `select locatie_code, prognose_tot_nu, prognose_hele_maand, dagen_met_data from v_locatie_dashboard limit 5;` | `prognose_tot_nu` is evenredig kleiner dan `prognose_hele_maand`, passend bij het aantal dagen | ☐ |
| 7 | Query: `select * from v_signaal_onderprestatie;` | Alleen exploitatielocaties; alleen bij minstens 7 dagen data | ☐ |
| 8 | Maak bij een locatie uit stap 7 handmatig een storing aan | De kolom `vervolgstap` verandert naar *storing open — mogelijke oorzaak bij Operatie* | ☐ |
| 9 | Zet de storing op opgelost | `vervolgstap` verandert weer | ☐ |
| 10 | Laat drie collega's het dashboard zonder uitleg openen | Ze vinden hun eigen locatie en begrijpen wat ze zien | ☐ |

> Stap 6 vangt de fout waar dit ontwerp op is aangepast: een maandprognose vergelijken met de omzet-tot-nu-toe geeft begin van de maand een enorme schijnbare afwijking. Als deze kolommen gelijk zijn, is de naar-rato-berekening stuk.
>
> Stap 10 is geen zachte stap. Een dashboard dat uitleg nodig heeft, wordt niet gebruikt.

**Afgetekend door:** ______________________ **Datum:** ____________

---

# FASE 3 — UITROLLEN

## M7 · Alle platformen en AFAS gekoppeld

**Wanneer:** maand 6–7 · **Tekent af:** eigenaar Financiën (D1)

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Query: alle exploitatielocaties zonder omzet in de laatste 7 dagen (zie onder) | **Nul regels** | ☐ |
| 2 | Query: `select * from v_connector_gezondheid where gezondheid <> 'in orde' and connector_status = 'actief';` | Nul regels | ☐ |
| 3 | Reconcilieer per platform één volledige maand tegen het leveranciersportaal | Aansluiting binnen 1% per platform | ☐ |
| 4 | Controleer een locatie die van systeempartner is gewisseld | Transacties van vóór en ná de wissel staan er allebei, aan de juiste partner toegewezen | ☐ |
| 5 | Query: `select bron, count(*) from omzet_periode where datum >= current_date - 7 group by 1;` | Alle vier de bronnen leveren | ☐ |
| 6 | Controleer of storingen uit de parkeersystemen binnenkomen | Nieuwe regels in `storing` met de juiste `bron` | ☐ |
| 7 | Controleer de AFAS-aansluiting over één maand | Facturen in de datalaag hebben een `afas_referentie`; totalen sluiten aan op het grootboek | ☐ |
| 8 | Query: `select count(*) from factuur where factuur_status = 'verzonden' and afas_referentie is null;` | Nul, of elke uitzondering is verklaard | ☐ |
| 9 | Controleer of storneringen automatisch binnenkomen | Regels in `sepa_incasso` met `gestorneerd = true` en een datum | ☐ |

**Query voor stap 1:**

```sql
select l.code, l.naam
from locatie l
where l.dienstverleningstype = 'exploitatie'
  and l.status = 'actief'
  and not exists (
    select 1 from omzet_periode o
    where o.locatie_id = l.id and o.datum >= current_date - 7
  );
```

**Afgetekend door:** ______________________ **Datum:** ____________

---

## M8 · Eigenaarsrapportages automatisch

**Wanneer:** maand 7 · **Tekent af:** directie

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Genereer de maandrapportages, met verzending uitgeschakeld | Eén PDF per exploitatielocatie | ☐ |
| 2 | Controleer de bestandsnaam | Volgt `JJJJ-MM_Eigenaarsrapport_LOC-XXX.pdf` | ☐ |
| 3 | Controleer de opslaglocatie | Staat in `01_FINANCIEN/01_Eigenaarsrapportages/JJJJ/JJJJ-MM/` én in het locatiedossier | ☐ |
| 4 | Open drie rapporten en controleer de cijfers tegen het dashboard | Komen overeen | ☐ |
| 5 | Laat een rapport nakijken door iemand die de oude handmatige versie maakte | Bevat alles wat de eigenaar gewend was, of het verschil is bewust | ☐ |
| 6 | Query: `select locatie_code, verzonden_aan_email from rapportage where jaar = ... and maand = ...;` | Ontvanger komt overeen met `v_locatie_primaire_contactpartij` | ☐ |
| 7 | Query: locaties zonder primaire contactpartij | Nul regels — anders komt er een rapport nergens aan | ☐ |
| 8 | Zet verzending aan voor één testlocatie naar een eigen adres | Mail komt aan, met de juiste bijlage | ☐ |
| 9 | Query: `select * from rapportage where verzonden_op is null and gegenereerd_op is not null;` | Alleen de rapporten die bewust nog niet verstuurd zijn | ☐ |
| 10 | Meet hoe lang de hele ronde duurde | Minuten, geen dagen | ☐ |

> Stap 5 is de belangrijkste. Een technisch correct rapport dat de eigenaar minder vertelt dan het oude, is een verslechtering.

**Afgetekend door:** ______________________ **Datum:** ____________

---

# FASE 4 — KLANTENSERVICE EN KENNISBANK

## M9 · Kanaal gekoppeld en kennisbank gevuld

**Wanneer:** maand 8–9 · **Tekent af:** eigenaar Klantenservice (D3)

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Stuur een testvraag via het klantenservicekanaal | Binnen enkele minuten een regel in `klantvraag` | ☐ |
| 2 | Controleer of locatie en abonnee automatisch zijn herkend | Beide gevuld waar dat kon | ☐ |
| 3 | Query: `select categorie, count(*) from klantvraag where ontvangen_op >= current_date - 30 group by 1 order by 2 desc;` | Verdeling is plausibel; geen berg 'onbekend' | ☐ |
| 4 | Stuur een testmelding via de intercom | Regel in `klantvraag` **en** in `storing`, aan elkaar gekoppeld | ☐ |
| 5 | Query: `select count(*) from v_kennisbank_bruikbaar;` | Minimaal 20 artikelen | ☐ |
| 6 | Controleer of de top 20 uit de nulmeting allemaal een artikel heeft | Alle 20 gedekt | ☐ |
| 7 | Open drie artikelen | Triggerwoorden, stappen en systeemactie zijn gevuld — geen losse proza | ☐ |
| 8 | Zet een artikel op `actueel` zonder herzieningsdatum | **Wordt geweigerd** door de database | ☐ |
| 9 | Zet de herzieningsdatum van een artikel in het verleden | Artikel verdwijnt uit `v_kennisbank_bruikbaar`, verschijnt in `v_kennisbank_onderhoud` | ☐ |
| 10 | Zoek in de kennisbank op een woord uit de tekst | Het juiste artikel komt boven | ☐ |
| 11 | Controleer of alle 37 locaties bijzonderheden hebben vastgelegd | 37 locatiespecifieke artikelen, of een bewuste uitzondering | ☐ |
| 12 | Laat een nieuwe collega een standaardvraag beantwoorden met alleen de kennisbank | Lukt zonder iemand te vragen | ☐ |

> Stap 8 en 9 samen zijn de garantie dat de bot in M10 nooit uit verouderde kennis put. Test ze allebei.

**Afgetekend door:** ______________________ **Datum:** ____________

---

# FASE 5 — AUTOMATISEREN

## M10 · AI-klantenservice live

**Wanneer:** maand 10–11 · **Tekent af:** eigenaar Klantenservice (D3) en directie samen

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Stuur de 20 vragen uit de vaste testset | Noteer per vraag: correct / fout / geëscaleerd | ☐ |
| 2 | Tel de correct afgehandelde vragen | **Minimaal 15 van de 20** | ☐ |
| 3 | Controleer de fout afgehandelde vragen | **Nul** vragen fout beantwoord zonder escalatie | ☐ |
| 4 | Controleer de geëscaleerde vragen | Elke escalatie bevat klant, locatie, abonnement en de gestelde vraag | ☐ |
| 5 | Stuur een vraag die goedkeuring vereist (bijv. opzegging) | Bot handelt **niet** zelf af, maar legt voor aan een mens | ☐ |
| 6 | Laat de bot een kenteken wijzigen | Regel in `kenteken_mutatie` met `gewijzigd_door = 'bot'` | ☐ |
| 7 | Query: `select afhandelwijze, count(*) from klantvraag where ontvangen_op >= current_date - 30 group by 1;` | Aandeel `automatisch` is meetbaar en stijgend | ☐ |
| 8 | Stuur een vraag waar geen artikel voor bestaat | Escalatie naar een mens, geen verzonnen antwoord | ☐ |
| 9 | Vraag drie klanten om feedback op een botantwoord | Geen klachten over toon of onjuistheid | ☐ |
| 10 | Controleer de afhandeltijd tegen de nulmeting uit taak 4.8 | Aantoonbaar gedaald | ☐ |

> Stap 3 en 8 wegen zwaarder dan stap 2. Een bot die te vaak escaleert is onhandig; een bot die met stelligheid iets verkeerds zegt, kost een klant.

**Afgetekend door:** ______________________ **Datum:** ____________

---

## M11 · Signaallus actief

**Wanneer:** maand 12 · **Tekent af:** directie

Deze test doe je bewust met een kunstmatige afwijking, zodat je hem kunt uitlokken in plaats van erop te wachten.

| # | Stap | Verwacht resultaat | ✓ |
|---|---|---|---|
| 1 | Kies een exploitatielocatie die nu normaal draait | Noteer de code: __________ | ☐ |
| 2 | Verhoog de prognose van deze maand kunstmatig met 40% | | ☐ |
| 3 | Query: `select * from v_signaal_onderprestatie where locatie_code = '<code>';` | De locatie verschijnt, met een negatieve afwijking | ☐ |
| 4 | Controleer de kolom `vervolgstap` | Klopt met de werkelijke situatie op die locatie | ☐ |
| 5 | Maak op die locatie een kritieke storing aan | `vervolgstap` verandert naar *kritieke storing open — eerst Operatie* | ☐ |
| 6 | Sluit de storing | `vervolgstap` gaat naar de externe check | ☐ |
| 7 | Laat de externe oorzaakcheck lopen | Rapporteert werkzaamheden of evenementen rond de coördinaten, of meldt dat er niets is gevonden | ☐ |
| 8 | Controleer of Marketing een campagne-aanleiding krijgt | Melding bevat locatie, afwijking, en wat er al is uitgesloten | ☐ |
| 9 | Maak een campagne aan vanuit die aanleiding | `campagne.uit_signaal` staat op true | ☐ |
| 10 | Laat de ROI-terugmeting draaien voor een afgeronde campagne | Regel in `campagne_resultaat` met omzet vóór/tijdens/ná en een ROI | ☐ |
| 11 | Controleer de ROI-berekening handmatig | Klopt met de omzetcijfers | ☐ |
| 12 | **Zet de prognose uit stap 2 terug** | Signaal verdwijnt | ☐ |
| 13 | Evalueer de drempels op een half jaar echte data | 10% en 7 dagen zijn nog passend, of ze worden bijgesteld en vastgelegd | ☐ |

> Vergeet stap 12 niet. Een testprognose die blijft staan, vervuilt de rapportage van die maand.

**Afgetekend door:** ______________________ **Datum:** ____________

---

## Overzicht

| Mijlpaal | Fase | Tekent af | Datum | Status |
|---|---|---|---|---|
| M0 Besluiten en kritiek pad | 0 | directie | | ☐ |
| M1 Registers live | 0 | D2 | | ☐ |
| M2 Documentlaag live | 0 | directie | | ☐ |
| M3 Abonnementen gemigreerd | 1 | D3 | | ☐ |
| M4 Kentekenwijziging end-to-end | 1 | D3 | | ☐ |
| M5 Pilotkoppeling levert data | 2 | D1 | | ☐ |
| M6 Dashboard per locatie | 2 | D1 + D2 | | ☐ |
| M7 Alle platformen + AFAS | 3 | D1 | | ☐ |
| M8 Rapportages automatisch | 3 | directie | | ☐ |
| M9 Kanaal + kennisbank | 4 | D3 | | ☐ |
| M10 AI-klantenservice | 5 | D3 + directie | | ☐ |
| M11 Signaallus | 5 | directie | | ☐ |
