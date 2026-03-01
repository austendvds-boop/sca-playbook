# ChalkTalk — 3-Feature Blueprint

**Date:** March 1, 2026
**Status:** Ready for implementation
**Stack:** Next.js App Router, TypeScript, Tailwind, Custom SVG canvas, Jotai, Drizzle ORM + Neon

---

## Implementation Order

1. **Formation Save & Templates** — lowest complexity, zero schema migration risk, unblocks coach workflow immediately. No new auth/identity concepts needed.
2. **Wristband Sheet Generator** — builds on existing play library + thumbnail SVG infrastructure. Pure frontend feature with one new DB table. No auth dependency.
3. **Team Sharing & Collaboration** — highest complexity, requires identity system, touches every existing table (adding ownership). Do last so features 1 & 2 ship independently.

---

## Feature 1: Formation Save & Templates

### User Stories

1. **As a coach**, I want to save my current player positions as a named formation so I can reuse it as a starting point for new plays.
2. **As a coach**, I want to load a saved formation onto the canvas, replacing the current players, so I can quickly start diagramming from a known alignment.
3. **As a coach**, I want to rename, duplicate, and delete saved formations so I can keep my library organized.
4. **As a coach**, I want my saved formations to appear alongside the built-in presets so I don't have to look in two different places.
5. **As a coach**, I want formations to save only player positions (no routes/zones/text) so they stay clean and reusable.

### DB Schema Changes

```typescript
// New table in src/db/schema.ts
import { boolean, integer } from 'drizzle-orm/pg-core';

export const formations = pgTable('formations', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id'),                          // nullable until Feature 3
  createdBy: text('created_by'),                     // nullable until Feature 3
  name: text('name').notNull(),
  side: text('side').notNull(),                      // 'offense' | 'defense'
  playerData: jsonb('player_data').notNull(),         // PlayerElement[] (positions only)
  isPreset: boolean('is_preset').default(false),      // system presets vs user-created
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**playerData shape:** Array of `{ id, type: 'player', x, y, position, side }` — identical to PlayerElement from store.ts. No routes, zones, or text elements.

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/formations` | List all formations (filter by `?side=offense`) |
| POST | `/api/formations` | Create new formation |
| PATCH | `/api/formations/[id]` | Rename formation |
| DELETE | `/api/formations/[id]` | Delete formation |
| POST | `/api/formations/[id]/duplicate` | Duplicate formation |

### Component Architecture

**New Components:**
- `src/components/canvas/FormationPanel.tsx` — slide-out panel listing presets + saved formations, with Save Current button
- `src/components/canvas/FormationCard.tsx` — single formation preview (mini SVG of player dots) with context menu (rename/delete/duplicate)
- `src/components/canvas/SaveFormationDialog.tsx` — modal: name input, offense/defense toggle, save button

**Modified Components:**
- `CanvasToolbar.tsx` — add formation panel toggle button (replaces or augments existing preset dropdown)

**New Jotai Atoms:**
```typescript
// src/atoms/formations.ts
export const savedFormationsAtom = atom<Formation[]>([]);
export const formationPanelOpenAtom = atom<boolean>(false);
```

### UI/UX Flow (iPad-optimized)

1. Coach taps **Formation** button in toolbar -> slide-out panel appears from left edge
2. Panel shows two sections: **Built-in** (18 presets, read-only) and **My Formations** (user-saved)
3. Each formation shows a mini dot-preview (just colored circles on a mini field)
4. **Tap** a formation -> confirmation dialog "Load formation? This will replace current players." -> confirm -> canvas players replaced, routes/zones/text preserved OR cleared (user choice via toggle)
5. **Save Current** button at panel top -> opens SaveFormationDialog -> coach names it, picks offense/defense -> saves
6. **Long-press** (or ... menu) on a saved formation -> rename / duplicate / delete
7. Panel is dismissible by tapping outside or swiping left
8. Touch targets >= 44x44px throughout

### Risks & Gotchas

- **What constitutes current players?** Only PlayerElement items from elementsAtom. Filter by type === 'player' when saving.
- **Loading behavior ambiguity:** Does loading a formation clear routes too? Default: clear everything (full reset). Add a Keep routes toggle later if requested.
- **Preset migration:** Existing 18 presets in presets.ts should remain hardcoded. Don't migrate them into DB — they're static and don't need CRUD.
- **ID collision on load:** When loading a formation, generate new UUIDs for each player element to avoid ID collisions with existing canvas state.

---

## Feature 2: Wristband Sheet Generator

### User Stories

1. **As a coach**, I want to create a wristband sheet by selecting plays from my library and arranging them in a grid, so my QB can reference plays during the game.
2. **As a coach**, I want each cell on the wristband to show the play name and a mini diagram thumbnail, so players can quickly identify plays.
3. **As a coach**, I want to print the wristband sheet at the correct physical dimensions (fits in a wristband sleeve), so I can cut and use it on game day.
4. **As a coach**, I want to create multiple wristband types (QB, OL, WR) with different play selections, so each position group gets relevant calls.
5. **As a coach**, I want to reorder plays on the wristband by dragging, so I can organize by situation (1st down, 3rd short, red zone, etc.).

### DB Schema Changes

```typescript
export const wristbands = pgTable('wristbands', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id'),                          // nullable until Feature 3
  name: text('name').notNull(),                      // "QB Wristband - Week 4"
  bandType: text('band_type').notNull(),              // 'qb' | 'ol' | 'wr' | 'custom'
  gridRows: integer('grid_rows').notNull().default(5),
  gridCols: integer('grid_cols').notNull().default(5),
  cells: jsonb('cells').notNull(),                    // WristbandCell[]
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**cells shape:**
```typescript
type WristbandCell = {
  index: number;           // 0-based grid position (row-major)
  playId: string | null;   // reference to plays.id
  label: string;           // custom label override (defaults to play name)
  color?: string;          // optional cell background color for situation grouping
};
```

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/wristbands` | List all wristband sheets |
| POST | `/api/wristbands` | Create new wristband |
| PATCH | `/api/wristbands/[id]` | Update wristband (cells, name, grid size) |
| DELETE | `/api/wristbands/[id]` | Delete wristband |
| POST | `/api/wristbands/[id]/duplicate` | Duplicate wristband |

### Component Architecture

**New Components:**
- `src/app/wristbands/page.tsx` — wristband list page
- `src/app/wristbands/[id]/page.tsx` — wristband editor page
- `src/components/wristband/WristbandEditor.tsx` — main editor: grid layout + play picker sidebar
- `src/components/wristband/WristbandGrid.tsx` — the grid itself (CSS Grid, drag-to-reorder via dnd-kit)
- `src/components/wristband/WristbandCell.tsx` — single cell: play name + mini SVG thumbnail
- `src/components/wristband/PlayPicker.tsx` — sidebar listing available plays (tap to assign to selected cell)
- `src/components/wristband/WristbandPrintView.tsx` — print-optimized layout (hidden on screen, visible in print CSS)
- `src/components/wristband/GridSizeSelector.tsx` — dropdown/stepper for rows x cols

**Modified Components:**
- `ConditionalNav.tsx` — add Wristbands nav link
- `src/app/layout.tsx` — add wristbands route

**New Jotai Atoms:**
```typescript
// src/atoms/wristband.ts
export const wristbandCellsAtom = atom<WristbandCell[]>([]);
export const selectedCellIndexAtom = atom<number | null>(null);
export const gridConfigAtom = atom<{ rows: number; cols: number }>({ rows: 5, cols: 5 });
```

### UI/UX Flow (iPad-optimized)

1. Coach navigates to **Wristbands** from nav -> sees list of saved wristbands + New Wristband button
2. Tap New Wristband -> enters name, selects type (QB/OL/WR/Custom), picks grid size (5x5 default) -> creates and opens editor
3. Editor layout (landscape iPad): **left 60%** = wristband grid preview, **right 40%** = play picker sidebar
4. **Assigning plays:** Tap an empty cell in the grid (highlights it) -> tap a play in the picker -> play fills the cell with name + thumbnail
5. **Reordering:** Long-press a filled cell -> drag to swap with another cell (dnd-kit SortableContext)
6. **Cell customization:** Tap a filled cell -> inline edit label, pick background color (for situation grouping: green=1st down, yellow=3rd down, red=red zone)
7. **Grid resize:** Stepper controls for rows/cols (3-8 range). Warns if shrinking would remove populated cells.
8. **Print:** Print button -> switches to WristbandPrintView (full-screen print layout) -> triggers window.print()
9. Auto-saves on every change (debounced 1s PATCH)

### Print/Export Approach

**Browser Print CSS approach** (no jsPDF needed for MVP):

```css
@media print {
  /* Hide everything except the wristband grid */
  body > *:not(.wristband-print) { display: none !important; }
  
  .wristband-print {
    width: 4in;
    height: 5.5in;
    margin: 0;
    padding: 0.1in;
    page-break-after: always;
  }
  
  .wristband-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    width: 100%;
    height: 100%;
    border: 1px solid #000;
  }
  
  .wristband-cell {
    border: 0.5px solid #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1px;
    font-size: 6pt;
    font-weight: bold;
  }
  
  .wristband-cell svg {
    width: 90%;
    height: auto;
    max-height: 70%;
  }
}
```

**Physical dimensions:** Standard football wristband insert = ~4in x 5.5in. The print CSS sets this as the page size. Coach prints, cuts, and inserts into wristband sleeve.

**Thumbnail SVG:** Already stored in plays.thumbnailSvg column. Render inline in each cell. If thumbnail is missing, show play name only.

**Future upgrade path:** Add jsPDF export for coaches who want a downloadable PDF without browser print dialog. Defer to post-MVP.

### Risks & Gotchas

- **Thumbnail SVG quality at small size:** Current thumbnails may have stroke widths that are too thick at wristband cell size. May need a viewBox adjustment or a separate mini thumbnail generator.
- **Print CSS cross-browser:** Safari on iPad handles @media print differently. Test with iPad Safari's Print option (Share -> Print). May need -webkit-print-color-adjust: exact for cell background colors.
- **dnd-kit on iPad:** Already in the project. Touch drag works but needs useSensor(TouchSensor) with appropriate activationConstraint (delay: 150ms) to distinguish scroll from drag.
- **Orphaned play references:** If a play is deleted, wristband cells referencing it become stale. Handle gracefully: show Deleted play placeholder in cell, allow reassignment.
- **Grid size limits:** Cap at 8x8 (64 cells). Beyond that, cells become too small to read on a wristband.

---

## Feature 3: Team Sharing & Collaboration

### User Stories

1. **As a head coach**, I want to create a team and invite my staff with a join code, so we can share a play library without complex setup.
2. **As a coordinator**, I want to see and edit all shared plays in the team library, so I can contribute to the playbook.
3. **As a position coach**, I want to view shared plays and leave comments/notes, so I can study the playbook without accidentally changing anything.
4. **As a coach**, I want to keep some plays private (not shared with the team), so I can experiment without cluttering the team library.
5. **As a head coach**, I want to manage team members (change roles, remove coaches), so I can control access to the playbook.

### DB Schema Changes

```typescript
// New table: coaches (lightweight identity — no auth provider yet)
export const coaches = pgTable('coaches', {
  id: uuid('id').defaultRandom().primaryKey(),
  displayName: text('display_name').notNull(),
  email: text('email'),                              // optional, for invite flow
  localIdentity: text('local_identity').notNull(),    // random token stored in localStorage
  createdAt: timestamp('created_at').defaultNow(),
});

// New table: team_members (join table)
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  coachId: uuid('coach_id').notNull().references(() => coaches.id),
  role: text('role').notNull(),                       // 'owner' | 'coordinator' | 'viewer'
  joinedAt: timestamp('joined_at').defaultNow(),
});

// New table: team_invites
export const teamInvites = pgTable('team_invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  code: text('code').notNull().unique(),              // 6-char alphanumeric join code
  role: text('role').notNull().default('viewer'),      // role assigned on join
  expiresAt: timestamp('expires_at'),                  // nullable = no expiry
  usedBy: uuid('used_by'),                            // set when consumed
  createdAt: timestamp('created_at').defaultNow(),
});

// Modify existing tables:
// plays — add createdBy and isPrivate
// plays.createdBy: uuid('created_by')                // references coaches.id
// plays.isPrivate: boolean('is_private').default(false)
// teams — add ownerId: uuid('owner_id')
```

**Migration plan:**
1. Add coaches table
2. Add team_members table
3. Add team_invites table
4. ALTER plays: add created_by uuid, add is_private boolean default false
5. ALTER teams: add owner_id uuid (references coaches)
6. Existing plays get is_private = false (shared by default in existing teams)

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/coaches` | Register/identify (creates coach record, returns ID + token) |
| GET | `/api/coaches/me` | Get current coach from localStorage token |
| POST | `/api/teams` | Create team (current coach becomes owner) |
| GET | `/api/teams/[id]` | Get team details + member list |
| PATCH | `/api/teams/[id]` | Update team name/settings |
| POST | `/api/teams/[id]/invite` | Generate join code |
| POST | `/api/teams/join` | Join team via code |
| PATCH | `/api/teams/[id]/members/[coachId]` | Change member role |
| DELETE | `/api/teams/[id]/members/[coachId]` | Remove member |

### Component Architecture

**New Components:**
- `src/app/team/page.tsx` — team management page
- `src/app/team/join/page.tsx` — join-by-code page
- `src/components/team/TeamSetup.tsx` — create team + set display name (first-time flow)
- `src/components/team/MemberList.tsx` — list team members with role badges
- `src/components/team/InviteDialog.tsx` — generate + display join code (with copy button)
- `src/components/team/RoleSelector.tsx` — dropdown to change member roles
- `src/components/team/IdentityBanner.tsx` — shows Logged in as [name] at top of app

**Modified Components:**
- `src/app/plays/page.tsx` — add Private toggle on plays, filter by team context
- `CanvasToolbar.tsx` — show Private badge on private plays
- `ConditionalNav.tsx` — add Team nav link, show team name
- `src/app/layout.tsx` — wrap in identity provider (Jotai atom hydration from localStorage)

**New Jotai Atoms:**
```typescript
// src/atoms/identity.ts
export const currentCoachAtom = atom<Coach | null>(null);
export const currentTeamAtom = atom<Team | null>(null);
export const teamMembersAtom = atom<TeamMember[]>([]);
export const coachRoleAtom = atom<'owner' | 'coordinator' | 'viewer' | null>((get) => {
  const coach = get(currentCoachAtom);
  const members = get(teamMembersAtom);
  if (!coach) return null;
  const membership = members.find(m => m.coachId === coach.id);
  return membership?.role ?? null;
});
```

### UI/UX Flow (iPad-optimized)

**First-time setup (no team yet):**
1. Coach opens app -> sees Welcome screen -> enters display name -> app generates localIdentity token, stores in localStorage, creates coaches record
2. Coach taps Create Team -> enters team name -> team created, coach is owner
3. OR coach taps Join Team -> enters 6-char code -> joins existing team

**Invite flow:**
1. Owner/coordinator taps Team in nav -> team management page
2. Taps Invite Coach -> dialog shows auto-generated 6-char code (e.g., ABC123)
3. Owner picks role for invitee (coordinator or viewer)
4. Owner shares code via text/message (manual — no email integration for MVP)
5. Invitee opens app -> Join Team -> enters code -> joined with assigned role

**Shared plays:**
1. Play library shows all team plays (where isPrivate = false)
2. Coach can toggle a play as Private (only visible to them)
3. Coordinators can create/edit shared plays
4. Viewers can view shared plays but cannot edit (canvas tools disabled, View Only banner)
5. Owner can edit anything

**Role enforcement:**
| Action | Owner | Coordinator | Viewer |
|--------|-------|-------------|--------|
| Create/edit plays | Yes | Yes | No |
| Delete plays | Yes | Own only | No |
| Create formations | Yes | Yes | No |
| Create wristbands | Yes | Yes | Yes (personal) |
| Manage team | Yes | No | No |
| Invite members | Yes | Yes | No |

### Identity System (MVP — no auth provider)

**How it works:**
1. First visit: app generates a UUID token, stores in localStorage as chalktalk_identity
2. This token maps to a coaches record in the DB
3. All API requests include x-coach-token header (or cookie)
4. Server looks up coach by localIdentity field

**Why not real auth for MVP:**
- No email verification, no password management, no OAuth setup
- Coach loses access if they clear localStorage (acceptable for MVP — they can rejoin via code)
- Upgrade path: add NextAuth.js or Clerk later, link existing coach records by email

**Security tradeoff:** Anyone with the token can impersonate. Acceptable for a coaching tool where the threat model is low. Real auth comes when monetization starts.

### Risks & Gotchas

- **localStorage identity is fragile:** If a coach clears browser data, they lose their identity. Mitigation: Recovery code they can write down (the UUID itself). Future: add email-based recovery.
- **Concurrent editing:** Two coordinators editing the same play simultaneously will overwrite each other (last-write-wins). Not a problem for MVP — coaching staffs rarely edit the same play at the same time. Future: add optimistic locking via updatedAt timestamp comparison.
- **Migration of existing data:** Existing plays/teams have no createdBy. Migration should set all existing plays to the team owner's coach ID.
- **Team deletion:** Don't support for MVP. If a head coach leaves, the team persists. Handle manually if needed.
- **API route protection:** Every mutating endpoint must check x-coach-token -> look up coach -> verify team membership + role. Middleware pattern recommended.
- **Multiple teams:** A coach can only belong to one team for MVP. Simplifies UI significantly. Multi-team support is a future feature.

---

## Cross-Feature Considerations

### Navigation Updates
Current nav has: Home, Plays, Documents. After all 3 features:
- Home (dashboard)
- Plays
- Formations (or merged into canvas panel)
- Wristbands
- Documents
- Team (settings/members)

### Shared Infrastructure
- **API middleware for identity:** Create src/lib/auth.ts with getCoachFromRequest(req) helper used by all routes
- **Permission checker:** canEdit(coach, team), canManage(coach, team) utility functions
- **Debounced auto-save pattern:** Reuse across wristband editor and play editor

### Migration Strategy
Run migrations sequentially via Drizzle Kit:
1. npx drizzle-kit push after each schema change
2. No down migrations for MVP — forward-only
3. Test on Neon branch before pushing to production

---

## Environment Variables

| Variable | Secret? | Exists? | Notes |
|----------|---------|---------|-------|
| DATABASE_URL | Yes | Already in .env.local | Neon connection string |
| NEXT_PUBLIC_APP_URL | No | Add | Base URL for invite links (e.g., https://sca-playbook.vercel.app) |

No new secrets needed. The identity system is token-based with no external auth provider. All data stays in the existing Neon database.

---

## Summary

| Feature | New Tables | New Routes | Complexity | Est. Effort |
|---------|-----------|------------|------------|-------------|
| Formation Save | 1 (formations) | 5 | Low | 1-2 days |
| Wristband Generator | 1 (wristbands) | 5 | Medium | 2-3 days |
| Team Sharing | 3 (coaches, team_members, team_invites) + ALTER plays, teams | 9 | High | 3-5 days |

**Total estimated effort: 6-10 days of coder time.**

Build order: Formations -> Wristbands -> Team Sharing. Each feature is independently deployable.
