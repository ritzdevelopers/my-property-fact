# eld-terN-sol — Eldeco Terra & Sol landing page

Source of truth: Figma file `to28JffFfMbVRJHdRR4C0i`, node `1:3`
("Desktop - 1", 1440 × 7035).

## Section map

| Component          | Figma node(s)    | Frame y-range | Notes                                         |
| ------------------ | ---------------- | ------------- | --------------------------------------------- |
| `Section1`         | 1:4 – 1:117      | 0 – 775       | Hero, nav, red pricing card, footer strip     |
| `Section2`         | 1:65 – 1:99      | 775 – 1728    | Overview, metric rail, two 616×345 plates     |
| `Section3`         | 1:123 – 1:173    | 1728 – 2472   | Key Highlights, masked photo, brush rule      |
| `Section4`         | 1:180 – 1:255    | 2472 – 3346   | Modern Amenities, 8-panel accordion           |
| `Section5`         | 1:256 – 1:288    | 3346 – 3928   | Our Price, two 380×320 cards                  |
| `Section6`         | 1:289 – 1:302    | 3928 – 4686   | Gallery, 1097 + 29 + 226 plates               |
| `Section7`         | 1:306 – 1:389    | 4686 – 5225   | Map, address card, five destination cards     |
| `Section8`         | 1:174 + 1:390    | 5090 – 5803   | Virtual Site Tour header + 672×319 video      |
| `Section9`         | 1:394 – 1:436    | 5863 – 6535   | About Developer + Request a Call Back         |
| `Section10`        | 1:393 – 1:441    | 6535 – 7035   | Footer, disclaimer, bronze copyright bar      |
| `FloatingQueryTab` | 1:118            | —             | Right-edge "Query Now" tab                    |

## Supporting modules

| File               | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `ui/Icons.jsx`     | Every UI glyph, re-exported from `react-icons`              |
| `ui/Buttons.jsx`   | `PillButton` (1:90) and `EllipseLink` (1:94) + `ArrowLong`  |
| `ui/assets.js`     | Registry of the downloaded Figma exports                    |

## Images and icons

Every photograph and illustration is a **real Figma export**, downloaded from
the asset URLs returned by `get_design_context` and committed under
`/public/eldeco-terraNSole/` so nothing depends on the ~7-day URL expiry.
No placeholder artwork exists, and no SVG was hand-authored.

- 15 PNGs — hero, logo, overview plates, highlights background and masked
  photo, amenity photo, pricing background, gallery plates, map, video poster
  and play badge, footer background and footer logo.
- 5 SVGs — all straight from Figma: the highlight alpha mask (1:128), the
  headline bracket rule (1:129), the two button ellipses (1:96 / 1:170) and
  the gallery circle (1:302).

UI icons come from `react-icons`, matched to the family each node name
implies: Remix for `whatsapp-line` and `school-2`, Lucide for `arrow-right`,
`chevron-left/-right`, `map-pin`, `headset`, `check`, `plus`, `star`,
`external-link`, `airplay`, `video` and `circle-x`. The 24×8 hairline arrow in
the buttons is Heroicons' `HiOutlineArrowLongRight`, boxed to 8px of height so
the pill stays exactly 42px tall.

## Typography

Four families, all from the frame and loaded via `next/font/google`:

- **Schibsted Grotesk** — all UI and body copy (Regular…ExtraBold + Italic)
- **Playfair** — display headings, with Figma's `opsz 12 / wdth 100` variation
  settings applied in `app/globals.css`
- **Playfair Display** — the metric rail and the active amenity title
- **Montserrat** — the single `/` glyph in the hero carousel counter

## Colour

Every colour is a token in `app/globals.css` named after its Figma role, and
all 24 hex values plus all 10 rgba values from the frame are verified present
in the compiled CSS.

## Known deviation

**Section 5, card 1 (Figma 1:262)** uses a Figma *shader fill* — an animated
WebGL mesh gradient rendered by `ShaderFill` from Figma's custom-effect
runtime, which does not exist outside Figma. It is reproduced as a static CSS
mesh built from the shader's exact gradient stops (`#FFE99E` → `#8178FF` →
`#FF009B`). This is the one element that is not a literal match.

`FloatingQueryTab` is rendered `fixed`; Figma pins it absolutely because a
static frame cannot express `fixed`, but the name and rotation describe a
fixed side tab.

## Responsive

The Figma file contains only the 1440 desktop frame — there is no tablet or
mobile artboard to match. Desktop reproduces the frame's exact geometry; the
tablet and mobile behaviour below `lg` is derived (the accordion becomes a
vertical list, the nav collapses to a drawer, the card rows reflow).
