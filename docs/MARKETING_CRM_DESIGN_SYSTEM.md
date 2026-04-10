# Marketing ↔ CRM design system (Void Luxe)

Single reference for styling the **CRM app** and **auth** to match the **marketing site**. Source of truth for CSS utilities: [`src/app/marketing.css`](../src/app/marketing.css). Global base tokens: [`src/app/globals.css`](../src/app/globals.css).

## Brand & logo

- **Wordmark only**: use the shared [`BrandWordmark`](../src/components/brand-wordmark.tsx) component. Do **not** use `/logo.png` (legacy bird) in CRM chrome.
- **Markup** (must stay aligned with marketing side nav):

```tsx
<span className="font-heading font-bold text-lg leading-tight tracking-[0.06em] text-foreground block">
  NEW LEGACY AI
</span>
```

- Optional: `compact` prop uses slightly smaller type in tight sidebars.

## Color tokens

| Token | Value | Use |
|--------|--------|-----|
| `--background` | `#09090b` | Page base |
| `--foreground` | `#fafafa` | Primary text |
| `--aurora-cyan` | `#22d3ee` | Accents, gradient start |
| `--aurora-teal` | `#2dd4bf` | Gradients, borders |
| `--aurora-violet` | `#a78bfa` | Primary accent, focus, links |
| `--aurora-purple` | `#c084fc` | Gradients |
| `--aurora-magenta` | `#e879f9` | Gradient end / highlights |
| `--crm-accent` | `var(--aurora-violet)` | Semantic alias in globals |

**Primary actions**: cyan → violet gradient (see marketing `NeonButton` solid variant) or `violet-500` / `violet-400` for solid fills.

**Focus rings**: `violet-500` / `violet-400` with `ring-offset-zinc-950` — not amber.

## Surfaces

- **Galaxy frame**: outer `rounded-[1.25rem]` or `rounded-[1.5rem]` + class `border-galaxy-neon`.
- **Glass fill**: inner `card-galaxy-glass` + `ring-1 ring-white/[0.08]`.
- **Simple panels**: `border border-white/[0.06]`, `bg-zinc-900/40`, `backdrop-blur-xl`.
- **Atmosphere** (full-page): `.crm-app-atmosphere` in `marketing.css` — radial indigo/teal/violet over `#09090b`.

## Typography

- **Body**: `font-sans` (Inter via `--font-sans`).
- **Headings / brand**: `.font-heading` — uses `--font-heading` (aliased to Space Grotesk `--font-display` in globals).

## Deprecated (do not use for brand)

- **`/logo.png`** in app shell, login, signup.
- **Amber** (`amber-500`, `amber-600`, etc.) for **brand** CTAs, default buttons, sidebar active state, form focus rings, spinners — replaced with violet/cyan/gradient.

## Status & data semantics

Amber in **tables/badges** sometimes meant **stage** (e.g. negotiation) or **attention** (e.g. no_answer). Those are **not** bird-logo brand — prefer:

- **Violet** / **violet-400** for in-progress / highlighted rows where we want brand consistency, or
- **Orange** / **yellow** only when a true warning/pending semantic is required (distinct from old gold CTA).

Document per-feature if you introduce new status palettes.

## References

- Marketing forms / focus: [`src/lib/marketing-form-classes.ts`](../src/lib/marketing-form-classes.ts)
- Neon CTA pattern: [`src/components/ui/neon-button.tsx`](../src/components/ui/neon-button.tsx)
