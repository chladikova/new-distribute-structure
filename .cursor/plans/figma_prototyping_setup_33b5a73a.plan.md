---
name: Figma prototyping setup
overview: Set up a Next.js + Tailwind project from scratch and implement the "Homepage" design from Figma as a pixel-perfect desktop prototype, excluding comment/annotation overlays.
todos:
  - id: setup-nextjs
    content: Initialize Next.js project with TypeScript, Tailwind, and Open Sans font configuration
    status: completed
  - id: download-assets
    content: Download all icon/image assets from Figma MCP URLs into public/icons/
    status: completed
  - id: implement-header
    content: "Build Header component matching Figma: logo area, nav tabs, icon buttons"
    status: completed
  - id: implement-sidebar
    content: "Build Sidebar component matching Figma: menu items, expandable groups, footer"
    status: completed
  - id: implement-homepage
    content: Assemble page.tsx with Header, Sidebar, and main content placeholder
    status: completed
  - id: validate-visuals
    content: Compare rendered output against Figma screenshot, fix any pixel discrepancies
    status: completed
isProject: false
---

# Figma Design Prototyping Setup

## Design Analysis

The Figma design (node `4643:116136`) is an application shell called "Homepage" consisting of three main regions:

- **Top header bar** (50px): gradient logo area (250px) + dark nav bar (#40484b) with tabs and icon buttons
- **Left sidebar** (246px): hierarchical menu with expandable sections, separator lines, and a footer
- **Main content area**: grey background (#f5f5f5) with a dashed-border placeholder

**Excluded elements:** All "II-Comment" components (purple-bordered annotation overlays with `data-name="II-Comment"`) are designer notes and must NOT be rendered.

**Reference:** An old version of the app is running in the browser and can be used as a visual reference if any detail in the Figma design is unclear (e.g., icon appearance, spacing nuances, interaction patterns). However, the new Figma design is the primary source of truth -- only fall back to the browser for clarification, not as a design spec.

## Design Tokens

- **Font:** Open Sans (Regular 400, Bold 700)
- **Colors:**
  - Header gradient: `#095a66` to `#0daeb2`
  - Active tab / sidebar accent: `#098294`
  - Header bg / text dark: `#40484b`
  - Borders: `#e9e9e9`, `#c9c9c9`
  - Content bg: `#f5f5f5`
  - Footer text: `#aeaeae`
  - Placeholder accent: `#2e95be`

## Project Setup

1. Initialize a Next.js app (App Router) with TypeScript and Tailwind v4 in the workspace root
2. Install `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`
3. Add Google Font "Open Sans" via `next/font/google`
4. Configure Tailwind with custom theme colors matching the design tokens above

## Page Implementation

Create a single page at `app/page.tsx` containing three components:

### Header (`components/Header.tsx`)

- Fixed 50px height, full width
- Left section (250px): gradient bg (`#095a66` -> `#0daeb2`), Distribute logo image from Figma asset URL
- Right section: dark bg (#40484b), flex layout
  - Left-aligned nav tabs: "CONTROL CENTER" (active, `#098294` bg), "ADMINISTRATION" (inactive, 75% opacity)
  - Right-aligned icon buttons: APPS, SETTINGS, ? (help icon), "Name Surname" with dropdown arrow
  - Each button separated by 0.5px left border (`#c9c9c9`)
  - All text: Open Sans Regular 13px, uppercase, white

### Sidebar (`components/Sidebar.tsx`)

- Fixed 246px width, white bg, right border (`#e9e9e9`)
- Full remaining height below header
- Menu item types:
  - **Parent items** (60px tall): icon + bold label, optional expand chevron
  - **Sub-items** (40px tall): indented with 20px placeholder, regular weight
  - **Active state** (Homepage): 4px left teal border (`#098294`)
- Sections separated by 1px horizontal lines (from Figma line asset)
- Expandable groups: Preparation (Jobs, Presets, Logs), Production (Communications, Reports), Domain (Invoices, Payments)
- Footer: pinned to bottom, "Quadient, Copyright (c) 2026" in 12px grey (#aeaeae), top border

### Main Content Area

- Fills remaining space, grey bg (`#f5f5f5`), 64px padding
- Contains centered placeholder box: white bg, 4px dashed blue border (`#2e95be`), rounded-24px, 40% opacity
- Text "HOMEPAGE PLACEHOLDER" in Open Sans Bold 48px, blue (#2e95be)

## Icons Strategy

Download SVG icon assets from Figma MCP asset URLs and save them locally in `public/icons/`. This avoids reliance on expiring remote URLs. Icons needed:

- Distribute logo, home, dashboard, assignment, construction, production (sync), insert_drive_file, expand_more, apps, settings, help, user, arrow_drop_down|

## File Structure

```
app/
  layout.tsx          -- root layout with Open Sans font, html/body setup
  page.tsx            -- homepage assembling Header + Sidebar + Content
  globals.css         -- Tailwind imports + custom CSS variables
components/
  Header.tsx          -- top navigation bar
  Sidebar.tsx         -- left navigation menu
public/
  icons/              -- downloaded SVG assets
```

