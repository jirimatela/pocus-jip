#!/usr/bin/env node
/*
 * Kontrola aplikace: otevře index.html v prohlížeči, proklikne všechny moduly
 * a obrázky a ověří, že nic nepadá.
 *
 *   node test/kontrola.js
 *
 * Potřebuje Playwright (require('playwright')). Jiný Chromium: PW_CHROMIUM=/cesta/k/chrome
 * Návratový kód 0 = v pořádku, 1 = chyba. Chybějící obrázky jsou jen upozornění.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const KOREN = path.resolve(__dirname, "..");
const PRIPONY = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov"];
const BARVY = ["amber", "purple", "cyan", "rose", "emerald"];
const KALKULACKY = ["grv", "mechyr"];

const chyby = [];
const upozorneni = [];

// 1) Obsah: načtení obsah.js a kontrola povinných polí
const sandbox = { window: {} };
try {
    vm.runInNewContext(fs.readFileSync(path.join(KOREN, "obsah.js"), "utf8"), sandbox);
} catch (e) {
    console.error("CHYBA: obsah.js nejde načíst (překlep v závorkách nebo uvozovkách?):\n  " + e.message);
    process.exit(1);
}
const OBSAH = sandbox.window.POCUS;
if (!OBSAH || !OBSAH.moduly) {
    console.error("CHYBA: obsah.js musí nastavit window.POCUS = { slozkaObrazku, moduly }");
    process.exit(1);
}

const souboryVeSlozce = fs.existsSync(path.join(KOREN, OBSAH.slozkaObrazku))
    ? fs.readdirSync(path.join(KOREN, OBSAH.slozkaObrazku)) : [];
const pouzite = new Set();

for (const [klic, m] of Object.entries(OBSAH.moduly)) {
    for (const pole of ["title", "probe", "warning"]) {
        if (typeof m[pole] !== "string" || !m[pole]) chyby.push(`${klic}: chybí text "${pole}"`);
    }
    if (!Array.isArray(m.protocol) || m.protocol.length === 0) chyby.push(`${klic}: chybí seznam "protocol"`);
    if (!m.tlacitko || !m.tlacitko.popisek || !m.tlacitko.ikona) chyby.push(`${klic}: chybí tlacitko.popisek nebo tlacitko.ikona`);
    if (!BARVY.includes(m.barva)) chyby.push(`${klic}: barva "${m.barva}" není jedna z ${BARVY.join(", ")}`);
    if (m.kalkulacka && !KALKULACKY.includes(m.kalkulacka)) chyby.push(`${klic}: neznámá kalkulačka "${m.kalkulacka}"`);
    for (const [i, o] of (m.obrazky || []).entries()) {
        if (!o.soubor || !o.nazev) { chyby.push(`${klic}: obrázek č. ${i + 1} nemá "soubor" nebo "nazev"`); continue; }
        const nalez = souboryVeSlozce.filter(f => f === o.soubor ||
            PRIPONY.some(p => f.toLowerCase() === `${o.soubor}.${p}`.toLowerCase()));
        nalez.forEach(f => pouzite.add(f));
        if (nalez.length === 0) upozorneni.push(`chybí obrázek ${OBSAH.slozkaObrazku}/${o.soubor}.*  (${klic}: ${o.nazev})`);
        if (nalez.length > 1) upozorneni.push(`víc souborů pro ${o.soubor}: ${nalez.join(", ")} – použije se první nalezený`);
    }
}
for (const f of souboryVeSlozce) {
    const jeMedia = PRIPONY.some(p => f.toLowerCase().endsWith("." + p));
    if (jeMedia && !pouzite.has(f)) upozorneni.push(`soubor ${OBSAH.slozkaObrazku}/${f} není v obsah.js použitý (překlep v názvu?)`);
}

// 2) Prohlížeč: proklikání všech modulů a obrázků
(async () => {
    const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
    const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
    page.on("pageerror", e => chyby.push("chyba JavaScriptu: " + e.message));
    page.on("console", msg => { if (msg.type() === "error" && !/Failed to load resource/.test(msg.text())) chyby.push("konzole: " + msg.text()); });

    await page.goto("file://" + path.join(KOREN, "index.html"));
    await page.waitForFunction(() => document.querySelectorAll("#quick-buttons button").length > 0, null, { timeout: 15000 })
        .catch(() => chyby.push("rychlá tlačítka se nevykreslila (chyba v app.js nebo obsah.js?)"));

    const hotspoty = await page.$$eval("svg [data-modul]", els => els.map(e => e.dataset.modul));
    for (const h of hotspoty) if (!OBSAH.moduly[h]) chyby.push(`oblast na těle odkazuje na neexistující modul "${h}"`);
    for (const k of Object.keys(OBSAH.moduly)) if (!hotspoty.includes(k)) upozorneni.push(`modul "${k}" nemá klikací oblast na těle (jen tlačítko dole)`);

    for (const [klic, m] of Object.entries(OBSAH.moduly)) {
        await page.click(`#quick-buttons [data-modul="${klic}"]`);
        const titulek = await page.textContent("#module-title");
        if (titulek !== m.title) chyby.push(`${klic}: zobrazil se nadpis "${titulek}" místo "${m.title}"`);
        const pocet = await page.$$eval("#gallery-buttons button", b => b.length);
        if (pocet !== (m.obrazky || []).length) chyby.push(`${klic}: ${pocet} tlačítek obrázků místo ${(m.obrazky || []).length}`);
        for (let i = 0; i < pocet; i++) {
            await page.click(`#gallery-buttons button[data-index="${i}"]`);
            await page.waitForFunction(() => !document.querySelector("#gallery-display").textContent.includes("Načítám"), null, { timeout: 30000 })
                .catch(() => chyby.push(`${klic}: obrázek č. ${i + 1} se nenačetl`));
        }
        if (m.kalkulacka) {
            const vidim = await page.isVisible(`[data-kalkulacka="${m.kalkulacka}"]`);
            if (!vidim) chyby.push(`${klic}: kalkulačka "${m.kalkulacka}" není vidět`);
        }
    }

    // Kalkulačky: známé vstupy → známý výsledek
    await page.click('#quick-buttons [data-modul="gi"]');
    await page.fill("#input-csa", "4.5"); await page.fill("#input-age", "65");
    const grv = await page.textContent("#res-grv");
    if (grv !== "9.5 ml") chyby.push(`kalkulačka GRV: pro CSA 4.5 a věk 65 vyšlo "${grv}", čekáno "9.5 ml"`);
    await page.click('#quick-buttons [data-modul="bladder"]');
    await page.fill("#b-w", "6"); await page.fill("#b-h", "7"); await page.fill("#b-d", "5");
    const mechyr = await page.textContent("#res-bladder");
    if (mechyr !== "109.2 ml") chyby.push(`kalkulačka měchýře: pro 6×7×5 vyšlo "${mechyr}", čekáno "109.2 ml"`);

    await browser.close();

    upozorneni.forEach(u => console.log("upozornění: " + u));
    if (chyby.length) {
        chyby.forEach(c => console.log("CHYBA: " + c));
        console.log(`\n${chyby.length} chyb – oprav je před uložením.`);
        process.exit(1);
    }
    console.log(`\nOK: ${Object.keys(OBSAH.moduly).length} modulů v pořádku, ${upozorneni.length} upozornění.`);
})().catch(e => { console.error("CHYBA testu: " + e.message); process.exit(1); });
