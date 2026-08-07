# Aanvraagbrief koppelmogelijkheden — sjabloon

*Voor SKIDATA, IP Parking, Scheidt & Bachmann en Aeroparker. Taak 0.2 t/m 0.6.*

---

## Waarom dit sjabloon bestaat

Deze vier brieven bepalen de doorlooptijd van het hele project. Een vage vraag levert een vaag antwoord en drie weken vertraging. Daarom staan hieronder concrete vragen die met ja of nee te beantwoorden zijn.

**Verstuur alle vier in dezelfde week.** Je wilt de antwoorden naast elkaar kunnen leggen om te kiezen welk platform de pilot wordt.

**Zet in je agenda:** geen antwoord na tien werkdagen betekent bellen, niet nogmaals mailen.

---

## De brief

> **Onderwerp:** ParkingYou — vraag over koppelmogelijkheden [SYSTEEMNAAM]
>
> Beste [NAAM],
>
> ParkingYou exploiteert 37 parkeerlocaties, waarvan er [AANTAL] draaien op [SYSTEEMNAAM]. Wij richten op dit moment een centrale administratie in waarin omzet, bezetting en storingen per locatie samenkomen.
>
> Om dat te laten werken, willen we de gegevens uit [SYSTEEMNAAM] geautomatiseerd binnenhalen in plaats van handmatig over te nemen. Ik heb daarvoor een aantal concrete vragen.
>
> **1. Beschikbaarheid**
> - Beschikt [SYSTEEMNAAM] over een API waarmee wij transactie- en bezettingsgegevens kunnen ophalen?
> - Zo nee: is er een geautomatiseerde rapportage-export (bijvoorbeeld een dagelijkse CSV naar een SFTP-locatie of mailbox)?
> - Is er documentatie die u kunt delen?
>
> **2. Inhoud**
> Wij zoeken per locatie en per dag:
> - omzet, uitgesplitst naar kort parkeren, abonnementen en reserveringen
> - aantal inritten en uitritten, en de bezettingsgraad
> - storings- en statusmeldingen van de installaties
> - de identificatie die u voor onze locaties gebruikt, zodat wij die aan onze eigen locatiecodes kunnen koppelen
>
> Welke van deze gegevens zijn beschikbaar, en in welke vorm?
>
> **3. Kentekens**
> Kunnen wij via de koppeling een kenteken op een abonnement wijzigen? Dit is voor ons de meest voorkomende klantmutatie, en handmatig doorzetten is de grootste foutbron in ons huidige proces.
>
> **4. Voorwaarden**
> - Zitten deze koppelmogelijkheden in ons huidige contract, of zijn het aanvullende diensten?
> - Wat zijn de eenmalige en terugkerende kosten?
> - Welke doorlooptijd moeten wij rekenen vanaf akkoord tot werkende testtoegang?
> - Is er een testomgeving beschikbaar?
>
> **5. Techniek**
> - Welke authenticatiemethode wordt gebruikt?
> - Zijn er limieten op het aantal bevragingen?
> - Hoe ver terug is historische data op te halen? Wij zoeken minimaal twaalf maanden.
>
> Wij zouden uw reactie graag binnen twee weken ontvangen, zodat we onze planning kunnen vaststellen. Bellen mag uiteraard ook — [TELEFOONNUMMER].
>
> Met vriendelijke groet,
>
> [NAAM]
> ParkingYou

---

## Na verzending

Leg vast in de Connector Registry:

```sql
update connector
   set aanvraag_verstuurd_op = current_date,
       contactpersoon        = '[naam]',
       connector_status      = 'te_onderzoeken'
 where naam = '[SKIDATA / IP Parking / Scheidt & Bachmann / Aeroparker]';
```

## Na antwoord

```sql
update connector
   set aanvraag_antwoord_op = current_date,
       koppeltype           = 'api',        -- of 'export'
       documentatie_link    = '[link of pad in SharePoint]',
       connector_status     = 'te_koppelen',
       sync_frequentie      = 'dagelijks 06:00'
 where naam = '[...]';
```

Zet de documentatie zelf in `02_OPERATIE/02_Systeempartners/[LEVERANCIER]/`.

---

## Het antwoord beoordelen

Bij het kiezen van het pilotplatform (taak 2.1) wegen deze drie het zwaarst, in deze volgorde:

1. **Aantal locaties op het platform.** De pilot moet zoveel mogelijk dekking geven.
2. **API boven export.** Een export werkt ook, maar een API maakt de kentekenmutatie uit vraag 3 mogelijk — en dat is de eerste automatisering die echt tijd bespaart.
3. **Doorlooptijd tot testtoegang.** Een platform dat pas over drie maanden een testomgeving heeft, is geen pilot.

Kosten wegen bewust minder zwaar bij de pilotkeuze. Je koppelt uiteindelijk alle vier; de vraag is alleen welke eerst.

---

## Vergelijkbare uitvraag: AFAS

Voor de AFAS-consultant (taak 0.7) volstaan twee vragen, maar ze moeten scherp zijn:

> 1. Verzorgt AFAS in onze inrichting de facturatie en incasso, of alleen de boekhouding?
> 2. Welke connectoren zijn in onze licentie beschikbaar, en wat kost het om daar iets aan toe te voegen?
>
> Achtergrond: wij bouwen een operationele abonnementenadministratie die facturen aanlevert aan AFAS. AFAS blijft bij ons de bron van waarheid voor het grootboek — we willen uitdrukkelijk voorkomen dat twee systemen allebei de facturatie beheren.

Die laatste zin is er niet voor de beleefdheid. Hij voorkomt dat de consultant een oplossing voorstelt waarin AFAS de operationele administratie overneemt.
