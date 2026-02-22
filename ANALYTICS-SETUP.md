# Analytics Setup Guide

How to configure `scripts/fetch-analytics.mjs` to pull live data from GA4 and Google Search Console.

## Step 1 — Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one), e.g. **tunetapper**
3. Enable these two APIs:
   - [GA4 Data API](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)
   - [Search Console API](https://console.cloud.google.com/apis/library/searchconsole.googleapis.com)

## Step 2 — Service Account

1. In the Cloud Console, go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account**, give it a name (e.g. `tunetapper-analytics`)
3. Skip the optional role/access steps, click **Done**
4. Click the service account you just created → **Keys** tab → **Add Key → Create new key → JSON**
5. Save the downloaded file as **`service-account-key.json`** in the project root

> The key file is already in `.gitignore` — it will never be committed.

## Step 3 — Grant Access to GA4

1. Go to [analytics.google.com](https://analytics.google.com) → Admin
2. Under your property, go to **Property Access Management**
3. Click **+** → Add users → enter the service account email (looks like `tunetapper-analytics@your-project.iam.gserviceaccount.com`)
4. Set role to **Viewer** → Add

Your GA4 Property ID is the number shown under your property name in Admin (e.g. `123456789`).

## Step 4 — Grant Access to Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Select your property → **Settings → Users and permissions**
3. Click **Add user** → enter the service account email
4. Set permission to **Full** (needed for Search Analytics API) → Add

## Step 5 — Configure `.env.local`

Add these lines to `.env.local`:

```env
# Analytics script
GA4_PROPERTY_ID=123456789
GSC_SITE_URL=https://tunetapper.com
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

## Step 6 — Install the dependency

```bash
pnpm add -D googleapis
```

## Running the script

```bash
node --env-file=.env.local scripts/fetch-analytics.mjs
```

This writes `reports/analytics-snapshot.md`. Open that file (or paste it in chat) and ask Claude to analyze it.

## What the report includes

- **Phase 2 readiness assessment** — 4 checks with a clear go/no-go recommendation
- **GA4**: sessions/users/pageviews vs previous period, traffic by channel, top 20 pages
- **Search Console**: impressions, clicks, CTR, position, top 25 queries, top 25 pages, opportunity pages (high impressions / low CTR)
