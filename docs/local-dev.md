# Local development

```bash
pnpm dev     # http://localhost:3000, Turbopack
```

Plain `localhost` needs no setup. The rest of this file is only relevant if you
reach the dev server under some *other* hostname.

## Reaching the dev server over a tailnet or LAN

Next.js refuses cross-origin requests to `/_next/*` from hostnames it doesn't
recognise. Over a tailnet or LAN address the page still returns HTML, but the
HMR socket and fonts are refused and **the page never hydrates** — every button
is inert and the theme toggle does nothing. There is no error banner; it just
looks like a broken page. It is not an HTTPS problem.

The fix is to name the hostname. Because these names are machine-specific, they
live in `.env.local` (gitignored) rather than in `next.config.ts`:

```env
# Comma-separated. No scheme, no port.
DEV_ORIGINS=your-machine.tailnet-name.ts.net,192.168.1.69
```

`next.config.ts` reads `DEV_ORIGINS` into `allowedDevOrigins`. Restart the dev
server after changing it — config is read once at startup.

Notes:

- **Bare hostnames only.** `https://host.ts.net` or `host.ts.net:3000` will not
  match; use `host.ts.net`.
- `.env.local` is loaded before `next.config.ts` is evaluated, so the variable
  is reliably available there. (Verified on Next.js 16.2.6 — worth re-checking
  after a major upgrade, since load order has changed historically.)
- `allowedDevOrigins` is **dev-only**. Production builds ignore it entirely, so
  an unset or stale `DEV_ORIGINS` can never affect a deploy.
- Your tailnet hostname is `tailscale status` (or `hostname -f`) on the machine
  running the server.

## Other environment variables

See the Environment Variables section of `CLAUDE.md` for the analytics and
AdSense keys. All of them are optional in development.

## Stale build cache

Turbopack occasionally holds on to a bad build after a dependency or config
change:

```bash
rm -rf .next && pnpm dev
```
