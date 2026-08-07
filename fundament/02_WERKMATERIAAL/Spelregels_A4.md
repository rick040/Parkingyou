# De spelregels

*Eén A4. Ophangen. Taak 0.52.*

---

## 1. Data in de database, documenten in de mappen

Begin je een lijst in Excel? **Stop.** Dat is een tabel in de database.

Een contract, een rapport, een ontwerp — dat is een document en gaat naar SharePoint.
Een abonnee, een storing, een campagne — dat is data en gaat naar de datalaag.

Twijfel? Vraag jezelf af of het verandert. Verandert het: database.

## 2. Eén origineel, nul kopieën

Deel een link, nooit een bijlage.
Sjablonen komen altijd uit `90_TEMPLATES` — openen, opslaan-als in de doelmap, klaar.
Kopieer een sjabloon nooit naar je eigen map.

## 3. Nieuwe bestanden volgen de naamgeving

| Regel | Vorm | Voorbeeld |
|---|---|---|
| Datum eerst, als relevant | `JJJJ-MM-DD_` | `2026-08-07_Eigenaarsrapport_LOC-014.pdf` |
| Locatiecode voluit | `LOC-XXX` | `LOC-007_Plattegrond_Parkeerdek.pdf` |
| Versies expliciet | `_v01`, `_v02`, `_DEF` | `Campagnebrief_CAM-0012_v03.docx` |
| Underscores, geen spaties | `Woorden_Met_Underscores` | niet: `kopie van rapport rick (2) FINAL.xlsx` |

Zonder uitzondering. De automatisering leunt hierop.

## 4. Klaar of achterhaald? Archief

De werkstructuur bevat alleen wat actueel is.
Archiveren is één sleepbeweging naar `99_ARCHIEF`, met archiefdatum als prefix: `2026-08_naam`.

**Twijfel = archief.** Niets verwijderen in het eerste jaar.

## 5. Eén schoonmaakdag per jaar

Elk domein loopt zijn eigen gebied en het archief na.
In de agenda. Elk jaar. Heilig.

---

## En voor de datalaag

**6. Elke databron staat in de Connector Registry vóór gebruik.**
Geen enkele nieuwe koppeling, export of tool zonder eerst een regel daar. Anders weten we over twee jaar weer niet wat er allemaal loopt.

**7. Handmatig is altijd tijdelijk.**
Doe je iets met de hand? Leg vast waaróm het nog handmatig is. Dat is geen bureaucratie — het is de lijst waar de volgende automatisering uit komt.

**8. Niets wordt verwijderd, alles krijgt een status.**
Een opgezegd abonnement verhuist niet naar een andere lijst; het krijgt de status *opgezegd* en blijft staan. Zo ontstaat vanzelf de historie voor prognoses en analyses.

---

## De drie vragen bij iets nieuws

Bij elke nieuwe tool, elk nieuw proces, elke nieuwe map:

1. **Waar leeft de data — in de database?** Zo nee: waarom niet?
2. **Wie is de eigenaar, en wat is de levenscyclus?**
3. **Kan een machine erbij zonder maatwerk aan de bron?**

Drie keer ja: het past. Eén keer nee: eerst uitzoeken waarom.

---

## Wie beslist wat

| Gebied | Eigenaar |
|---|---|
| Registers, 00_ORGANISATIE | Directie |
| 01_FINANCIEN | Financiën |
| 02_OPERATIE, 06_LOCATIES | Operatie |
| 03_KLANTENSERVICE, 05_KENNISBANK | Klantenservice |
| 04_MARKETING | Marketing |
| 90_TEMPLATES | per domein |

**Eigenaarschap is een rol, geen persoon.** Bij een personeelswissel verhuist de rol, niet de chaos.

De eigenaar is de enige die de indeling van zijn gebied mag wijzigen. Iedereen mag er wél in werken.
