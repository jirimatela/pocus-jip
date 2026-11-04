/* =========================================================================
   OBSAH APLIKACE – texty, obrázky a tlačítka.
   Tohle je jediný soubor, který je potřeba měnit při úpravách obsahu.

   Obrázky: soubor dejte do složky "obrazky" a pojmenujte ho podle hodnoty
   "soubor" (bez přípony, aplikace najde .jpg/.png/.webp/.gif/.mp4/.webm/.mov).
   Chybějící obrázek se v aplikaci ukáže jako rámeček s názvem souboru.

   V textech "protocol" a "popis" lze použít <strong>tučně</strong>.
   ========================================================================= */

window.POCUS = {
    slozkaObrazku: "obrazky",

    moduly: {
        gi: {
            title: "Trávicí trakt / Výživa",
            tlacitko: { popisek: "Žaludek", ikona: "utensils" },
            barva: "amber",
            probe: "Konvexní / Abdominální",
            protocol: [
                "<strong>Verifikace polohy nasogastrické sondy (NGS):</strong> Zobrazení antralní oblasti žaludku a sledování průchodu tekutiny/bolusu nebo přímá vizualizace sondy.",
                "<strong>Diagnostika gastroparézy:</strong> Hodnocení motility a distenze žaludku před podáním enterální výživy.",
                "<strong>Měření gastrického rezidua (GRV):</strong> Transverzální scan antrumu žaludku v polohách RLD (pravý bok) nebo supinní, změření CSA (Cross-Sectional Area) v cm²."
            ],
            warning: "Stagnace tuhé stravy nebo nehomogenní obsah náplně žaludku značí gastroparézu a vysoké riziko aspirace!",
            kalkulacka: "grv",
            obrazkyNadpis: "Sonogramy žaludečního antra",
            obrazky: [
                { soubor: "gi-1-prazdny",  nazev: "1. Normální / Prázdný", popis: "<strong>Normální kontrahované antrum (prázdný žaludek):</strong> Antrum má terčovitý (bull's eye) vzhled, stěny jsou k sobě přilehlé. Nízká hodnota CSA." },
                { soubor: "gi-2-tekutina", nazev: "2. Tekutina",           popis: "<strong>Žaludek naplněný tekutinou:</strong> Anechoenní/hypoechoenní náplň. Určeno pro změření CSA (cm²) a výpočet rezidua." },
                { soubor: "gi-3-jidlo",    nazev: "3. Jídlo",              popis: "<strong>Žaludek s tuhou stravou:</strong> Nehomogenní hyperechoenní náplň s akustickým stínem. Vysoké riziko aspirace!" },
                { soubor: "gi-4-sonda",    nazev: "4. NGS v žaludku",      popis: "<strong>Nasogastrická sonda v antru:</strong> Hyperechogenní linie sondy, případně vír po bolusu tekutiny." }
            ]
        },

        bladder: {
            title: "Močový měchýř",
            tlacitko: { popisek: "Měchýř", ikona: "droplet" },
            barva: "purple",
            probe: "Konvexní / Abdominální",
            protocol: [
                "<strong>Verifikace správného uložení močového katetru:</strong> Vizualizace anechoického balónku katétru naplněného tekutinou uvnitř měchýře.",
                "<strong>Měření objemu močového měchýře:</strong> Získání příčného (Transverse) a podélného (Sagittal) rozměru (Šířka, Výška, Hloubka v cm)."
            ],
            warning: "Objem > 400–500 ml indikuje akutní retenci moči. Balónek katétru uložený v uretře vyžaduje okamžitou reposici!",
            kalkulacka: "mechyr",
            obrazkyNadpis: "Sonogramy močového měchýře",
            obrazky: [
                { soubor: "mechyr-1-pricny",  nazev: "1. Příčný řez",      popis: "<strong>Příčný řez:</strong> Měření šířky a hloubky měchýře." },
                { soubor: "mechyr-2-podelny", nazev: "2. Podélný řez",     popis: "<strong>Podélný řez:</strong> Měření výšky měchýře." },
                { soubor: "mechyr-3-balonek", nazev: "3. Balónek katétru", popis: "<strong>Balónek katétru v měchýři:</strong> Kulatý anechoický útvar uvnitř měchýře = správná poloha." }
            ]
        },

        lungs: {
            title: "Plíce a pleurální prostor",
            tlacitko: { popisek: "Plíce", ikona: "wind" },
            barva: "cyan",
            probe: "Lineární (pleura) / Konvexní",
            protocol: [
                "<strong>Zhodnocení přítomnosti sliding:</strong> Přítomnost normálního klouzání parietální a viscerální pleury synchronně s dýcháním.",
                "<strong>A-linie:</strong> Horizontální reverberační artefakty značící normální aerovanou plíci.",
                "<strong>B-linie:</strong> Vertikální 'comet-tail' artefakty; >3 B-linie v poli značí intersticiální syndrom / plicní edém.",
                "<strong>Fluidothorax:</strong> Anechoenní tekutina nad bránicí (quad sign)."
            ],
            warning: "Absence lung sliding + přítomnost 'Barcode/Stratosphere sign' na M-módu značí PNEUMOTHORAX! Ihned informujte lékaře.",
            obrazkyNadpis: "Sonogramy plic",
            obrazky: [
                { soubor: "plice-1-a-linie",      nazev: "1. A-linie",      popis: "<strong>A-linie:</strong> Normální aerovaná plíce. Sliding nejlépe ukáže krátké video (.mp4)." },
                { soubor: "plice-2-b-linie",      nazev: "2. B-linie",      popis: "<strong>B-linie:</strong> Vertikální artefakty od pleury do hloubky; více než 3 v poli = intersticiální syndrom." },
                { soubor: "plice-3-fluidothorax", nazev: "3. Fluidothorax", popis: "<strong>Fluidothorax:</strong> Anechoenní tekutina nad bránicí." },
                { soubor: "plice-4-pneumothorax", nazev: "4. Pneumothorax", popis: "<strong>Pneumothorax:</strong> M-mód – barcode/stratosphere sign, bez sliding." }
            ]
        },

        dvt: {
            title: "Základní známky trombózy (DVT)",
            tlacitko: { popisek: "DVT", ikona: "activity" },
            barva: "rose",
            probe: "Lineární sonda",
            protocol: [
                "<strong>Hodnocení cév:</strong> Vyšetření na úrovni v. femoralis, v. saphena magna a v. poplitea.",
                "<strong>Kompresibilita (stlačitelnost):</strong> Aplikace jemného tlaku sondou v příčné ose. Normální žíla plně skolabuje.",
                "<strong>Přítomnost pulzatilního toku:</strong> Posouzení toku v cévách."
            ],
            warning: "Neschopnost stlačit žílu (nestlačitelnost) nebo viditelný echogenní trombus v lumen potvrzuje DVT!",
            obrazkyNadpis: "Sonogramy žil dolní končetiny",
            obrazky: [
                { soubor: "dvt-1-normalni", nazev: "1. Normální komprese", popis: "<strong>Normální žíla:</strong> Při tlaku sondou plně skolabuje, tepna zůstává otevřená." },
                { soubor: "dvt-2-trombus",  nazev: "2. Trombus",           popis: "<strong>DVT:</strong> Žíla se tlakem nestlačí, v lumen může být echogenní trombus." }
            ]
        },

        piv: {
            title: "UZ periferního žilního řečiště",
            tlacitko: { popisek: "PVK", ikona: "syringe" },
            barva: "emerald",
            probe: "Lineární (vysokofrekvenční)",
            protocol: [
                "<strong>Vyhledávání obtížných žilních přístupů:</strong> Mapování cév na paži a předloktí (v. basilica, v. cephalica).",
                "<strong>Zavedení periferního žilního vstupu pod USG kontrolou:</strong> Technika v reálném čase (Out-of-plane / In-plane).",
                "<strong>Ověření pozice katétru:</strong> Rychlý bolus fyziologického roztoku (Saline Flush Test) se sledováním mikrobublin v cévě."
            ],
            warning: "Při nepřítomnosti toku, přítomnosti trombu nebo extravazaci bolusu kanylaci okamžitě přerušte.",
            obrazkyNadpis: "Sonogramy periferních žil",
            obrazky: [
                { soubor: "pvk-1-zila",       nazev: "1. Žíla v příčném řezu", popis: "<strong>Vyhledání žíly:</strong> Kulatý anechoický průřez, tlakem sondy stlačitelný." },
                { soubor: "pvk-2-kanylace",   nazev: "2. Kanylace",            popis: "<strong>Kanylace pod USG:</strong> Hrot jehly v žíle (out-of-plane nebo in-plane)." },
                { soubor: "pvk-3-flush-test", nazev: "3. Flush test",          popis: "<strong>Saline flush test:</strong> Mikrobubliny v žíle potvrzují polohu katétru." }
            ]
        }
    }
};
