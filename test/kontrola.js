#!/usr/bin/env node
/*
 * Kontrola aplikace – musí projít před každým uložením (viz CLAUDE.md, „Testování").
 *
 *   node test/kontrola.js              plná kontrola: Chromium + Firefox + WebKit, telefon/tablet/počítač
 *   node test/kontrola.js --rychle     jen Chromium (telefon + počítač) – průběžně při práci
 *   node test/kontrola.js --prisne     chybějící prohlížeč nebo ffprobe = chyba (tak běží na GitHubu)
 *   node test/kontrola.js --adresa URL kontrola živého webu (např. https://….github.io/pocus-jip/)
 *
 * Prohlížeče: npm ci && npx playwright install chromium firefox webkit
 * Návratový kód 0 = v pořádku, 1 = chyba. Chybějící obrázky jsou jen upozornění.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");
const { execFileSync } = require("child_process");
const playwright = require("playwright");

const ARGY = process.argv.slice(2);
const RYCHLE = ARGY.includes("--rychle");
const PRISNE = ARGY.includes("--prisne") || !!process.env.CI;
const ADRESA = (() => { const i = ARGY.indexOf("--adresa"); return i >= 0 ? ARGY[i + 1] : null; })();

const KOREN = path.resolve(__dirname, "..");
const UKAZKY = path.join(__dirname, "ukazky");
const PRIPONY_OBRAZEK = ["jpg", "jpeg", "png", "webp", "gif"]; // stejné jako v app.js
const PRIPONY_VIDEO = ["mp4", "webm"];                          // stejné jako v app.js
const PRIPONY = [...PRIPONY_OBRAZEK, ...PRIPONY_VIDEO];
const BARVY = ["amber", "purple", "cyan", "rose", "emerald"];   // stejné jako BARVY v app.js
const KALKULACKY = ["grv", "mechyr"];                           // data-kalkulacka v index.html
const TESTY_KALKULACEK = {                                      // známé vstupy → známý výsledek
    grv:    [{ vstupy: { "#input-csa": "4,5", "#input-age": "65" }, vystup: "#res-grv", cekam: "9.5 ml" },
             { vstupy: { "#input-csa": "4.5", "#input-age": "65" }, vystup: "#res-grv", cekam: "9.5 ml" }],
    mechyr: [{ vstupy: { "#b-w": "6", "#b-h": "7", "#b-d": "5" }, vystup: "#res-bladder", cekam: "109.2 ml" }]
};
const PROHLIZECE = RYCHLE ? ["chromium"] : ["chromium", "firefox", "webkit"];
const OBRAZOVKY = {
    telefon: { viewport: { width: 360, height: 780 }, hasTouch: true },
    tablet:  { viewport: { width: 820, height: 1180 }, hasTouch: true },
    pocitac: { viewport: { width: 1366, height: 900 } }
};
const OBRAZOVKY_RYCHLE = ["telefon", "pocitac"];

const chyby = [];
const upozorneni = [];

/* ======================= 1) Soubory a obsah (bez prohlížeče) ======================= */

const sandbox = { window: {} };
try {
    vm.runInNewContext(fs.readFileSync(path.join(KOREN, "obsah.js"), "utf8"), sandbox);
} catch (e) {
    console.error("CHYBA: obsah.js nejde načíst (překlep v závorkách, čárkách nebo uvozovkách?):\n  " + e.message);
    process.exit(1);
}
const OBSAH = sandbox.window.POCUS;
if (!OBSAH || !OBSAH.moduly) {
    console.error("CHYBA: obsah.js musí nastavit window.POCUS = { slozkaObrazku, moduly }");
    process.exit(1);
}
const KLICE = Object.keys(OBSAH.moduly);
if (!OBSAH.upozorneni || !OBSAH.upozorneni.kratce || !(OBSAH.upozorneni.podrobne || []).length)
    chyby.push("obsah.js: chybí upozornění (upozorneni.kratce a upozorneni.podrobne) – aplikace ho musí zobrazovat");
const SLOZKA = path.join(KOREN, OBSAH.slozkaObrazku);
const souboryVeSlozce = fs.existsSync(SLOZKA) ? fs.readdirSync(SLOZKA) : [];
const pouzite = new Set();

for (const [klic, m] of Object.entries(OBSAH.moduly)) {
    if (!/^[a-z0-9_]+$/.test(klic)) chyby.push(`klíč modulu "${klic}" smí mít jen malá písmena, číslice a _`);
    for (const pole of ["title", "probe", "warning"]) {
        if (typeof m[pole] !== "string" || !m[pole]) chyby.push(`${klic}: chybí text "${pole}"`);
    }
    if (!Array.isArray(m.protocol) || m.protocol.length === 0) chyby.push(`${klic}: chybí seznam "protocol"`);
    if (!m.tlacitko || !m.tlacitko.popisek || !m.tlacitko.ikona) chyby.push(`${klic}: chybí tlacitko.popisek nebo tlacitko.ikona`);
    if (!BARVY.includes(m.barva)) chyby.push(`${klic}: barva "${m.barva}" není jedna z ${BARVY.join(", ")}`);
    if (m.kalkulacka && !KALKULACKY.includes(m.kalkulacka)) chyby.push(`${klic}: neznámá kalkulačka "${m.kalkulacka}"`);

    const texty = [m.warning, ...(m.protocol || []), ...(m.obrazky || []).map(o => o.popis || "")];
    for (const t of texty) {
        const otevreno = (String(t).match(/<strong>/g) || []).length;
        const zavreno = (String(t).match(/<\/strong>/g) || []).length;
        if (otevreno !== zavreno) chyby.push(`${klic}: neuzavřené <strong> v textu "${String(t).slice(0, 50)}…"`);
    }

    for (const [i, o] of (m.obrazky || []).entries()) {
        if (!o.soubor || !o.nazev) { chyby.push(`${klic}: obrázek č. ${i + 1} nemá "soubor" nebo "nazev"`); continue; }
        if (o.soubor !== o.soubor.toLowerCase()) chyby.push(`${klic}: "soubor" musí být malými písmeny: ${o.soubor}`);
        const nalez = souboryVeSlozce.filter(f => f === o.soubor || PRIPONY.some(p => f === `${o.soubor}.${p}`));
        nalez.forEach(f => pouzite.add(f));
        if (nalez.length === 0) upozorneni.push(`chybí obrázek ${OBSAH.slozkaObrazku}/${o.soubor}.*  (${klic}: ${o.nazev})`);
        if (nalez.length > 1) upozorneni.push(`víc souborů pro ${o.soubor}: ${nalez.join(", ")} – použije se první nalezený`);
    }
}

// Formát, název a velikost souborů – musí jít zobrazit v každém prohlížeči
let ffprobe = true;
function kodekVidea(soubor) {
    if (!ffprobe) return null;
    try {
        return execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name",
            "-of", "default=nw=1:nk=1", soubor], { encoding: "utf8" }).trim();
    } catch (e) {
        if (e.code === "ENOENT") { ffprobe = false; return null; }
        return "nečitelné";
    }
}
for (const f of souboryVeSlozce) {
    if (f.startsWith(".") || f === "README.md") continue;
    const cesta = path.join(SLOZKA, f);
    const pripona = f.slice(f.lastIndexOf(".") + 1).toLowerCase();
    if (["heic", "heif"].includes(pripona)) { chyby.push(`${OBSAH.slozkaObrazku}/${f}: formát iPhonu (HEIC) zobrazí jen Safari – převeďte na .jpg`); continue; }
    if (pripona === "mov") { chyby.push(`${OBSAH.slozkaObrazku}/${f}: .mov nehraje Firefox ani Chrome na Windows – převeďte na .mp4 (H.264)`); continue; }
    if (!PRIPONY.includes(pripona)) { chyby.push(`${OBSAH.slozkaObrazku}/${f}: nepodporovaný typ souboru (jen ${PRIPONY.join(", ")})`); continue; }
    if (f !== f.toLowerCase() || /[^a-z0-9.\-]/.test(f)) { chyby.push(`${OBSAH.slozkaObrazku}/${f}: název musí být malými písmeny bez diakritiky a mezer (na webu se jinak nenajde)`); continue; }
    const mb = fs.statSync(cesta).size / 1024 / 1024;
    if (PRIPONY_VIDEO.includes(pripona)) {
        if (mb > 10) chyby.push(`${OBSAH.slozkaObrazku}/${f} má ${mb.toFixed(1)} MB – videa max. 10 MB (zkraťte/zmenšete)`);
        const kodek = kodekVidea(cesta);
        const povolene = pripona === "mp4" ? ["h264"] : ["vp8", "vp9", "av1"];
        if (kodek && !povolene.includes(kodek)) chyby.push(`${OBSAH.slozkaObrazku}/${f}: video je ${kodek}, všude hraje jen ${povolene.join("/")} – převeďte: ffmpeg -i ${f} -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an nove.mp4`);
    } else if (mb > 2) {
        upozorneni.push(`${OBSAH.slozkaObrazku}/${f} má ${mb.toFixed(1)} MB – na mobilních datech se načítá pomalu, zmenšete (delší strana 1600 px)`);
    }
    if (!pouzite.has(f)) upozorneni.push(`soubor ${OBSAH.slozkaObrazku}/${f} není v obsah.js použitý (překlep v názvu?)`);
}
if (!ffprobe) (PRISNE ? chyby : upozorneni).push("ffprobe (ffmpeg) není nainstalovaný – formát videí nebyl zkontrolován");

/* ---------- Bezpečnost: metadata v obrázcích/videích, tajné údaje a rodná čísla v textech ---------- */

// Fotky z telefonu nesou EXIF (GPS poloha, datum, zařízení) – web je veřejný.
for (const f of souboryVeSlozce) {
    const pripona = f.slice(f.lastIndexOf(".") + 1).toLowerCase();
    const cesta = path.join(SLOZKA, f);
    if (PRIPONY_OBRAZEK.includes(pripona)) {
        const zacatek = fs.readFileSync(cesta).subarray(0, 256 * 1024);
        if (zacatek.includes(Buffer.from("Exif\0")) || zacatek.includes(Buffer.from("eXIf")) || zacatek.includes(Buffer.from("<x:xmpmeta")))
            chyby.push(`${OBSAH.slozkaObrazku}/${f}: obsahuje metadata (EXIF/XMP – může v nich být GPS poloha, datum, přístroj) – odstraňte: magick ${f} -strip ${f}`);
    }
    if (PRIPONY_VIDEO.includes(pripona) && ffprobe) {
        try {
            const tagy = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format_tags", "-of", "default=nw=1", cesta], { encoding: "utf8" });
            if (/location|gps|make|model|author|artist|comment/i.test(tagy))
                chyby.push(`${OBSAH.slozkaObrazku}/${f}: video obsahuje metadata (poloha/přístroj/autor) – odstraňte: ffmpeg -i ${f} -map_metadata -1 -c copy nove.${pripona}`);
        } catch { /* nečitelné video hlásí kontrola formátu výše */ }
    }
}

// Tajné údaje a osobní údaje v textových souborech repozitáře
const TAJNE = [
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "soukromý klíč"],
    [/\b(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/, "token GitHubu"],
    [/\bsk-[A-Za-z0-9_-]{20,}/, "API klíč"],
    [/\bAKIA[0-9A-Z]{16}\b/, "klíč AWS"],
    [/\b(password|heslo|passwd|api[_-]?key|secret|token)\s*[:=]\s*["']?[^\s"']{6,}/i, "heslo nebo klíč"],
    [/\b\d{2}[0156]\d[0-3]\d\s?\/\s?\d{3,4}\b/, "rodné číslo"]
];
function textoveSoubory(adr) {
    return fs.readdirSync(adr, { withFileTypes: true }).flatMap(e => {
        if ([".git", "node_modules", "ukazky"].includes(e.name)) return [];
        const p = path.join(adr, e.name);
        if (e.isDirectory()) return textoveSoubory(p);
        return /\.(html|js|css|md|json|yml|yaml|txt|csv)$/i.test(e.name) && p !== __filename ? [p] : [];
    });
}
for (const soubor of textoveSoubory(KOREN)) {
    const text = fs.readFileSync(soubor, "utf8");
    for (const [vzor, co] of TAJNE) {
        if (vzor.test(text)) chyby.push(`${path.relative(KOREN, soubor)}: vypadá to na ${co} – do veřejného repozitáře nepatří, odstraňte`);
    }
}
for (const f of fs.readdirSync(KOREN)) {
    if (/^\.env|\.(pem|key|p12|dcm)$/i.test(f)) chyby.push(`${f}: tajný soubor nebo DICOM nepatří do repozitáře`);
}


/* ======================= 2) Lokální server jako GitHub Pages ======================= */
// Rozlišuje velká a malá písmena (Mac ani Windows ne, GitHub Pages ano).
// Navíc servíruje testovací ukázky na /obrazky/__test__/… (aby se galerie dala ověřit i bez skutečných snímků).

const TYPY = { html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", css: "text/css", md: "text/markdown",
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm" };

function najdiPresne(koren, casti) {
    let cesta = koren;
    for (const c of casti) {
        if (!c || c === "." || c === "..") return null;
        if (!fs.existsSync(cesta) || !fs.statSync(cesta).isDirectory() || !fs.readdirSync(cesta).includes(c)) return null;
        cesta = path.join(cesta, c);
    }
    return fs.existsSync(cesta) && fs.statSync(cesta).isFile() ? cesta : null;
}

function spustServer() {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            let url = decodeURIComponent(req.url.split("?")[0]);
            if (url.endsWith("/")) url += "index.html";
            const casti = url.split("/").filter(Boolean);
            const soubor = casti[0] === OBSAH.slozkaObrazku && casti[1] === "__test__"
                ? najdiPresne(UKAZKY, casti.slice(2))
                : najdiPresne(KOREN, casti);
            if (!soubor) { res.writeHead(404); return res.end("404"); }
            const typ = TYPY[soubor.slice(soubor.lastIndexOf(".") + 1).toLowerCase()] || "application/octet-stream";
            const data = fs.readFileSync(soubor);
            // Rozsahy (Range) – Safari bez nich video nepřehraje
            const rozsah = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
            if (rozsah) {
                const od = rozsah[1] ? Number(rozsah[1]) : 0;
                const po = rozsah[2] ? Math.min(Number(rozsah[2]), data.length - 1) : data.length - 1;
                res.writeHead(206, { "Content-Type": typ, "Accept-Ranges": "bytes", "Content-Range": `bytes ${od}-${po}/${data.length}`, "Content-Length": po - od + 1 });
                return res.end(req.method === "HEAD" ? undefined : data.subarray(od, po + 1));
            }
            res.writeHead(200, { "Content-Type": typ, "Accept-Ranges": "bytes", "Content-Length": data.length });
            res.end(req.method === "HEAD" ? undefined : data);
        });
        server.listen(0, "127.0.0.1", () => resolve(server));
    });
}

/* ======================= 3) Prohlížeče ======================= */

// Testovací modul s ukázkovým obrázkem a videem – vloží se do stránky jen při testu.
const TESTOVACI_MODUL = {
    title: "Test galerie", tlacitko: { popisek: "Test", ikona: "flask-conical" }, barva: "cyan", probe: "–",
    protocol: ["test"], warning: "test",
    obrazky: [{ soubor: "__test__/obrazek", nazev: "Obrázek", popis: "" }, { soubor: "__test__/video", nazev: "Video", popis: "" }]
};

const prohlizecInstance = {};

async function stavMedia(page) {
    return page.evaluate(() => new Promise(resolve => {
        const img = document.querySelector("#gallery-display img");
        const video = document.querySelector("#gallery-display video");
        if (img) {
            const hotovo = () => resolve(img.naturalWidth > 0 ? "ok" : "rozbity");
            if (img.complete) hotovo(); else { img.onload = hotovo; img.onerror = hotovo; setTimeout(hotovo, 10000); }
        } else if (video) {
            resolve(video.error ? "rozbity" : "ok");
        } else resolve("chybi");
    }));
}

async function zkontrolujStranku({ prohlizec, obrazovka, url, sUkazkami }) {
    const stitek = `[${prohlizec} ${obrazovka}${url.startsWith("file:") ? " ze souboru" : ""}]`;
    const chyba = t => chyby.push(`${stitek} ${t}`);
    const context = await prohlizecInstance[prohlizec].newContext({ ...OBRAZOVKY[obrazovka] });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", e => chyba("chyba JavaScriptu: " + e.message));
    page.on("console", msg => {
        if (msg.type() === "error" && !/Failed to load resource|404|status of 404/i.test(msg.text())) chyba("konzole: " + msg.text());
    });
    if (sUkazkami) {
        await page.addInitScript(modul => {
            let obsah;
            Object.defineProperty(window, "POCUS", {
                configurable: true,
                get: () => obsah,
                set: v => { obsah = v; if (v && v.moduly) v.moduly.__test__ = modul; }
            });
        }, TESTOVACI_MODUL);
    }

    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    const vykresleno = await page.waitForFunction(() => document.querySelectorAll("#quick-buttons button").length > 0, null, { timeout: 15000 })
        .then(() => true, () => false);
    if (!vykresleno) { chyba("rychlá tlačítka se nevykreslila (chyba v app.js nebo obsah.js?)"); await context.close(); return; }

    const tailwind = await page.evaluate(() => getComputedStyle(document.getElementById("view-detail")).display === "none");
    if (!tailwind) chyba("styly (Tailwind) se nenačetly – je připojení k internetu?");
    await page.waitForFunction(() => document.querySelectorAll("#quick-buttons svg").length > 0, null, { timeout: 10000 }).catch(() => {});
    const spatneIkony = await page.$$eval("#quick-buttons i[data-lucide]", els => els.map(e => e.dataset.lucide));
    for (const ik of spatneIkony) chyba(`ikona "${ik}" neexistuje (názvy viz lucide.dev/icons)`);

    const upozorneniText = (await page.textContent("#disclaimer-kratce") || "").trim();
    if (!upozorneniText || !(await page.isVisible("#disclaimer-kratce"))) chyba("upozornění v patičce se nezobrazilo");

    const vodorovnyPosun = async kde => {
        const [sirka, okno] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        if (sirka > okno + 1) chyba(`${kde}: stránka je širší než obrazovka (${sirka} > ${okno} px) – na telefonu jde posouvat do strany`);
    };
    await vodorovnyPosun("přehled");

    // Klikací oblasti na těle
    const hotspoty = await page.$$eval("svg [data-modul]", els => els.map(e => e.dataset.modul));
    for (const h of hotspoty) if (!OBSAH.moduly[h]) chyba(`oblast na těle odkazuje na neexistující modul "${h}"`);
    for (const h of [...new Set(hotspoty)].filter(h => OBSAH.moduly[h])) {
        await page.click("#btn-overview");
        // Klik na svítící tečku – tam ťukne sestra (střed celé skupiny může být mimo, např. mezi plícemi)
        await page.locator(`svg [data-modul="${h}"] circle`).last().click();
        const t = await page.textContent("#module-title");
        if (t !== OBSAH.moduly[h].title) chyba(`kliknutí na tělo (${h}) neotevřelo modul`);
    }

    for (const klic of KLICE) {
        const m = OBSAH.moduly[klic];
        await page.click(`#quick-buttons [data-modul="${klic}"]`);
        const titulek = await page.textContent("#module-title");
        if (titulek !== m.title) chyba(`${klic}: zobrazil se nadpis "${titulek}" místo "${m.title}"`);
        const pocet = await page.$$eval("#gallery-buttons button", b => b.length);
        if (pocet !== (m.obrazky || []).length) chyba(`${klic}: ${pocet} tlačítek obrázků místo ${(m.obrazky || []).length}`);
        for (let i = 0; i < pocet; i++) {
            await page.click(`#gallery-buttons button[data-index="${i}"]`);
            const ok = await page.waitForFunction(() => !document.querySelector("#gallery-display").textContent.includes("Načítám"), null, { timeout: 30000 })
                .then(() => true, () => false);
            if (!ok) { chyba(`${klic}: obrázek č. ${i + 1} se nenačetl`); continue; }
            if (await stavMedia(page) === "rozbity") chyba(`${klic}: soubor obrázku č. ${i + 1} (${m.obrazky[i].soubor}) je poškozený nebo ho prohlížeč neumí zobrazit`);
        }
        if (m.kalkulacka && !(await page.isVisible(`[data-kalkulacka="${m.kalkulacka}"]`))) chyba(`${klic}: kalkulačka "${m.kalkulacka}" není vidět`);
        await vodorovnyPosun(klic);
        if (OBRAZOVKY[obrazovka].hasTouch) {
            const male = await page.$$eval("button", bs => bs.filter(b => b.offsetParent && b.getBoundingClientRect().height < 40).map(b => b.textContent.trim().slice(0, 30)));
            for (const b of male) chyba(`${klic}: tlačítko „${b}" je na dotyk moc malé (< 40 px)`);
        }
    }

    // Kalkulačky
    for (const [typ, testy] of Object.entries(TESTY_KALKULACEK)) {
        const klic = KLICE.find(k => OBSAH.moduly[k].kalkulacka === typ);
        if (!klic) continue;
        await page.click(`#quick-buttons [data-modul="${klic}"]`);
        for (const t of testy) {
            for (const [sel, hodnota] of Object.entries(t.vstupy)) await page.fill(sel, hodnota);
            const vysledek = await page.textContent(t.vystup);
            if (vysledek !== t.cekam) chyba(`kalkulačka ${typ}: pro ${JSON.stringify(t.vstupy)} vyšlo "${vysledek}", čekáno "${t.cekam}"`);
        }
    }

    // Galerie na ukázkových souborech: obrázek se zobrazí, zvětšení funguje, video se najde
    if (sUkazkami) {
        await page.click('#quick-buttons [data-modul="__test__"]');
        await page.click('#gallery-buttons button[data-index="0"]');
        const img = await page.waitForSelector("#gallery-display img", { timeout: 15000 }).catch(() => null);
        if (!img) chyba("galerie: ukázkový obrázek se nezobrazil");
        else {
            if (await stavMedia(page) === "rozbity") chyba("galerie: ukázkový obrázek se nenačetl");
            await img.click();
            if (!(await page.isVisible("#lightbox"))) chyba("galerie: kliknutí na obrázek ho nezvětšilo");
            await page.click("#lightbox");
            if (await page.isVisible("#lightbox")) chyba("galerie: zvětšený obrázek nejde zavřít");
        }
        await page.click('#gallery-buttons button[data-index="1"]');
        const video = await page.waitForSelector("#gallery-display video", { timeout: 15000 }).catch(() => null);
        if (!video) chyba("galerie: ukázkové video se nenašlo");
        else {
            const a = await video.evaluate(v => ({ muted: v.muted, playsInline: v.playsInline }));
            if (!a.muted || !a.playsInline) chyba("galerie: video musí mít muted a playsinline (jinak se na iPhonu samo nespustí)");
        }
        // Chybějící obrázek → rámeček s názvem souboru
        const chybejici = [];
        for (const k of KLICE) (OBSAH.moduly[k].obrazky || []).forEach((o, i) => {
            if (!souboryVeSlozce.some(f => f === o.soubor || f.startsWith(o.soubor + "."))) chybejici.push({ k, i, n: o.soubor });
        });
        if (chybejici.length) {
            const { k, i, n } = chybejici[0];
            await page.click(`#quick-buttons [data-modul="${k}"]`);
            await page.click(`#gallery-buttons button[data-index="${i}"]`);
            await page.waitForFunction(n => document.querySelector("#gallery-display").textContent.includes(n), n, { timeout: 15000 })
                .catch(() => chyba("galerie: u chybějícího obrázku se neukázal rámeček s názvem souboru"));
        }
    }

    await context.close();
}

/* ======================= 4) Spuštění ======================= */

(async () => {
    const server = ADRESA ? null : await spustServer();
    const zaklad = ADRESA || `http://127.0.0.1:${server.address().port}/`;
    const otestovano = [];

    for (const p of PROHLIZECE) {
        try {
            prohlizecInstance[p] = await playwright[p].launch();
        } catch (e) {
            (PRISNE ? chyby : upozorneni).push(`prohlížeč ${p} není nainstalovaný (npx playwright install ${p}) – NEOTESTOVÁNO`);
            continue;
        }
        for (const o of RYCHLE ? OBRAZOVKY_RYCHLE : Object.keys(OBRAZOVKY)) {
            await zkontrolujStranku({ prohlizec: p, obrazovka: o, url: zaklad, sUkazkami: !ADRESA })
                .catch(e => chyby.push(`[${p} ${o}] kontrola spadla: ${e.message.split("\n")[0]}`));
            otestovano.push(`${p}/${o}`);
        }
        // Otevření přímo ze souboru (dvojklik na index.html) – stačí jednou
        if (p === "chromium" && !ADRESA) {
            await zkontrolujStranku({ prohlizec: p, obrazovka: "pocitac", url: "file://" + path.join(KOREN, "index.html"), sUkazkami: false })
                .catch(e => chyby.push(`[${p} ze souboru] kontrola spadla: ${e.message.split("\n")[0]}`));
            otestovano.push("chromium/ze souboru");
        }
        await prohlizecInstance[p].close();
    }
    if (server) server.close();

    upozorneni.forEach(u => console.log("upozornění: " + u));
    console.log(`\notestováno: ${otestovano.join(", ") || "nic"}`);
    const unikatni = [...new Set(chyby)];
    if (unikatni.length) {
        unikatni.forEach(c => console.log("CHYBA: " + c));
        console.log(`\n${unikatni.length} chyb – oprav je před uložením.`);
        process.exit(1);
    }
    console.log(`OK: ${KLICE.length} modulů v pořádku, ${upozorneni.length} upozornění.`);
})().catch(e => { console.error("CHYBA testu: " + e.message); process.exit(1); });
