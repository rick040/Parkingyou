# Besluitenlogboek

*Elk besluit dat de structuur raakt, staat hier. Met datum, onderbouwing, en wat het alternatief was.*

Waarom dit bestaat: over twee jaar vraagt iemand waarom er niet voor Airtable is gekozen. Zonder dit logboek wordt dat een discussie; met dit logboek is het een verwijzing.

**Regel:** een besluit is pas genomen als het hier staat met een datum en een naam.

---

## Statussen

| Status | Betekenis |
|---|---|
| **genomen** | Definitief. Wijzigen kan, maar dan als nieuw besluit met verwijzing naar dit besluit. |
| **advies** | Voorstel ligt er, wacht op bevestiging. |
| **open** | Nog geen voorstel; er ontbreekt informatie. |

---

## B1 · Platform voor de datalaag

**Status:** genomen · **Datum:** ____________ · **Door:** ____________

**Besluit:** Supabase (PostgreSQL), regio eu-central-1.

**Alternatieven die zijn afgevallen:**

| Optie | Waarom niet |
|---|---|
| Airtable | Record- en API-limieten die bij dit koppelingsintensieve systeem gaan knellen. Kosten per seat bij zeven domeineigenaren. En je huurt je eigen bedrijfsdata. |
| Notion | Geen relationele database; koppelingen worden maatwerk. Wordt juist uitgefaseerd (B6). |
| "Nette Excel" | Kan niet wat dit plan vraagt: gelijktijdig werken zonder kopieën, relaties tussen tabellen, rechtenbeheer, wijzigingshistorie. |

**Onderbouwing:** Postgres is open source; de database is een bestand dat je meeneemt. Geen limieten, elke tool sluit erop aan, en er is al ervaring mee in andere projecten.

**Het bezwaar en hoe het is ondervangen:** zeven niet-technische domeineigenaren gaan niet in Postgres werken. Dat hoeft ook niet — zie B2. De database is de bron, niet de werkplek.

---

## B2 · Formulierlaag

**Status:** genomen · **Datum:** ____________ · **Door:** ____________

**Besluit:** NocoDB, rechtstreeks op de Supabase-database.

**Onderbouwing:** dit is het antwoord op het bezwaar bij B1. NocoDB is open source, draait op een bestaande Postgres-database, en biedt formulieren, lijstweergaven en rollen die voor de gebruiker niet van Airtable te onderscheiden zijn.

Het verschil met Airtable: als NocoDB morgen wegvalt, staat de data er nog. De formulierlaag is inwisselbaar, de data blijft.

**Wat het kost:** ongeveer een halve dag extra opzetwerk in fase 0 (taken 0.26–0.30).

**Aandachtspunt:** NocoDB verbindt met een databaseconnectie, niet met een ingelogde gebruiker. Rechten lopen daarom via Postgres-rollen per domein, niet via Row Level Security. Zie migratie 0011.

**Alternatief overwogen:** Baserow. Vergelijkbaar en ook open source. NocoDB is gekozen om de directe koppeling op een bestaande Postgres-database; bij Baserow is dat minder vanzelfsprekend. Dit besluit is goedkoop terug te draaien zolang niemand er nog in werkt.

---

## B3 · Automatiseringslaag

**Status:** advies — te bevestigen · **Datum:** ____________ · **Door:** ____________

**Advies:** Supabase Edge Functions met `pg_cron` voor de koppelingen. Make of n8n alleen voor flows waar een mens tussen zit.

**Waarom dit afwijkt van de blauwdruk:** die noemt Make, n8n of Power Automate. Dat advies past bij een organisatie waar een mens de koppelingen klikt. Nu Claude Code de bouwer is, is code in deze repository versioneerbaar, testbaar, en zonder maandelijkse licentie per scenario.

**Waar middleware wél de juiste keuze blijft:** goedkeuringsmails, notificaties naar hosts, escalaties. Daar is de visuele bouwer het punt, omdat een niet-technische collega de flow moet kunnen aanpassen.

**Wanneer dit definitief moet zijn:** fase 2. Tot die tijd verandert er niets aan de rest van het plan.

**Risico:** als Rick wegvalt, is code lastiger over te dragen dan een Make-scenario. Ondervangen door alles in deze repository te zetten, met uitleg.

---

## B4 · Klantenservice-kanaal

**Status:** OPEN · **Blokkeert:** fase 4

**De vraag:** wordt Zendesk het ene punt waar mail, telefoon, socials én meldkamer samenkomen, of blijft het alleen mail?

**Wat er ontbreekt om te kunnen beslissen:** wat de meldkamer precies doet, wat ze registreren, en waar die meldingen nu landen. Dit is de meest verborgen datastroom van het bedrijf — een intercommelding bij een dichte slagboom is tegelijk een klantvraag en een storingssignaal.

**Uitzoekwerk:** taak 0.31, eigenaar D2, geschat 4 uur.

**Wat er al vaststaat:** Zendesk bestaat en heeft een bruikbare API. De datalaag is voorbereid: `klantvraag` heeft een `kanaal`-veld met alle vier de kanalen, en een `storing_id` om de intercomstroom aan Operatie te koppelen.

**Deadline:** dit besluit moet genomen zijn vóór fase 4 begint (ongeveer maand 6).

---

## B5 · Boekhouding

**Status:** advies — scope opvragen · **Datum:** ____________ · **Door:** ____________

**Advies:** AFAS blijft bron van waarheid voor grootboek, facturen en btw. De datalaag houdt de operationele abonnementenadministratie bij en levert aan AFAS.

**Waarom dit principe zwaarder weegt dan het lijkt:** twee systemen die allebei denken dat ze de facturatie beheren, is de klassieke fout. Die kost je een jaar later een reconciliatieprobleem dat niemand meer kan ontwarren.

**Wat nog opgevraagd moet worden** (taak 0.7, bij de AFAS-consultant):

1. Doen we facturatie en incasso al in AFAS, of alleen boekhouding?
2. Welke connectoren zitten in onze licentie?

**Hoe het schema hierop is voorbereid:** `factuur.afas_referentie` is de aansluiting. Zolang dat veld leeg is, is de factuur nog niet in de boekhouding geland — dat is meteen de controlevraag.

**Terugvaloptie als de licentie beperkt blijkt:** handmatige export met een vast maandritme. Minder elegant, zelfde uitkomst.

---

## B6 · Documentlaag

**Status:** advies · **Datum:** ____________ · **Door:** ____________

**Advies:** SharePoint-teamsite, niet een persoonlijke OneDrive. Notion uitfaseren met een afgesproken einddatum.

**Waarom een teamsite en geen OneDrive:** eigenaarschap ligt bij de organisatie in plaats van bij een persoon, en rechten zijn per hoofdmap instelbaar. Voor het dagelijks werk voelt het identiek.

**Waarom Notion eruit moet:** er staat nu materiaal in (PY Signing, Locaties, Issues, Campagnes) dat overlapt met wat de datalaag gaat doen. Zonder einddatum ontstaat een derde parallelle structuur naast SharePoint en Supabase — precies het probleem dat dit project oplost.

**Wat er nog bij dit besluit hoort:** een datum. Niet "we faseren uit". Exporteren gebeurt in taak 0.51; het bruikbare gaat naar de datalaag, de rest naar `99_ARCHIEF/01_Notion_Export/`.

---

## B7 · ID-formaat

**Status:** genomen · **Datum:** ____________ · **Door:** ____________

**Besluit:** `LOC-014`, niet `PY-LOC-014`.

**Onderbouwing:** het Data Framework v0.1 gebruikte de lange vorm, alle latere documenten de korte. De mappenstructuur is al met de korte vorm uitgeschreven. Kortste vorm wint; het `PY`-voorvoegsel voegt niets toe binnen een systeem dat volledig van ParkingYou is.

**Gevolg:** de codes worden door de database gegenereerd en kunnen dus niet handmatig afwijken. Zie `DATAMODEL.md` voor de volledige lijst prefixen.

---

## Openstaand — nog geen besluit nodig

| Onderwerp | Wanneer relevant |
|---|---|
| Eigenaarsportaal: krijgen eigenaren eigen inzage? | jaar 2 — vergt RLS-policies die er nu bewust niet zijn |
| Social planningtool (Buffer of alternatief) | fase 3, als de contentplanning gaat knellen |
| Dashboardtool bovenop de views (Metabase, Power BI, of eigen bouw) | fase 2, taak 2.18 |
| Bewaartermijn van de wijzigingslog | jaar 2, als het volume dat afdwingt |

---

## Hoe je een besluit wijzigt

Je wijzigt een genomen besluit niet. Je neemt een nieuw besluit dat ernaar verwijst:

> **B8 · Formulierlaag (vervangt B2)**
> Status: genomen · Datum: … · Door: …
> Besluit: overstap van NocoDB naar …
> Aanleiding: …

Zo blijft zichtbaar wat er is veranderd en waarom — en dat is de hele reden dat dit logboek bestaat.
