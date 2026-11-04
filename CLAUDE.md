# POCUS v intenzivní péči – pravidla pro agenta

Výuková webová aplikace pro zdravotní sestry na JIP (ultrazvuk u lůžka). Autor obsahu je lékař, ne programátor: píše česky a krátce („přidej obrázek", „změň text u plic"). Odpovídej česky a jednoduše, bez programátorských termínů.

Web běží na GitHub Pages z větve `main`. Co se uloží do `main`, je do minuty veřejně online.

## Soubory

| Soubor | Co v něm je | Kdy ho měnit |
|---|---|---|
| `obsah.js` | Všechny texty, tlačítka, seznam obrázků u každého orgánu | Skoro vždy – většina požadavků je jen tady |
| `obrazky/` | Obrázky a videa (jpg, png, webp, mp4…) | Nové snímky |
| `index.html` | Rozvržení stránky, tělo (SVG) s klikacími oblastmi, kalkulačky | Nový orgán na těle, nová kalkulačka |
| `app.js` | Logika (zobrazení, galerie, kalkulačky) | Jen když nová funkce nejde udělat v obsahu |
| `styl.css` | Pár vlastních stylů navíc k Tailwindu | Zřídka |
| `test/kontrola.js` | Automatická kontrola | Když přidáš novou funkci, přidej do ní kontrolu |

## Pravidla

1. **Upravuj jen to místo, kterého se požadavek týká.** Nikdy nepřepisuj celý soubor ani aplikaci „načisto". Nic nepřejmenovávej a neměň vzhled, pokud o to autor výslovně nepožádá.
2. **Obsah patří do `obsah.js`, ne do `app.js` ani do `index.html`.** Texty v `protocol`, `warning` a `popis` smí obsahovat `<strong>` (vždy uzavřený). Klíče modulů (`gi`, `bladder`…) nepřejmenovávej – odkazuje na ně tělo v `index.html`.
3. **Obrázky jsou vždy samostatné soubory v `obrazky/`.** Nikdy je nevkládej do kódu jako base64 a nikdy negeneruj vymyšlené nebo kreslené „sonogramy". Když obrázek chybí, nech ho chybět: aplikace sama ukáže rámeček s názvem souboru.
   - Název souboru: **jen malá písmena** (i přípona), bez diakritiky a mezer, podle vzoru `<orgán>-<pořadí>-<popis>` (např. `plice-5-vypotek.jpg`). Web na GitHubu rozlišuje velká a malá písmena, `Plice.JPG` by se tam nenašel, i když na Macu funguje. Soubor s jiným názvem přejmenuj. Pole `soubor` v `obsah.js` píšeš bez přípony.
   - Fotky z iPhonu (`.heic`) prohlížeče neumí – převeď je na `.jpg` (např. `magick x.heic x.jpg`, `heif-convert`), jinak požádej autora o JPG. Video z iPhonu (`.mov`) ideálně převeď na `.mp4` (H.264), jinak se ve Windows nemusí přehrát.
   - Obrázky větší než ~1 MB zmenši (delší strana 1600 px stačí). Videa nad ~10 MB nedávej do repozitáře a řekni to autorovi.
4. **Ochrana dat pacientů.** Každý nový obrázek si prohlédni. Když je na něm jméno, rodné číslo, datum narození, číslo pojištěnce nebo jiný údaj o pacientovi, **neukládej ho** a požádej autora o oříznutou verzi. Repozitář i web jsou veřejné.
5. **Medicínský obsah je na autorovi.** Texty, vzorce a doporučení neměň z vlastní iniciativy. Když ti něco přijde odborně sporné, zeptej se.
6. **Nový orgán / modul:** přidej položku do `obsah.js` (povinné: `title`, `tlacitko {popisek, ikona}`, `barva`, `probe`, `protocol`, `warning`; volitelně `obrazkyNadpis`, `obrazky`, `kalkulacka`). Tlačítko dole se vytvoří samo. Klikací oblast na těle přidej do SVG v `index.html` jako `<g data-modul="klic">`. Ikony: názvy z lucide.dev/icons.
   - **Nová barva** (mimo amber/purple/cyan/rose/emerald): doplň ji do `BARVY` v `app.js` i v `test/kontrola.js` (celé názvy tříd vypsané, Tailwind z CDN jinak třídu nevygeneruje).
   - **Nová kalkulačka:** blok s `data-kalkulacka="nazev"` v `index.html`, výpočet ve funkci `prepocitej` v `app.js`, název do `KALKULACKY` a test se známým výsledkem do `TESTY_KALKULACEK` v `test/kontrola.js`.
7. **Po každé změně spusť kontrolu** a oprav chyby, než změnu uložíš:
   ```
   node test/kontrola.js
   ```
   Upozornění „chybí obrázek" nevadí, chyby ano. Když Playwright chybí, nainstaluj ho (`npm i -g playwright && npx playwright install chromium`).
8. **Ukládání:** jeden požadavek = jeden commit s krátkým českým popisem („Plíce: přidán obrázek pleurálního výpotku"). Ukládej rovnou do `main`. Autorovi napiš jednou větou, co se změnilo, a připomeň, že web se aktualizuje do minuty.
9. **Vrácení změny:** když autor napíše „vrať to", použij `git revert` na příslušný commit (historii nepřepisuj).

## Co aplikace nepotřebuje

Žádný build, žádné npm balíčky pro web, žádný framework. Tailwind a ikony se načítají z CDN v pevné verzi. Nepřidávej je jinak, než jak jsou.
