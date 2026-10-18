---
version: alpha
name: Apple-design-analysis
description: Photography-first museum-gallery marketing. SF Pro Display headlines, Action Blue #0066cc, alternating light/dark tiles.
source: https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/apple/DESIGN.md
installed: npx getdesign@latest add apple (tokens hand-applied; CLI timed out in sandbox)
colors:
  primary: "#0066cc"
  primary-focus: "#0071e3"
  primary-on-dark: "#2997ff"
  ink: "#1d1d1f"
  divider-soft: "#f0f0f0"
  hairline: "#e0e0e0"
  canvas: "#ffffff"
  canvas-parchment: "#f5f5f7"
  surface-pearl: "#fafafc"
  surface-tile-1: "#272729"
  surface-tile-2: "#2a2a2c"
  surface-black: "#000000"
  on-primary: "#ffffff"
typography:
  hero-display: SF Pro Display 600 56px / 1.07 / -0.28px
  display-lg: SF Pro Display 600 40px / 1.1
  body: SF Pro Text 400 17px / 1.47 / -0.374px
  caption: SF Pro Text 400 14px / 1.43
  nav-link: SF Pro Text 400 12px
rounded:
  xs: 5px / sm: 8px / md: 11px / lg: 18px / pill: 9999px
rules:
  - single interactive color Action Blue; no decorative gradients
  - chrome has no shadows; one drop-shadow reserved for product imagery
  - headlines SF Pro Display 600 negative tracking; body SF Pro Text 17px
  - min touch target 44x44px; primary pill buttons
  - alternate light/dark tiles for emphasis before adding chrome
  - backdrop blur baseline: saturate(180%) blur(20px)
