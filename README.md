# Winter Arc 2026

Mobile-first habit tracker for 1 Sep – 31 Dec 2026. September is prep month.

Habit data lives in the browser (`localStorage`). No login. Hosted as a static site on Cloudflare Pages.

## Local

```bash
npm install
npm run dev
```

## Deploy on Cloudflare Pages (when you have an account)

1. Create a project from `subodh-kasaudhan/winter-arc-tracker`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Create a KV namespace and bind it as `VISITORS` (this powers the unique-browser count in the menu)
5. Redeploy

Until KV is bound, the menu shows the counter as unavailable. Habit tracking still works.

## Backup

Open the hamburger menu → Export backup / Import backup. Use this before clearing browser data.
