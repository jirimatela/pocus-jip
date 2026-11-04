# POCUS v intenzivní péči

Výuková aplikace pro zdravotní sestry na ARO/JIP: ultrazvukem vedené ošetřovatelské výkony (žaludek, močový měchýř, plíce, DVT, periferní žíly) s postupem, varováním, ukázkovými snímky a kalkulačkami.

## Jak aplikaci měnit

**Přes agenta (doporučeno):** na [claude.ai/code](https://claude.ai/code) vyberte tento repozitář a napište, co chcete změnit, třeba:

- „U plic přidej tlačítko Pleurální výpotek, obrázek plice-5-vypotek.jpg"
- „U žaludku přepiš varování na: …"
- „Vrať poslední změnu"

Agent má pravidla v souboru `CLAUDE.md`: mění jen to, co je potřeba, a před uložením aplikaci zkontroluje. Web se aktualizuje asi do minuty.

**Obrázky ručně:** na GitHubu otevřete složku `obrazky` → *Add file* → *Upload files* a obrázek přetáhněte. Musí mít název podle seznamu v `obrazky/README.md`.

**Texty ručně:** všechny texty jsou v souboru `obsah.js` (na GitHubu ikona tužky).

## Důležité

- **Web i repozitář jsou veřejné.** Z obrázků vždy odstraňte jméno pacienta, datum narození a další údaje, které ultrazvuk vpisuje do obrazu.
- Každá změna se ukládá jako nová verze. Kteroukoli lze vrátit.

## Struktura

- `obsah.js` – texty a seznam obrázků (to, co se mění nejčastěji)
- `obrazky/` – snímky a videa
- `index.html`, `app.js`, `styl.css` – vzhled a logika
- `test/kontrola.js` – automatická kontrola (`node test/kontrola.js`)
