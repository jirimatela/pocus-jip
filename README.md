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

### Důležité

- **Web i repozitář jsou veřejné.** Z obrázků vždy odstraňte jméno pacienta, datum narození a další údaje, které ultrazvuk vpisuje do obrazu.
- Každá změna se ukládá jako nová verze a kteroukoli lze vrátit.

### Struktura

- `obsah.js`: texty a seznam obrázků (mění se nejčastěji).
- `obrazky/`: snímky a videa.
- `index.html`, `app.js`, `styl.css`: vzhled a logika.
- `test/kontrola.js`: automatická kontrola. Nejdřív `npm ci && npx playwright install chromium firefox webkit`, pak `node test/kontrola.js`.
- `.github/workflows/`: kontrola a zveřejnění webu na GitHubu.
