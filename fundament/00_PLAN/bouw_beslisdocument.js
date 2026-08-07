const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, LevelFormat, convertInchesToTwip,
} = require('docx');
const fs = require('fs');

const BLAUW = '1F3864';
const GRIJS = '595959';
const LICHTBLAUW = 'DDEBF7';
const ACCENT = 'FFF2CC';

// -------------------------------------------------------------- hulpfuncties
const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 140, line: 276 },
  alignment: opts.align,
  children: [new TextRun({
    text, bold: opts.bold, italics: opts.italic, size: opts.size ?? 22,
    color: opts.color, font: 'Calibri',
  })],
});

const rijk = (delen, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 140, line: 276 },
  children: delen.map(d => new TextRun({
    text: d.t, bold: d.b, italics: d.i, size: 22, color: d.c, font: 'Calibri',
  })),
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 340, after: 160 },
  children: [new TextRun({ text, bold: true, size: 32, color: BLAUW, font: 'Calibri' })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 120 },
  children: [new TextRun({ text, bold: true, size: 26, color: BLAUW, font: 'Calibri' })],
});

const bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: 'opsomming', level },
  spacing: { after: 90, line: 276 },
  children: [new TextRun({ text, size: 22, font: 'Calibri' })],
});

const genummerd = (text) => new Paragraph({
  numbering: { reference: 'nummers', level: 0 },
  spacing: { after: 90, line: 276 },
  children: [new TextRun({ text, size: 22, font: 'Calibri' })],
});

// Kader voor een uitgelicht punt
const kader = (regels, kleur = ACCENT) => new Table({
  columnWidths: [9360],
  width: { size: 9360, type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    left: { style: BorderStyle.SINGLE, size: 12, color: BLAUW },
    right: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: kleur },
      margins: { top: 160, bottom: 160, left: 200, right: 200 },
      children: regels.map((r, i) => p(r.t ?? r, {
        bold: r.b, after: i === regels.length - 1 ? 0 : 110,
      })),
    })],
  })],
});

const tabel = (kop, rijen, breedtes) => new Table({
  columnWidths: breedtes,
  width: { size: breedtes.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    left: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    right: { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'D9D9D9' },
  },
  rows: [
    new TableRow({
      tableHeader: true,
      children: kop.map((t, i) => new TableCell({
        width: { size: breedtes[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: BLAUW },
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text: t, bold: true, size: 20, color: 'FFFFFF', font: 'Calibri' })],
        })],
      })),
    }),
    ...rijen.map((rij, ri) => new TableRow({
      children: rij.map((t, i) => new TableCell({
        width: { size: breedtes[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: ri % 2 ? 'F2F2F2' : 'FFFFFF' },
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text: t, size: 20, font: 'Calibri' })],
        })],
      })),
    })),
  ],
});

const streep = () => new Paragraph({
  spacing: { before: 100, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'BFBFBF' } },
  children: [],
});

// -------------------------------------------------------------- de inhoud
const inhoud = [];

// ---- Titelblad
inhoud.push(new Paragraph({ spacing: { after: 2200 }, children: [] }));
inhoud.push(new Paragraph({
  spacing: { after: 60 },
  children: [new TextRun({ text: 'PARKINGYOU', bold: true, size: 28, color: GRIJS, font: 'Calibri' })],
}));
inhoud.push(new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: 'Van losse Excel-sheets', bold: true, size: 56, color: BLAUW, font: 'Calibri' })],
}));
inhoud.push(new Paragraph({
  spacing: { after: 400 },
  children: [new TextRun({ text: 'naar één verbonden systeem', bold: true, size: 56, color: BLAUW, font: 'Calibri' })],
}));
inhoud.push(p('Beslisdocument voor directie en domeineigenaren', { size: 26, color: GRIJS }));
inhoud.push(streep());
inhoud.push(p('Augustus 2026 · versie 1.0 · ter besluitvorming', { size: 20, color: GRIJS }));
inhoud.push(new Paragraph({ spacing: { after: 2000 }, children: [] }));
inhoud.push(p('Dit document beschrijft wat er gaat veranderen, waarom, en wat het van u vraagt. Het bevat geen techniek. De technische uitwerking staat in het projectplan.', { italic: true, color: GRIJS, size: 21 }));
inhoud.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 1. Waar we nu staan
inhoud.push(h1('1. Waar we nu staan'));
inhoud.push(p('ParkingYou is sinds 2008 gegroeid naar 37 locaties en een landelijk team van parkeerhosts. Die groei is organisch gegaan: elke nieuwe collega bouwde voort op wat er lag. Dat heeft gewerkt, en het is nu de reden dat we vastlopen.'));
inhoud.push(p('Concreet ziet dat er zo uit:'));
inhoud.push(bullet('Excel is onze database. Abonneelijsten, omzetoverzichten en locatiegegevens leven in bestanden die iedereen kopieert en niemand meer durft weg te gooien.'));
inhoud.push(bullet('Rapportages maken we met de hand. Een maandronde naar de eigenaren kost dagen.'));
inhoud.push(bullet('Systemen praten niet met elkaar. SKIDATA weet niet wat AFAS weet, en Zendesk weet van geen van beide.'));
inhoud.push(bullet('Niemand kan in één handeling zien hoe één locatie ervoor staat: omzet, storingen, abonnees en campagnes samen.'));
inhoud.push(p('Dat laatste punt is het belangrijkste. Als een locatie minder gaat draaien, weten we dat pas laat, en daarna kost het dagen om uit te zoeken waarom.', { bold: true }));

// ---- 2. Wat we gaan doen
inhoud.push(h1('2. Wat we gaan doen'));
inhoud.push(p('Eén centrale database wordt de bron van waarheid voor alle bedrijfsgegevens. SharePoint blijft, maar alleen voor documenten. De scheiding is hard:'));
inhoud.push(kader([
  { t: 'Data hoort in de database. Documenten horen in de mappen.', b: true },
  'Een abonnee, een storing, een campagne: dat verandert, dus dat is data.',
  'Een contract, een rapport, een ontwerp: dat staat vast, dus dat is een document.',
  'Begin je een lijst in Excel? Dan hoort die lijst in de database.',
]));
inhoud.push(p('Niemand hoeft daarvoor in een database te werken. U werkt in formulieren en overzichten, zoals u nu in een Excel-bestand werkt — maar dan met iedereen tegelijk, zonder kopieën, en altijd actueel.'));

inhoud.push(h2('Wat het per domein oplevert'));
inhoud.push(tabel(
  ['Domein', 'Vandaag', 'Straks'],
  [
    ['Financiën', 'Maandrapportage kost dagen', 'Kost minuten, gaat vanzelf de deur uit'],
    ['Operatie', 'Storingen in mailboxen en hoofden', 'Historie per locatie én per apparaat: waar staat het het vaakst stil'],
    ['Klantenservice', '250 vragen per maand, alles handwerk', 'Standaardvragen automatisch, uitzonderingen met alle context erbij'],
    ['Marketing', 'Campagnes op gevoel', 'Campagne op basis van een signaal, met het resultaat teruggemeten'],
    ['Kennisbank', 'Kennis zit in mensen', 'Elk antwoord op één plek, met een houdbaarheidsdatum'],
  ],
  [1700, 3400, 4260],
));

// ---- 3. Hoe lang het duurt
inhoud.push(h1('3. Hoe lang het duurt'));
inhoud.push(p('Twaalf maanden, in zes fasen. Elke fase levert op zichzelf al iets bruikbaars op — er is geen moment waarop we een jaar wachten op resultaat.'));
inhoud.push(tabel(
  ['Fase', 'Wanneer', 'Wat er dan staat'],
  [
    ['0 · Fundament', 'week 1–4', 'Alle 37 locaties in het systeem. Nieuwe mappenstructuur in gebruik, oude drive dicht.'],
    ['1 · Abonnementen', 'week 4–8', 'Alle abonnees in één administratie. Einde van de losse Excel-bestanden.'],
    ['2 · Eerste koppeling', 'week 6–14', 'Eén parkeersysteem levert automatisch cijfers. Eerste dashboard per locatie.'],
    ['3 · Uitrollen', 'maand 4–7', 'Alle parkeersystemen en AFAS gekoppeld. Eigenaarsrapportages gaan automatisch.'],
    ['4 · Klantenservice', 'maand 6–9', 'Klantvragen komen in het systeem. Kennisbank gevuld.'],
    ['5 · Automatiseren', 'maand 9–12', 'Standaardvragen zonder mens. Signalering bij achterblijvende locaties.'],
  ],
  [1900, 1500, 5960],
));
inhoud.push(p('De volgorde ligt vast, het tempo niet. Een fase mag uitlopen; fasen overslaan niet. Een slimme assistent op een lege kennisbank werkt niet, en een dashboard zonder database ook niet.', { italic: true }));

inhoud.push(h2('Onderweg toetsen of het écht werkt'));
inhoud.push(p('Er zijn elf momenten waarop we niet afgaan op "het is af", maar het uittesten. Voor elk moment ligt een testscript klaar met genummerde stappen en een aftekenveld.'));
inhoud.push(p('Een voorbeeld, uit fase 1:'));
inhoud.push(kader([
  { t: 'Toets: werkt een kentekenwijziging echt?', b: true },
  '1. Wijzig een kenteken via het formulier — niet via een omweg.',
  '2. Controleer dat het nieuwe kenteken bij het abonnement staat.',
  '3. Controleer dat de wijziging is vastgelegd, met het oude én het nieuwe kenteken.',
  '4. Controleer dat het systeem wéét dat de wijziging nog niet bij de slagboom is aangekomen.',
  '5. Zet hem door en controleer dat de openstaande lijst leegloopt.',
], LICHTBLAUW));
inhoud.push(p('Stap 4 lijkt vreemd — we controleren dat iets nog níét is gebeurd. Dat is precies het punt. Als een kentekenwijziging niet wordt doorgezet, staat er iemand voor een dichte slagboom. We willen dat weten vóór de klant belt.'));
inhoud.push(rijk([
  { t: 'Wie tekent af: ', b: true },
  { t: 'de domeineigenaar, niet degene die het gebouwd heeft. Wie iets bouwt, is de slechtste tester ervan.' },
]));

inhoud.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 4. Wat we van u vragen
inhoud.push(h1('4. Wat we van u vragen'));
inhoud.push(h2('Voor de directie: vier besluiten'));
inhoud.push(tabel(
  ['Besluit', 'Voorstel'],
  [
    ['Waar leven onze gegevens?', 'Eén centrale database, met formulieren erbovenop. Wij zijn eigenaar van de data en zitten niet vast aan één leverancier.'],
    ['Wie is waarvan eigenaar?', 'Zeven domeineigenaren aanwijzen. Eigenaarschap is een rol, geen persoon — bij een personeelswissel verhuist de rol.'],
    ['Wanneer gaat de oude drive dicht?', 'Eén afgesproken datum, geen "we faseren uit". Alles blijft leesbaar; er komt alleen niets meer bij.'],
    ['Wat gebeurt er met Notion?', 'Uitfaseren met een einddatum. Anders krijgen we een derde plek waar dingen staan.'],
  ],
  [3000, 6360],
));
inhoud.push(p('Het derde besluit vraagt het meeste. Een drive op alleen-lezen zetten voelt hard. Maar zonder datum blijft iedereen in het oude werken, en dan hebben we over een jaar twee systemen in plaats van één.', { bold: true }));

inhoud.push(h2('Voor de domeineigenaren: twee uur per week'));
inhoud.push(p('U bouwt uw eigen domein mee op. Dat is geen extra werk bovenop uw baan, het is dezelfde informatie op een andere plek zetten — en daarna kost het u minder tijd dan nu.'));
inhoud.push(p('Wat het inhoudt:'));
inhoud.push(bullet('De gegevens van uw domein aanleveren en controleren.'));
inhoud.push(bullet('Meekijken bij het ontwerp van uw formulieren: wat mist, wat is overbodig.'));
inhoud.push(bullet('Zeggen wanneer iets niet werkt zoals u werkt.'));
inhoud.push(bullet('De toetsmomenten van uw domein doorlopen en aftekenen.'));
inhoud.push(p('Wat het níét inhoudt:'));
inhoud.push(bullet('Programmeren, of ook maar één technische term leren.'));
inhoud.push(bullet('Beslissen over techniek.'));
inhoud.push(bullet('Alles zelf invullen.'));
inhoud.push(kader([
  { t: 'Een belofte die erbij hoort', b: true },
  'Als iets in uw domein alleen lukt met een truc of een omweg, dan is het ontwerp fout — niet u. Meld het, dan passen we het formulier aan.',
]));
inhoud.push(p('Twee uur per week is de reservering voor de drukke weken. Gemiddeld over het jaar komt het neer op ongeveer drie kwartier.'));

// ---- 5. Wat er mis kan gaan
inhoud.push(h1('5. Wat er mis kan gaan'));
inhoud.push(p('Drie risico\'s zijn het bespreken waard. De rest staat in het projectplan.'));
inhoud.push(tabel(
  ['Risico', 'Wat we eraan doen'],
  [
    ['Een leverancier wil niet meewerken of vraagt een fors bedrag voor een koppeling',
     'Daarom vragen we het in week 1 en niet in maand drie. Dan is er tijd voor een alternatief. Er is een terugvaloptie die minder mooi is maar hetzelfde oplevert.'],
    ['Het team blijft in Excel werken',
     'Elk domein krijgt eerst iets zichtbaars terug vóórdat er iets gemigreerd wordt. En de oude drive gaat dicht op een datum. Blijft iemand toch in Excel, dan deugt het formulier niet — dat passen we aan.'],
    ['Onze huidige gegevens blijken onvolledig of tegenstrijdig',
     'Het systeem laat zelf zien wat er ontbreekt. Fase 0 is pas klaar als die lijst leeg is. Dat is oncomfortabel maar eerlijk: nu ontdekken is beter dan straks.'],
  ],
  [3000, 6360],
));

// ---- 6. Wat er al klaarligt
inhoud.push(h1('6. Wat er al klaarligt'));
inhoud.push(p('Dit is geen plan dat nog uitgewerkt moet worden. Het volgende is af en getest:'));
inhoud.push(bullet('Het volledige databaseontwerp, met alle regels die fouten tegenhouden.'));
inhoud.push(bullet('Een takenlijst van 175 stappen, met eigenaar en tijdsinschatting per stap.'));
inhoud.push(bullet('Elf testscripts om onderweg te toetsen of alles werkt.'));
inhoud.push(bullet('De brieven aan de vier leveranciers, klaar om te versturen.'));
inhoud.push(bullet('De invulsjablonen voor de 37 locaties en de abonnees.'));
inhoud.push(p('Wat er nog niet is gebeurd: er is nog niets aangezet. Dat is de eerste stap, zodra u akkoord bent.', { bold: true }));

// ---- 7. De eerste week
inhoud.push(h1('7. De eerste week'));
inhoud.push(p('Als dit wordt aangenomen, gebeurt er in week 1 dit:'));
inhoud.push(genummerd('De vier brieven naar SKIDATA, IP Parking, Scheidt & Bachmann en Aeroparker gaan de deur uit. Dit bepaalt de doorlooptijd van het hele project.'));
inhoud.push(genummerd('De AFAS-consultant krijgt twee vragen over wat er in onze licentie zit.'));
inhoud.push(genummerd('De zeven domeineigenaren worden aangewezen en krijgen een kick-off.'));
inhoud.push(genummerd('De database wordt opgezet en de mappenstructuur aangemaakt.'));
inhoud.push(genummerd('De datum waarop de oude drive dicht gaat, wordt vastgesteld en gedeeld.'));
inhoud.push(kader([
  { t: 'Punt 1 is het belangrijkste van dit hele document.', b: true },
  'Wij kunnen bouwen zo snel als nodig is. Waar we niet omheen kunnen, is de tijd die een leverancier neemt om te antwoorden. Elke week die we die brieven laten liggen, is een week die het project achteraan uitloopt.',
]));

inhoud.push(streep());
inhoud.push(p('Vragen of opmerkingen: Rick — rick@parkingyou.nl', { color: GRIJS, size: 20 }));
inhoud.push(p('Het volledige projectplan, het databaseontwerp en de testscripts zijn op verzoek beschikbaar.', { color: GRIJS, size: 20, italic: true }));

// -------------------------------------------------------------- document
const doc = new Document({
  creator: 'ParkingYou',
  title: 'ParkingYou — Beslisdocument fundament',
  description: 'Beslisdocument voor directie en domeineigenaren',
  numbering: {
    config: [
      {
        reference: 'opsomming',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.2) } } } },
          { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.6), hanging: convertInchesToTwip(0.2) } } } },
        ],
      },
      {
        reference: 'nummers',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } } },
        ],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1300, bottom: 1300, left: 1080, right: 1080 },
      },
    },
    children: inhoud,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync('/home/user/Parkingyou/fundament/00_PLAN/Beslisdocument_Team.docx', buf);
  console.log('Beslisdocument_Team.docx geschreven');
});
