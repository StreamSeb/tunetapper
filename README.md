# TuneTapper

Free music production and DJ tools — [tunetapper.com](https://tunetapper.com)

## Tools

| Tool | URL |
|---|---|
| BPM Delay Calculator | `/tools/bpm-delay` |
| Bars to Time Calculator | `/tools/bars-to-time` |
| Tap Tempo | `/tools/tap-tempo` |
| Camelot Wheel Calculator | `/tools/camelot` |
| BPM Transition Helper | `/tools/bpm-transition` |
| Key Finder | `/tools/key-analyzer` |

Plus 259 programmatic SEO pages across `/bpm/`, `/bars/`, `/camelot/`, and `/guides/`.

## Stack

- **Next.js 16** — App Router, fully static output
- **TypeScript** + **Tailwind CSS v4** + **shadcn/ui**
- **Vercel Analytics** — no consent required
- **Google AdSense + GA4** — consent-gated via cookie banner
- Deployed on **Vercel**

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000 (Turbopack)
pnpm build
pnpm lint
```

Clear the Next.js cache if you hit stale build issues:

```bash
rm -rf .next
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

## Adding Content

| To add | Edit |
|---|---|
| New BPM pages | `src/data/bpm-list.json` |
| New bars pages | `src/data/bars-list.json` |
| New Camelot keys | `src/data/camelot-keys.json` |
| New guide (metadata) | `src/data/guides.json` |
| New guide (content) | `src/app/guides/[slug]/page.tsx` |

The sitemap at `/sitemap.xml` updates automatically when you add entries to the JSON files.

## License

See [LICENSE](./LICENSE).
