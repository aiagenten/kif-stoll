# 🎮 KIF STOLL Esportsenter — Brand Guide

> **Utarbeidet av Silje 🎨 | AI AGENTEN**  
> Basert på stoll.gg design-system

---

## 🎨 Fargepalett

| Navn | Hex | Bruk |
|------|-----|------|
| **Primær – Lila** | `#5F4E9D` | Hovedfarge, CTA-knapper, headings |
| **Accent – Gul** | `#F2DE27` | Fremhevinger, badges, highlights |
| **Mørk – Navy** | `#1C244B` | Bakgrunn, dark-mode seksjoner |
| **Hvit** | `#FFFFFF` | Tekst på mørk bakgrunn, bakgrunn |
| **Lys lila 1** | `#F7F4FF` | Seksjonsbackgrounds, kort-bakgrunn |
| **Lys grønn** | `#E7FEFC` | Success-states, positive feedback |
| **Lys lila 2** | `#E8DFFF` | Hover-states, subtle highlights |
| **Lys blå** | `#E4EFFF` | Info-states, sekundær bakgrunn |

### Fargekombinasjoner (godkjente)
- **Mørk seksjon:** `#1C244B` bakgrunn + `#FFFFFF` tekst + `#F2DE27` accent
- **Lys seksjon:** `#F7F4FF` bakgrunn + `#1C244B` tekst + `#5F4E9D` heading
- **Hero/Banner:** `#5F4E9D` bakgrunn + `#FFFFFF` tekst + `#F2DE27` CTA
- **Sponsor-stripe:** `#FFFFFF` bakgrunn + `#1C244B` tekst

---

## 🔤 Typografi

**Primærfont:** [Montserrat](https://fonts.google.com/specimen/Montserrat) (Google Fonts)

| Weight | Verdi | Bruk |
|--------|-------|------|
| Regular | 400 | Brødtekst, beskrivelser |
| Medium | 500 | Sub-headings, labels, navigasjon |
| SemiBold | 600 | Overskrifter, CTA-tekst, fremhevet innhold |

### Typografisk hierarki
```
H1: Montserrat 600 — 48–64px / 1.1 line-height
H2: Montserrat 600 — 32–40px / 1.2 line-height
H3: Montserrat 500 — 24–28px / 1.3 line-height
Body: Montserrat 400 — 16–18px / 1.6 line-height
Small/Label: Montserrat 500 — 12–14px / uppercase + letter-spacing
```

### CSS-import
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
}
```

---

## 🖼️ Logoer

Lagret i: `brand-assets/logos/`

| Fil | Beskrivelse | Bruk |
|-----|-------------|------|
| `STOLL-HEADER-LOGO.png` | Horisontal header-logo (PNG) | Navigasjon, header, dokumenter |
| `logo_text_web.webp` | Logo med tekst (web-optimalisert) | Nettsider, sosiale medier |
| `logo_kun_hodet.webp` | Symbol/ikon alene (hodet) | Favicon, profilbilde, app-ikon |

### Logo-bruksregler

**✅ Riktig bruk:**
- Bruk `STOLL-HEADER-LOGO.png` på hvit eller svært lys bakgrunn
- Bruk `logo_kun_hodet.webp` som standalone ikon der plass er begrenset
- Behold alltid originalproportjoner – ikke strekk logo
- Minste anbefalt størrelse: 120px bred for full logo, 32px for ikon

**❌ Feil bruk:**
- Ikke plasser logo på klissete/kompleks bakgrunn uten kontrast
- Ikke endre farger i logoen
- Ikke roter eller skrå logoen
- Ikke tilføy drop shadow eller glow-effekter til logoen
- Ikke plasser logo på `#F2DE27` gul bakgrunn (lav kontrast)

### Frirom (clear space)
Behold alltid minimum **1× logo-høyde** fri rundt logoen i alle retninger.

---

## 🤝 Sponsorer

Lagret i: `brand-assets/sponsors/`

| Fil | Sponsor | Kategori |
|-----|---------|----------|
| `kongsberg-if.webp` | Kongsberg IF | Idrettslag / Partner |
| `kongsberg-gruppen.webp` | Kongsberg Gruppen ASA | Industri / Teknologi |
| `skrim-kongsberg.webp` | Skrim Kongsberg | Lokal partner |
| `atea.webp` | Atea | IT-infrastruktur |
| `cisco.webp` | Cisco | Nettverk / Teknologi |
| `kroderen-elektro.webp` | Kröderen Elektro | El-installasjon |
| `jbl.webp` | JBL | Lyd / Gaming-utstyr |
| `amedia.webp` | Amedia | Medier / Presse |
| `kongsberg-kino.webp` | Kongsberg Kino | Underholdning |
| `kongsberg-kommune.webp` | Kongsberg Kommune | Offentlig støtte |
| `fagskolen-i-viken.webp` | Fagskolen i Viken | Utdanning |
| `technipfmc.webp` | TechnipFMC | Energi / Teknologi |
| `lp.webp` | LP | Partner |
| `mls-2024.webp` | MLS 2024 | Sport / Esport |
| `epson.webp` | Epson | Print / Gaming-utstyr |

### Sponsorvisning — retningslinjer
- Vis på hvit eller `#F7F4FF` bakgrunn for best lesbarhet
- Bruk konsistent størrelsesforhold (anbefalt: 150×80px max-height)
- Behold originalfarger i sponsor-logoer
- Alfabetisk eller etter sponsornivå (nivå defineres av partnerskapsavtale)

---

## 🖼️ Hero / Gaming-bilder

Lagret i: `brand-assets/hero-images/`

| Fil | Beskrivelse | Anbefalt bruk |
|-----|-------------|---------------|
| `transp_gamer-girl.webp` | Gaming-jente (transparent bg) | Hero-seksjon, overlay |
| `stoll-event.webp` | Ekte STOLL-arrangement-bilde | Om oss, events, sosiale medier |
| `gaming-hero.webp` | Gaming-atmosfære (Shutterstock) | Bakgrunnsbilde, landing page |
| `purple-background.webp` | Lilla gaming-bakgrunn | Seksjonsbackground, overlay-base |
| `super-smash.webp` | Super Smash Bros arrangement | Event-side, aktivitetskort |
| `rocket-league.webp` | Rocket League arrangement | Event-side, aktivitetskort |
| `valorant.webp` | Valorant arrangement | Event-side, aktivitetskort |
| `overwatch-2.webp` | Overwatch 2 arrangement | Event-side, aktivitetskort |

---

## 📐 Design-prinsipper

### Stil
KIF STOLL skal fremstå som **profesjonell, inkluderende og energisk**. Designet kombinerer esport-energi med Kongsberg-stolthet.

### Tone
- **Energisk** men ikke kaotisk
- **Profesjonell** men ikke kjedelig
- **Inkluderende** – esport for alle, ikke bare hardcorere
- **Lokal stolthet** – Kongsberg-forankret

### Layout-prinsipper
1. **Mørke seksjoner** med `#1C244B` og neon-gul accent for høyenergi-innhold
2. **Lyse seksjoner** med `#F7F4FF` for informasjon og sponsorer
3. **Gradient-overganger** mellom seksjoner (lila → navy)
4. **Runde hjørner** (border-radius: 8–16px) på kort og knapper
5. **Stor whitespace** – ikke overfyll seksjoner

### Knapper (CTA)
```
Primær: bg #5F4E9D, tekst #FFFFFF, hover: bg #4A3D82
Accent: bg #F2DE27, tekst #1C244B, hover: bg #E8D020
Ghost: border #5F4E9D, tekst #5F4E9D, hover: bg #F7F4FF
```

---

## 📱 Sosiale medier

| Platform | Format | Anbefalt |
|----------|--------|----------|
| Instagram | 1:1 (1080×1080) | `gaming-hero.webp` som base + overlay |
| Instagram Stories | 9:16 (1080×1920) | `purple-background.webp` + logo |
| Facebook Cover | 820×312 | `STOLL-HEADER-LOGO.png` + accent |
| Twitter/X | 1500×500 | Gaming-bilde + logo + `#5F4E9D` |

---

## 📁 Filstruktur

```
brand-assets/
├── brand-guide.md          ← Denne filen
├── logos/
│   ├── STOLL-HEADER-LOGO.png
│   ├── logo_text_web.webp
│   └── logo_kun_hodet.webp
├── sponsors/
│   ├── kongsberg-if.webp
│   ├── kongsberg-gruppen.webp
│   ├── skrim-kongsberg.webp
│   ├── atea.webp
│   ├── cisco.webp
│   ├── kroderen-elektro.webp
│   ├── jbl.webp
│   ├── amedia.webp
│   ├── kongsberg-kino.webp
│   ├── kongsberg-kommune.webp
│   ├── fagskolen-i-viken.webp
│   ├── technipfmc.webp
│   ├── lp.webp
│   ├── mls-2024.webp
│   └── epson.webp
└── hero-images/
    ├── transp_gamer-girl.webp
    ├── stoll-event.webp
    ├── gaming-hero.webp
    ├── purple-background.webp
    ├── super-smash.webp
    ├── rocket-league.webp
    ├── valorant.webp
    └── overwatch-2.webp
```

---

*Brand guide generert: 2026-03-14 | Kilde: stoll.gg*
