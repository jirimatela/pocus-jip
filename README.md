# POCUS v intenzivní péči

**Interaktivní průvodce ultrazvukem u lůžka pro zdravotní sestry na ARO a JIP.**

👉 **Aplikace: [jirimatela.github.io/pocus-jip](https://jirimatela.github.io/pocus-jip/)**

Aplikace doprovází workshop o ošetřovatelských výkonech pod kontrolou ultrazvuku (POCUS, *point-of-care ultrasound*). Sestra klikne na oblast na schématu těla a uvidí, jak výkon provést, na co si dát pozor a jak vypadá normální a patologický ultrazvukový nález. Funguje na počítači, tabletu i telefonu, bez instalace a bez přihlášení.

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

> Aplikace slouží k výuce. Nenahrazuje klinický úsudek ani místní standardy pracoviště.

---

## Pro správce obsahu

### Jak aplikaci měnit

**Přes agenta (doporučeno):** na [claude.ai/code](https://claude.ai/code) vyberte tento repozitář a napište, co chcete změnit, třeba:

- „U plic přidej tlačítko Pleurální výpotek, obrázek plice-5-vypotek.jpg"
- „U žaludku přepiš varování na: …"
- „Vrať poslední změnu"

Agent se řídí pravidly v `CLAUDE.md`: mění jen to, co je potřeba, a před uložením aplikaci vyzkouší. Po uložení ji GitHub ještě jednou proklikne v Chrome, Safari a Firefoxu na telefonu, tabletu i počítači. Web se aktualizuje za pár minut, a jen když je všechno v pořádku. Jinak zůstane online poslední funkční verze.

**Obrázky ručně:** na GitHubu otevřete složku `obrazky` → *Add file* → *Upload files* a obrázek přetáhněte. Musí mít název podle seznamu v [`obrazky/README.md`](obrazky/README.md).

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
- nezveřejní interní dokumenty nemocnice ani cizí obrázky bez licence;
- nepřidá žádné sledování ani formuláře;
- když něco citlivého unikne, okamžitě to ohlásí.

**Text vepsaný přímo do obrazu stroj spolehlivě nerozpozná.** Proto: **z každého snímku před nahráním odřízněte lištu s údaji o pacientovi.**

### Struktura

- `obsah.js`: texty a seznam obrázků (mění se nejčastěji).
- `obrazky/`: snímky a videa.
- `index.html`, `app.js`, `styl.css`: vzhled a logika.
- `test/kontrola.js`: automatická kontrola. Nejdřív `npm ci && npx playwright install chromium firefox webkit`, pak `node test/kontrola.js`.
- `.github/workflows/`: kontrola a zveřejnění webu na GitHubu.
