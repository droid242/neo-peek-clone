# Neo Peek Extension

Egy Chrome böngészőbővítmény, amely lehetővé teszi linkek gyors előnézetét anélkül, hogy el kellene navigálni az aktuális oldalról. A Neo Browser Peek funkciójára épülő, önálló megoldás.

---

## Funkciók

- **Peek ikon**: Ha az egeret egy linkre viszed, egy kis lebegő ikon jelenik meg a kurzor mellett.
- **Előnézeti ablak**: Az ikonra kattintva egy felugró ablakban betöltődik a hivatkozott oldal, iframe segítségével.
- **Dinamikus ikonkövetés**: Hosszabb link esetén az ikon követi a kurzozt a linken belül, így mindig kéznél van.
- **Megnyitás új lapon**: Az előnézeti ablak fejlécéből közvetlenül megnyitható a hivatkozott oldal egy új lapon.
- **Bezárás**: Az előnézeti ablak bezárható a fejléc X gombjával, az ESC billentyűvel, vagy az elsötétített háttérre kattintva.
- **Háttér görgetés letiltása**: Amíg az előnézeti ablak nyitva van, a háttér oldal görgetése le van tiltva.
- **Intelligens szűrés**: A bővítmény automatikusan kihagyja azokat a linkeket, amelyeknél az előnézet nem releváns:
  - Navigációs menük (pl. Főoldal, Rólunk, Kapcsolat)
  - Lapozó sávok (pagination)
  - Lightbox / képgaléria hivatkozások
  - Közvetlen képfájlokra mutató linkek (`.jpg`, `.png`, `.webp` stb.)

---

## Telepítés (fejlesztői mód)

1. Töltsd le vagy klónozd a tárolót:
   ```bash
   git clone https://github.com/droid242/neo-peek-clone.git
   ```
2. Nyisd meg a Chrome-ban a `chrome://extensions/` oldalt.
3. Kapcsold be a **Fejlesztői mód** kapcsolót (jobb felső sarok).
4. Kattints a **Kicsomagolt bővítmény betöltése** gombra.
5. Válaszd ki a letöltött/klónozott mappa helyét.

---

## Használat

1. Navigálj bármilyen weboldalra.
2. Vigyük az egeret egy linkre – rövid késleltetés után megjelenik a Peek ikon.
3. Kattints az ikonra az előnézeti ablak megnyitásához.
4. Az előnézeti ablakban:
   - Görgetheted a betöltött oldal tartalmát.
   - A fejléc bal oldalán látható a betöltött oldal címe.
   - A jobb oldalon lévő gombokkal megnyithatod az oldalt egy új lapon, vagy bezárhatod az ablakot.
5. Az ablak bezárható:
   - Az **X** gombra kattintva.
   - Az **ESC** billentyű megnyomásával.
   - Az elsötétített háttérre kattintva.

---

## Fájlstruktúra

```
neo-peek-extension/
├── manifest.json       # Bővítmény beállítások (Manifest V3)
├── content.js          # Fő logika: ikon megjelenítés, szűrés, peek ablak
├── styles.css          # Stílusok: ikon, overlay, ablak, fejléc
├── background.js       # Service worker (háttérfolyamatok)
├── rules.json          # Hálózati szabályok (declarativeNetRequest)
├── .gitignore
└── pic/
    ├── peek.svg        # Peek indítóikon
    ├── w.svg           # "Megnyitás új lapon" gomb ikonja
    └── x.svg           # "Bezárás" gomb ikonja
```

---

## Technikai megjegyzések

- A bővítmény **Manifest V3** szabványt követi.
- Az SVG ikonok a `pic/` mappából töltődnek be, így könnyen cserélhetők vagy testreszabhatók.
- Az ikonok árnyéka CSS `filter: drop-shadow()` segítségével készül, ami automatikusan leköveti az ikon alakját (kör, háromszög stb.).
- Az iframe-es előnézet **CORS korlátozások** miatt egyes oldalakon nem töltődhet be (X-Frame-Options fejléc), ilyenkor az URL jelenik meg a fejlécben.

---

## Licenc

Ez a projekt személyes és oktatási célból készült. Megosztás és továbbfejlesztés előtt kérjük, ellenőrizd a vonatkozó feltételeket.
