# no spy

A small, browser-only link cleaner built with Next.js App Router, TypeScript, official shadcn/ui components, Tailwind CSS, and Bun.

## Run locally

Requires Bun 1.4+ and Node.js 20.9+.

```sh
bun install --frozen-lockfile
bun run dev
```

Open the local URL printed by Next.js.

## Build and preview

```sh
bun run build
bun run preview
```

The optimized static website is exported to `out/`. Deploy that directory to a static host. `bun run start` also serves the static build locally.

## Check

```sh
bun test
bun run typecheck
bun run check
```

Biome handles formatting, linting, and import organization. The project uses tabs with width 4, shared through `biome.json` and `.editorconfig`. Run `bun run format` to format or `bun run check:fix` to apply safe formatting and lint fixes.

Paste links directly into the input with Ctrl+V, ⌘V, or your device's native paste action. The app never asks to read your clipboard, so it does not trigger a browser clipboard-permission menu.

## Cleaning behavior

- Removes `utm_*`, common advertising click IDs, email tracking IDs, and platform-specific share/affiliate IDs.
- Removes `a`, `s`, and `t` share parameters on Twitter/X domains only. Useful parameters such as search terms and video timestamps are preserved.
- Preserves unknown parameters, query encoding, repeated values, resource IDs, and fragments by default.
- “Remove all parameters” removes the entire query, including functional search terms or video IDs. Fragments are preserved.
- Accepts HTTP and HTTPS links, including addresses pasted without a scheme.
- Never fetches, expands, uploads, or stores pasted links. No accounts or app cookies.
- Does not remove tracking embedded in paths/fragments, inspect shortened links, or provide browsing anonymity.

All cleaning logic is in `lib/clean-url.ts`; the interface is in `app/page.tsx`. Colors, pills, spacing, and responsive rules are in `app/globals.css`.

## Vercel Web Analytics

The source includes the official `@vercel/analytics/next` integration in the root layout. It activates when built on Vercel (`VERCEL=1`). It is disabled for local builds and ChatGPT Sites, which do not provide Vercel's analytics endpoints.

To collect traffic stats:

1. Import this source into a Vercel project using the Next.js preset and Bun.
2. Enable **Web Analytics** in that project's Vercel dashboard.
3. Deploy or redeploy the project after enabling it, then visit the deployed page to generate a page view.

Analytics counts page views only. The `beforeSend` hook removes query strings and fragments from the page URL and discards custom events. Pasted and cleaned links remain in component state and are never sent as analytics data.

See [Vercel's setup guide](https://vercel.com/docs/analytics/quickstart). The analytics component is in `components/site-analytics.tsx`, with sanitization in `lib/analytics.ts`.
