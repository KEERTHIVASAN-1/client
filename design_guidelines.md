# Design Guidelines: Premium Hostel Management System

## Design Approach

**Selected Framework:** Modern SaaS Design System (Linear + Vercel + Notion inspired)
**Rationale:** Information-dense management interface requiring exceptional data clarity, efficient workflows, and professional aesthetics. The dark-first luxury requirement aligns with modern productivity tools that reduce eye strain during extended use.

## Core Design Principles

1. **Data Clarity Above All:** Every table, chart, and form must prioritize readability and scannability
2. **Role-Based Visual Hierarchy:** Admin/Warden/Student interfaces share design language but emphasize different data densities
3. **Luxury Through Restraint:** Premium feel achieved through precise spacing, refined typography, and subtle depth—not decoration
4. **Solid Foundation:** Glassmorphism effects used sparingly for depth; all interactive surfaces (forms, modals, cards) use solid/semi-opaque backgrounds for readability

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for Student IDs, numerical data)

**Hierarchy:**
- Dashboard Titles: text-2xl font-semibold
- Section Headers: text-lg font-medium
- Card Titles: text-base font-medium
- Body Text: text-sm font-normal
- Data Labels: text-xs font-medium uppercase tracking-wide
- Table Headers: text-xs font-semibold uppercase
- Student IDs/Codes: font-mono text-sm

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 to gap-6
- Table cell padding: p-3 to p-4

**Grid Structure:**
- Dashboard KPIs: 4-column grid on desktop (grid-cols-4), 2-col on tablet, 1-col on mobile
- Data tables: Full-width with horizontal scroll on mobile
- Forms: Single column max-w-2xl for readability
- Block overview cards: 2x2 grid for 4 blocks

## Component Library

### Navigation & Layout
**Sidebar:**
- Width: 280px desktop, collapsible to 64px (icon-only)
- Role-based menu items with icons from Heroicons
- Active state: subtle background glow + left border accent
- Smooth expand/collapse animation (Framer Motion)

**Top Navbar:**
- Height: 64px
- Floating effect with subtle bottom shadow
- Right section: theme toggle, notifications bell, user avatar dropdown
- Breadcrumb navigation for context

### Dashboard Components
**KPI Cards:**
- Solid background with subtle border
- Icon + label + large number layout
- Optional trend indicator (up/down arrow with percentage)
- Hover: slight elevation lift

**Charts (Recharts):**
- Contained in cards with solid backgrounds
- Minimal grid lines, emphasized data points
- Consistent color coding across dashboard
- Tooltips on hover with detailed info

**Block Overview Cards:**
- 2x2 grid displaying Blocks A/B/C/D
- Each card: Block name, student count, room count, warden info
- Click to drill down into block details

### Data Display
**Tables:**
- Striped rows for scannability (subtle alternating background)
- Fixed header on scroll
- Column headers: sortable with up/down indicators
- Pagination at bottom: show 10/25/50 per page
- Search bar: prominent placement with Heroicons search icon
- Filters: chip-based selections above table
- Row actions: icon buttons (edit, delete, view) aligned right
- Student ID column: monospace font, slightly emphasized

**Profile Drawers:**
- Slide from right (500px width)
- Solid background with overlay backdrop
- Header: Student ID + Name + Status badge
- Organized sections with clear dividers
- Quick actions at top
- Close button (X icon) top-right

### Forms & Inputs
**Form Layout:**
- Vertical stacking with consistent spacing (space-y-4)
- Labels: text-sm font-medium above inputs
- Required field indicator: red asterisk
- Floating validation errors below inputs
- Submit button: prominent, full-width or right-aligned

**Input Fields:**
- Solid background with border
- Focus: border color change + subtle glow
- Height: h-10 for consistency
- Rounded corners: rounded-md
- Icons inside inputs where appropriate (search, calendar)

**Dropdowns/Selects:**
- Custom styled with Heroicons chevron-down
- Options list: solid background, subtle shadow
- Selected state: checkmark icon

**Date Pickers:**
- Calendar overlay with month/year navigation
- Selected date: highlighted background
- Range selection for date filters

### Interactive Elements
**Buttons:**
- Primary: solid background, medium font-weight
- Secondary: outlined variant
- Destructive: red variant for delete actions
- Icon buttons: square with rounded corners
- Heights: h-9 to h-10
- Hover: slight brightness increase
- Active: scale-95 press effect

**Badges:**
- Status indicators: rounded-full px-3 py-1 text-xs
- Color-coded: green (active/paid), yellow (pending), red (overdue/absent), gray (inactive)
- Present in tables and profile views

**Toggle Switches:**
- Attendance marking: large touch-friendly toggles
- Settings: smaller inline toggles
- Smooth slide animation

### Modals & Overlays
**Modal Windows:**
- Centered on screen, max-w-lg to max-w-2xl
- Solid background (NOT transparent)
- Rounded corners: rounded-lg
- Padding: p-6
- Header with title + close button
- Footer with action buttons (Cancel + Confirm)
- Backdrop: semi-transparent dark overlay

**Notifications/Toasts:**
- Slide from top-right
- Auto-dismiss after 4 seconds
- Color-coded by type: success (green), error (red), info (blue)
- Icons from Heroicons

## Visual Treatment

**Dark Theme (Primary):**
- Background layers: Use distinct shades for depth
- Card backgrounds: Solid with subtle transparency where appropriate
- Text: High contrast white/gray scale
- Borders: Subtle, using gray-800/gray-700 range
- Glassmorphism: Only for sidebar and floating navbar (backdrop-blur)

**Depth & Shadows:**
- Cards: subtle shadow-md
- Elevated elements: shadow-lg
- Floating elements: shadow-xl
- NO drop shadows on tables (keep clean)

**Borders & Dividers:**
- Card borders: border border-gray-800
- Section dividers: border-t border-gray-800
- Table borders: border-b on rows

## Animation Specifications

**Page Transitions:**
- Fade + slight slide (20px) on route change
- Duration: 300ms
- Easing: ease-out

**Micro-interactions:**
- Button hover: 150ms scale
- Card hover: 200ms elevation
- Drawer slide: 300ms ease-in-out
- Modal fade: 200ms

**Loading States:**
- Skeleton screens for tables
- Spinner for async actions
- Progress bars for multi-step forms

**Three.js Background:**
- Subtle particle field or geometric pattern
- Slow movement (barely perceptible)
- Low opacity, never distracting
- Disabled on mobile for performance

## Role-Specific Design Adaptations

**Admin Interface:**
- Highest information density
- Multi-column layouts for system overview
- Advanced filtering and bulk actions
- Full-width dashboards with 8-12 KPI cards

**Warden Interface:**
- Focused on single block data
- Attendance marking emphasized (large, touch-friendly)
- Student contact info readily accessible
- Simplified navigation (fewer menu items)

**Student Interface:**
- Personal data focus, minimal density
- Card-based layout for different sections
- Large, clear status indicators
- Mobile-first considerations (students on phones)

## Responsive Behavior

**Breakpoints:**
- Mobile: < 640px (single column, stacked)
- Tablet: 640px-1024px (2-column grids)
- Desktop: > 1024px (full layouts)

**Mobile Adaptations:**
- Sidebar: Full-screen overlay when open
- Tables: Horizontal scroll or card view
- Multi-column grids: Stack to single column
- Touch targets: Minimum 44px height

## Accessibility

**Standards:** WCAG 2.1 AA compliance
- Color contrast: 4.5:1 minimum for text
- Focus indicators: visible 2px outline
- Keyboard navigation: full support with logical tab order
- Screen reader: Proper ARIA labels on all interactive elements
- Form errors: Announced to screen readers

## Images

**No hero images required.** This is a data-focused management system. Images used only for:
- User avatars (profile photos)
- Document upload previews
- Empty state illustrations (optional, simple line art)

All imagery should be minimal and functional, not decorative.