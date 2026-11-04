# Obrázky

Sem patří ultrazvukové snímky a krátká videa. Přípona může být `.jpg`, `.png`, `.webp`, `.gif`, u videa `.mp4` nebo `.webm`. Aplikace ji pozná sama. Název **malými písmeny**, bez diakritiky a mezer.

Fotky a videa z iPhonu (`.heic`, `.mov`) se na počítačích s Windows nezobrazí – převeďte je na `.jpg` / `.mp4`, nebo je dejte agentovi, převede je sám.

**Před nahráním z obrázku odstraňte údaje o pacientovi** (jméno, datum narození, číslo pojištěnce…). Stačí oříznout.

| Orgán | Názvy souborů |
|---|---|
| Žaludek | `gi-1-prazdny`, `gi-2-tekutina`, `gi-3-jidlo`, `gi-4-sonda`, `gi-5-video` |
| Měchýř | `mechyr-1-pricny`, `mechyr-2-podelny`, `mechyr-3-balonek` |
| Plíce | `plice-1-a-linie`, `plice-2-b-linie`, `plice-3-fluidothorax`, `plice-4-pneumothorax` |
| DVT | `dvt-1-normalni`, `dvt-2-trombus` |
| PVK | `pvk-1-zila`, `pvk-2-kanylace`, `pvk-3-flush-test` |

Příklad: obrázek prázdného žaludku = `gi-1-prazdny.jpg`.

Chybějící obrázek se v aplikaci ukáže jako rámeček s názvem, který tam patří. Jiný počet obrázků, nová tlačítka nebo popisky se mění v `obsah.js` (nebo řekněte agentovi).
