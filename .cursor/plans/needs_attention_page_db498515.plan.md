---
name: Needs Attention Page
overview: Implement a new "Needs Attention" prototype page at `/needs-attention` matching the Figma design 1:1, using the project's established patterns (Next.js App Router, Tailwind + inline styles, Open Sans font, shared Header/Sidebar components).
todos:
  - id: sidebar-prop
    content: Add activePage prop to Sidebar component so pages can highlight different menu items
    status: completed
  - id: svg-icons
    content: Create necessary SVG icon files in public/icons/ (filter-alt, search, sort, preview-document, delete, close-small, close-tag, info, chevron-right, pagination arrows)
    status: completed
  - id: page-layout
    content: Create app/needs-attention/page.tsx with Header + Sidebar + main content area shell
    status: completed
  - id: title-search
    content: Implement title bar (Needs Attention + subtitle) and search/filter bar with quick filters
    status: completed
  - id: tabs-toolbar
    content: Implement tabs (All/Job/Communication/Invoice) and action toolbar (Expand all, View object, etc.)
    status: completed
  - id: table-header
    content: Implement table header row with all 8 columns matching Figma widths
    status: completed
  - id: table-rows
    content: Implement 5 data rows with all cell content, first row in selected state
    status: completed
  - id: pagination
    content: Implement pagination bar with page selector dropdown and page number buttons
    status: completed
  - id: validate
    content: Visual validation against Figma screenshot -- spacing, typography, colors, alignment
    status: completed
isProject: false
---

# Needs Attention Page Implementation

## Design Summary (from Figma + comments)

The "Needs Attention" page shows a single flat list of all items tagged with "Needs attention." The system can auto-tag errors/terminal states, and users can add or remove the tag for work items (e.g., overdue) and manage them here. This is a **static prototype** -- no interactivity required beyond visual fidelity.

## Page Structure

The page has the following sections (top to bottom):

1. **Title bar** -- "Needs Attention" (22px) + subtitle "Your queue of Needs attention items" (13px)
2. **Search/filter bar** -- filter icon + "Type to search" input + search icon, with quick filter chips below ("Date: This month", "Date: Last month")
3. **Tabs** -- All (active), Job (2), Communication (2), Invoice (1)
4. **Action toolbar** -- Expand all | View object | Unassigned tag | Add remark | ... | 1 item selected x | settings | info
5. **Data table** with header: checkbox | Type (180px) | ID (120px) | Tags (180px) | Remarks (120px) | Author (180px) | Remark Message (flex) | Date (180px right-aligned)
6. **5 data rows** with sample data (first row selected with blue checkbox and #eee background)
7. **Pagination** -- "25 per page" dropdown + page buttons (|< < [1] 2 ... 76 77 > >|)

## Key Design Tokens

- Title: Open Sans Regular 22px #212121
- Subtitle/labels: Open Sans Regular 13px #212121
- Active tab: Open Sans SemiBold 13px #2e95be, white bg
- Inactive tab: Open Sans SemiBold 13px #40484b, #f0f0f0 bg, #d4d4d4 border
- Toolbar: #f5f5f5 bg, #cfcfcf border, Open Sans SemiBold 13px
- Table header: Rubik Regular 13px #adadad
- Table data: Open Sans Regular 14px #3a3a39 / #212121
- ID column: Open Sans Bold 14px #2e95be (link style)
- "Needs attention" tag: #df4397 bg, white text, Rubik 12px, rounded pill
- Selected row: #eee bg, checkbox #2975d6
- Pagination: Rubik Medium 14px, #d4d4d4 borders, active page rgba(33,33,33,0.12)

## Files to Create/Modify

### New files

- **[app/needs-attention/page.tsx](app/needs-attention/page.tsx)** -- Main page component with all sections. Uses the same shell layout as `app/page.tsx` (Header + Sidebar + main). Contains all sub-components inline (NeedsAttentionContent, TableHeader, TableRow, Pagination, etc.)
- **New SVG icons in `public/icons/`** -- filter-alt.svg, search.svg, sort.svg, preview-document.svg, delete.svg, comment.svg, close-small.svg, close-tag.svg, info.svg, chevron-right.svg, first-page.svg, last-page.svg, chevron-left-page.svg, chevron-right-page.svg

### Modified files

- **[components/Sidebar.tsx](components/Sidebar.tsx)** -- Update the `menuItems` array so that "Needs attention" is marked as `active` instead of "Homepage". Optionally add `href` to enable navigation between pages.

## Implementation Approach

- Follow existing project conventions: Tailwind for layout, inline `style={{}}` for colors/borders
- All content is hardcoded/static (prototype)
- The page will use the same `Header` + `Sidebar` shell as the homepage
- The Sidebar will need to accept an `activePage` prop or the page will use its own sidebar variant
- SVG icons will be created as simple inline SVGs in `public/icons/` matching the Figma asset shapes
- No external dependencies needed
- The comment annotations from Figma describe functionality but are NOT rendered in the UI

## Sidebar Navigation Strategy

Since the sidebar currently hardcodes which item is active, I will either:

- (a) Add an `activePage` prop to Sidebar so different pages can highlight different items, OR
- (b) Create a minimal variant of the sidebar for this page

Option (a) is cleaner and more maintainable. The Sidebar component will accept an optional `activePage` string prop (defaulting to "Homepage") and use it to determine which item gets the active styling.

## Data for Rows

Five rows of hardcoded sample data matching the Figma:


| Type          | ID        | Tag             | Remarks | Author      | Message                              | Date                 |
| ------------- | --------- | --------------- | ------- | ----------- | ------------------------------------ | -------------------- |
| Communication | 185854440 | Needs attention | (4)     | Author name | Rq 04920955 CSE for this customer... | Dec 12, 2025 2:00 PM |
| Communication | 185854440 | Needs attention | (4)     | Author name | Dept 25 - Leader Catherine...        | Dec 13, 2025 2:15 PM |
| Invoice       | 185854440 | Needs attention | (1)     | Author name | - Concerns order 2102742391...       | Dec 15, 2025 2:45 PM |
| Job           | 188087490 | Needs attention | (1)     | Author name | This invoice is a duplicate...       | Dec 14, 2025 2:30 PM |
| Job           | 188087486 | Needs attention | (1)     | Author name | Dept 93 - COMMUNE DE GAGNY...        | Dec 16, 2025 3:00 PM |


Row 1 is in "selected" state (blue checkbox, #eee background).