# POCUS v intenzivní péči

**Interaktivní průvodce ultrazvukem u lůžka pro ošetřovatelskou praxi na ARO a JIP.**

👉 **Aplikace: [jirimatela.github.io/pocus-jip](https://jirimatela.github.io/pocus-jip/)**

**POCUS** (*Point-of-Care Ultrasound*, ultrazvuk u lůžka) je vyšetření, které provádí přímo ošetřující tým, aby rychle odpověděl na konkrétní otázku: je katétr v měchýři, je v žaludku reziduum, klouže pleura? Aplikace doprovází workshop o ošetřovatelských výkonech pod kontrolou ultrazvuku. Sestra klikne na oblast na schématu těla a uvidí, jak výkon provést, na co si dát pozor a jak vypadá normální a patologický ultrazvukový nález. Funguje na počítači, tabletu i telefonu, bez instalace a bez přihlášení.

## Co v aplikaci najdete

| Oblast | Výkony | Navíc |
|---|---|---|
| **Žaludek / výživa** | Ověření polohy nasogastrické sondy, gastroparéza, měření gastrického rezidua | Kalkulačka reziduálního objemu (GRV) |
| **Močový měchýř** | Ověření polohy močového katétru, měření objemu měchýře | Kalkulačka objemu měchýře |
| **Plíce a pleura** | Lung sliding, A-linie a B-linie, fluidothorax, pneumothorax | |
| **Hluboká žilní trombóza** | Kompresní vyšetření v. femoralis a v. poplitea | |
| **Periferní žíly** | Vyhledání žíly, kanylace pod ultrazvukem, ověření polohy katétru | |

U každé oblasti je:

- **Klinický postup pro sestry**: krok za krokem, s doporučenou sondou.
- **Varovný nález**: kdy okamžitě volat lékaře.
- **Ukázkové sonogramy a videa** z praxe. Kliknutím se snímek zvětší přes celou obrazovku.
- **Kalkulačka** tam, kde se něco měří (desetinná čísla lze psát s čárkou).

> **Upozornění:** Aplikace je výuková pomůcka, ne zdravotnický prostředek. Nenahrazuje odborné školení, klinický úsudek ani standardy pracoviště a není určena k rozhodování o konkrétním pacientovi. Kalkulačky dávají orientační hodnoty pro výuku. Ukázkové snímky jsou anonymizované. Aplikace neukládá ani neodesílá žádná zadaná data. Plné znění je v patičce aplikace.

---

## Pro správce obsahu

### Jak aplikaci měnit

**Přes agenta (doporučeno):** na [claude.ai/code](https://claude.ai/code) vyberte tento repozitář a napište, co chcete změnit, třeba:

- „U plic přidej tlačítko Pleurální výpotek, obrázek plice-5-vypotek.jpg"
- „U žaludku přepiš varování na: …"
- „Vrať poslední změnu"

Agent se řídí pravidly v `CLAUDE.md`: mění jen to, co je potřeba, a před uložením aplikaci vyzkouší. Po uložení ji GitHub ještě jednou proklikne v Chrome, Safari a Firefoxu na telefonu, tabletu i počítači. Web se aktualizuje za pár minut, a jen když je všechno v pořádku. Jinak zůstane online poslední funkční verze.

**Nové obrázky a videa:** pošlete je agentovi jako přílohu v chatu a napište, co na nich je (např. „tohle je žaludek s tekutinou"). Klidně i s hlavičkou přístroje: agent odřízne údaje o pacientovi a pracovišti, odstraní skrytá metadata, převede formát a snímek zařadí do aplikace. Originály se do repozitáře neukládají, jen hotové snímky. **Příloha může mít nejvýš 30 MB.** Video z ultrazvuku bývá větší, proto ho nejdřív zmenšete: exportujte ho z přístroje jako MP4, nebo ho otevřete v programu [HandBrake](https://handbrake.fr) (zdarma), zvolte předvolbu *Fast 720p30* a dejte *Start*. Ze stovek MB bude pár MB.

**Texty ručně:** všechny texty jsou v souboru `obsah.js` (na GitHubu ikona tužky).

### Jak se změny dostanou na web

Web se aktualizuje automaticky po každém uložení změn na GitHub (do větve `main`):

1. **Kontrola (asi 5 minut).** GitHub aplikaci proklikne ve třech prohlížečích: Chrome/Edge, Safari a Firefox. V každém ji vyzkouší na telefonu, tabletu i počítači. Ověří, že se otevřou všechny oblasti, zobrazí se snímky a videa, kalkulačky počítají správně a stránka se na telefonu nerozpadá. Zkontroluje také formát, název a velikost souborů a bezpečnost (viz níže).
2. **Zveřejnění.** Jen když kontrola projde. Když neprojde, nic se nezveřejní a sestrám zůstane online poslední funkční verze. U změny se na GitHubu objeví červený křížek a vlastník repozitáře dostane e-mail.

Každá změna se ukládá jako nová verze a kteroukoli lze vrátit.

### Bezpečnost a soukromí

**Web i repozitář jsou veřejné a všechno, co se jednou uloží, zůstane v historii.** Proto se citlivé údaje hlídají ještě *před* zveřejněním, a to dvakrát.

**Automatická kontrola** zastaví zveřejnění, když najde:
- metadata ve fotkách a videích (např. GPS polohu z telefonu, datum, typ přístroje);
- hesla, přístupové klíče a tokeny;
- rodná čísla v textech;
- soubory, které do repozitáře nepatří (`.dcm` z ultrazvuku, `.env`, klíče).

**Agent** se navíc řídí pravidly v `CLAUDE.md`:
- prohlédne každý snímek a video, jestli v obraze není vepsané jméno, datum narození, číslo pojištěnce nebo název nemocnice;
- nezveřejní popis případu, podle kterého by šlo pacienta poznat;
- nezveřejní interní dokumenty nemocnice a u převzatých snímků z internetu upozorní, že za jejich použití odpovídá autor aplikace;
- nepřidá žádné sledování ani formuláře;
- když něco citlivého unikne, okamžitě to ohlásí.

**Text vepsaný přímo do obrazu automatická kontrola nerozpozná.** Hlavičku s údaji proto odřezává agent, který si každý snímek prohlédne. Za obsah aplikace ale odpovídá autor. Výsledek si vždy prohlédněte.

### Struktura

- `obsah.js`: texty a seznam obrázků (mění se nejčastěji).
- `obrazky/`: snímky a videa.
- `index.html`, `app.js`, `styl.css`: vzhled a logika.
- `test/kontrola.js`: automatická kontrola. Nejdřív `npm ci && npx playwright install chromium firefox webkit`, pak `node test/kontrola.js`.
- `.github/workflows/`: kontrola a zveřejnění webu na GitHubu.
