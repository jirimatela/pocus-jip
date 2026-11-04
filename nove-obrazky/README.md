# Nové obrázky

Sem nahrajte nové snímky a videa **tak, jak jsou**: s jakýmkoli názvem, v jakémkoli formátu (i HEIC a MOV z iPhonu, AVI z přístroje) a klidně i s hlavičkou přístroje.

Tento repozitář je soukromý. Nic z této složky se na web nedostane.

**Velká videa:** přes web GitHubu jde nahrát soubor do **25 MB**. Video z ultrazvuku bývá větší (AVI bez komprese mívá přes 100 MB). Pak:
- exportujte z přístroje rovnou MP4, pokud to umí, nebo
- video nejdřív zmenšete v programu [HandBrake](https://handbrake.fr) (zdarma, předvolba *Fast 720p30*). Hlavičku s údaji klidně nechte, odřízne ji agent.

Pak napište agentovi, třeba: *„Zpracuj nové obrázky. První je žaludek s tekutinou, druhý B-linie k plicím."*

Agent každý soubor prohlédne, odřízne údaje o pacientovi a pracovišti, odstraní metadata, převede ho do formátu, který funguje ve všech prohlížečích, zmenší ho, pojmenuje a přesune do `obrazky/`. Pak doplní tlačítko s popiskem a soubor odsud smaže. Na web se snímek dostane až po kontrole.
