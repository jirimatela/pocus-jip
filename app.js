/* Logika aplikace. Obsah (texty, obrázky) je v obsah.js – tady ho jen zobrazujeme. */
(function () {
    "use strict";

    const OBSAH = window.POCUS;
    const MODULY = OBSAH.moduly;

    // Tailwind CDN generuje třídy podle toho, co najde v DOM, proto jsou celé názvy tříd vypsané.
    const BARVY = {
        amber:   { aktivni: "bg-amber-500/20 border-amber-500 text-amber-200",       text: "text-amber-400" },
        purple:  { aktivni: "bg-purple-500/20 border-purple-500 text-purple-200",    text: "text-purple-400" },
        cyan:    { aktivni: "bg-cyan-500/20 border-cyan-500 text-cyan-100",          text: "text-cyan-400" },
        rose:    { aktivni: "bg-rose-500/20 border-rose-500 text-rose-200",          text: "text-rose-400" },
        emerald: { aktivni: "bg-emerald-500/20 border-emerald-500 text-emerald-200", text: "text-emerald-400" }
    };
    const TLACITKO_ZAKLAD = "p-2 min-h-[40px] rounded-xl text-xs font-semibold border transition text-center";
    const TLACITKO_NEAKTIVNI = "border-slate-700 text-slate-300 hover:bg-slate-800";
    const SLOUPCE = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

    // Jen malá písmena: GitHub Pages rozlišuje velikost písmen (kontrola hlídá názvy souborů).
    const PRIPONY_OBRAZEK = ["jpg", "jpeg", "png", "webp", "gif"];
    const PRIPONY_VIDEO = ["mp4", "webm"]; // .mov a HEVC nehraje Firefox ani Chrome na Windows

    const $ = id => document.getElementById(id);
    const barvaModulu = modul => BARVY[modul.barva] || BARVY.cyan;
    const ikony = () => { if (window.lucide) window.lucide.createIcons(); };
    const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    let aktualniKlic = null;
    let pozadavek = 0;

    /* ---------- Hledání souboru obrázku/videa podle jména ---------- */

    const nalezene = {};

    function zkusObrazek(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    function zkusVideo(src) {
        return new Promise(resolve => {
            const v = document.createElement("video");
            const hotovo = ok => { clearTimeout(t); v.removeAttribute("src"); resolve(ok); };
            const t = setTimeout(() => hotovo(false), 3000);
            v.preload = "metadata";
            v.onloadedmetadata = () => hotovo(true);
            v.onerror = () => hotovo(false);
            v.src = src;
        });
    }

    // Na webu (https) se ptáme serveru přímo – rychlé a spolehlivé i pro videa na iPhonu.
    // Lokálně (file://) to nejde, tam zkoušíme soubor načíst jako obrázek/video.
    const naWebu = location.protocol.startsWith("http");
    async function existuje(src, jeVideo) {
        if (naWebu) {
            try { return (await fetch(src, { method: "HEAD", cache: "no-cache" })).ok; } catch { return false; }
        }
        return jeVideo ? zkusVideo(src) : zkusObrazek(src);
    }

    async function najdiSoubor(jmeno) {
        if (jmeno in nalezene) return nalezene[jmeno];
        const zaklad = `${OBSAH.slozkaObrazku}/${jmeno}`;
        const tecka = jmeno.lastIndexOf(".");
        let vysledek = null;

        if (tecka > 0) {
            const pripona = jmeno.slice(tecka + 1);
            const jeVideo = PRIPONY_VIDEO.includes(pripona);
            if (await existuje(zaklad, jeVideo)) {
                vysledek = { typ: jeVideo ? "video" : "img", src: zaklad };
            }
        } else {
            for (const p of PRIPONY_OBRAZEK) {
                if (await existuje(`${zaklad}.${p}`, false)) { vysledek = { typ: "img", src: `${zaklad}.${p}` }; break; }
            }
            for (const p of vysledek ? [] : PRIPONY_VIDEO) {
                if (await existuje(`${zaklad}.${p}`, true)) { vysledek = { typ: "video", src: `${zaklad}.${p}` }; break; }
            }
        }
        nalezene[jmeno] = vysledek;
        return vysledek;
    }

    /* ---------- Zobrazení modulu ---------- */

    function vyberModul(klic) {
        const modul = MODULY[klic];
        if (!modul) return;
        aktualniKlic = klic;

        $("view-welcome").classList.add("hidden");
        $("view-detail").classList.remove("hidden");

        $("module-title").innerText = modul.title;
        $("module-probe").innerText = modul.probe;
        $("module-warning").innerHTML = modul.warning;
        $("module-protocol").innerHTML = modul.protocol
            .map(p => `<li class="flex items-start space-x-2"><span class="text-cyan-400 font-bold mt-0.5">•</span><span>${p}</span></li>`)
            .join("");

        document.querySelectorAll("#quick-buttons button").forEach(b => {
            b.classList.toggle("ring-1", b.dataset.modul === klic);
            b.classList.toggle("ring-slate-400", b.dataset.modul === klic);
        });

        vykresliGalerii(modul);

        document.querySelectorAll("[data-kalkulacka]").forEach(el => {
            el.classList.toggle("hidden", el.dataset.kalkulacka !== modul.kalkulacka);
        });
        prepocitej();
        ikony();

        // Na telefonu je detail pod tělem – posunout na něj.
        if (window.innerWidth < 1024) $("view-detail").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function zpetNaPrehled() {
        aktualniKlic = null;
        $("view-welcome").classList.remove("hidden");
        $("view-detail").classList.add("hidden");
        document.querySelectorAll("#quick-buttons button").forEach(b => b.classList.remove("ring-1", "ring-slate-400"));
    }

    /* ---------- Galerie ---------- */

    function vykresliGalerii(modul) {
        const obrazky = modul.obrazky || [];
        $("gallery-section").classList.toggle("hidden", obrazky.length === 0);
        if (obrazky.length === 0) return;

        $("gallery-title").className = `text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${barvaModulu(modul).text}`;
        $("gallery-title-text").innerText = modul.obrazkyNadpis || "Ultrazvukové obrázky";

        const tlacitka = $("gallery-buttons");
        tlacitka.className = `grid gap-2 grid-cols-2 ${SLOUPCE[Math.min(obrazky.length, 4)]}`;
        tlacitka.innerHTML = obrazky
            .map((o, i) => `<button type="button" data-index="${i}" class="${TLACITKO_ZAKLAD} ${TLACITKO_NEAKTIVNI}">${escapeHtml(o.nazev)}</button>`)
            .join("");
        ukazObrazek(0);
    }

    async function ukazObrazek(index) {
        const modul = MODULY[aktualniKlic];
        const obrazek = modul.obrazky[index];
        const muj = ++pozadavek;

        document.querySelectorAll("#gallery-buttons button").forEach(b => {
            const aktivni = Number(b.dataset.index) === index;
            b.className = `${TLACITKO_ZAKLAD} ${aktivni ? barvaModulu(modul).aktivni : TLACITKO_NEAKTIVNI}`;
        });
        $("gallery-desc").innerHTML = obrazek.popis || "";

        const plocha = $("gallery-display");
        plocha.innerHTML = `<span class="text-xs text-slate-500">Načítám…</span>`;

        const soubor = await najdiSoubor(obrazek.soubor);
        if (muj !== pozadavek) return; // mezitím kliknuto jinam

        plocha.replaceChildren();
        if (!soubor) {
            plocha.innerHTML = `
                <div class="w-full h-full border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-center p-4 space-y-2">
                    <i data-lucide="image-plus" class="w-8 h-8 text-slate-600"></i>
                    <p class="text-xs text-slate-400">Sem patří obrázek nebo video.</p>
                    <p class="text-xs text-slate-500">Složka <code class="text-slate-300">${escapeHtml(OBSAH.slozkaObrazku)}/</code>, název
                    <code class="text-slate-200 font-semibold">${escapeHtml(obrazek.soubor)}</code> (.jpg, .png nebo .mp4)</p>
                </div>`;
            ikony();
            return;
        }

        if (soubor.typ === "video") {
            const v = document.createElement("video");
            Object.assign(v, { src: soubor.src, autoplay: true, loop: true, muted: true, playsInline: true, controls: true });
            v.className = "max-h-full max-w-full rounded-lg";
            plocha.appendChild(v);
        } else {
            const img = document.createElement("img");
            img.src = soubor.src;
            img.alt = obrazek.nazev;
            img.title = "Kliknutím zvětšíte";
            img.className = "max-h-full max-w-full object-contain rounded-lg cursor-zoom-in";
            img.addEventListener("click", () => zvetsi(soubor.src, obrazek.nazev));
            plocha.appendChild(img);
        }
    }

    function zvetsi(src, alt) {
        $("lightbox-img").src = src;
        $("lightbox-img").alt = alt;
        $("lightbox").classList.remove("hidden");
    }

    function zavriZvetseni() {
        $("lightbox").classList.add("hidden");
    }

    /* ---------- Kalkulačky ---------- */

    // Čárka i tečka: sestry píšou "4,5".
    const cislo = id => parseFloat(String($(id).value).replace(",", ".")) || 0;

    function prepocitej() {
        // GRV podle Perlase: 27 + 14.6 × CSA (cm², poloha RLD) − 1.28 × věk
        const grv = Math.max(0, 27 + 14.6 * cislo("input-csa") - 1.28 * cislo("input-age"));
        $("res-grv").innerText = `${grv.toFixed(1)} ml`;

        // Objem měchýře: šířka × výška × hloubka × 0.52
        const mechyr = cislo("b-w") * cislo("b-h") * cislo("b-d") * 0.52;
        $("res-bladder").innerText = `${mechyr.toFixed(1)} ml`;
    }

    /* ---------- Start ---------- */

    function vykresliRychlaTlacitka() {
        const klice = Object.keys(MODULY);
        const box = $("quick-buttons");
        box.style.gridTemplateColumns = `repeat(auto-fit, minmax(60px, 1fr))`;
        box.innerHTML = klice.map(k => {
            const m = MODULY[k];
            return `<button type="button" data-modul="${k}" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-center text-xs flex flex-col items-center space-y-1 transition">
                <i data-lucide="${escapeHtml(m.tlacitko.ikona)}" class="w-4 h-4 ${barvaModulu(m).text}"></i>
                <span class="text-[10px] font-medium text-slate-300 truncate w-full">${escapeHtml(m.tlacitko.popisek)}</span>
            </button>`;
        }).join("");
        $("module-count").innerText = `${klice.length} výkonů`;
    }

    function vykresliUpozorneni() {
        const u = OBSAH.upozorneni;
        if (!u) return;
        $("disclaimer-kratce").innerHTML = u.kratce || "";
        $("disclaimer-podrobne").innerHTML = (u.podrobne || []).map(t => `<li>${t}</li>`).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        vykresliRychlaTlacitka();
        vykresliUpozorneni();

        // Kliknutí na tělo (SVG) i na rychlá tlačítka: oba mají data-modul.
        document.addEventListener("click", e => {
            const cil = e.target.closest("[data-modul]");
            if (cil) vyberModul(cil.dataset.modul);
            const obr = e.target.closest("#gallery-buttons button");
            if (obr) ukazObrazek(Number(obr.dataset.index));
        });

        $("btn-overview").addEventListener("click", zpetNaPrehled);
        $("lightbox").addEventListener("click", zavriZvetseni);
        document.addEventListener("keydown", e => { if (e.key === "Escape") zavriZvetseni(); });
        document.querySelectorAll("[data-kalkulacka] input").forEach(i => i.addEventListener("input", prepocitej));

        prepocitej();
        ikony();
    });
})();
