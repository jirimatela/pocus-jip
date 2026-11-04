# Obrázky

Hotové, anonymizované snímky a krátká videa. **Nové posílejte agentovi jako přílohu v chatu**: odřízne údaje o pacientovi, převede formát, pojmenuje je a uloží sem.

Ručně (bez agenta): přípona může být `.jpg`, `.png`, `.webp`, `.gif`, u videa `.mp4` nebo `.webm`. Aplikace ji pozná sama. Název **malými písmeny**, bez diakritiky a mezer.

Fotky a videa z iPhonu (`.heic`, `.mov`) se na počítačích s Windows nezobrazí – převeďte je na `.jpg` / `.mp4`, nebo je dejte agentovi, převede je sám.

**Před nahráním z obrázku odstraňte údaje o pacientovi** (jméno, datum narození, číslo pojištěnce…). Stačí oříznout.

| Orgán | Názvy souborů |
|---|---|
| Žaludek | `gi-1-prazdny`, `gi-2-tekutina`, `gi-3-jidlo`, `gi-4-mereni-csa`, `gi-5-video`, `gi-6-sonda` |
| Měchýř | `mechyr-1-pricny`, `mechyr-2-podelny`, `mechyr-3-balonek` |
| Plíce | `plice-1-normalni`, `plice-2-b-linie`, `plice-3-fluidothorax`, `plice-4-pneumothorax` |
| DVT | `dvt-1-normalni`, `dvt-2-mickey-mouse`, `dvt-3-trombus-vji` |
| PVK | `pvk-1-anatomie`, `pvk-2-zila`, `pvk-3-kanylace`, `pvk-4-flush-test` |

Příklad: obrázek prázdného žaludku = `gi-1-prazdny.jpg`.

Chybějící obrázek se v aplikaci ukáže jako rámeček s názvem, který tam patří. Jiný počet obrázků, nová tlačítka nebo popisky se mění v `obsah.js` (nebo řekněte agentovi).
