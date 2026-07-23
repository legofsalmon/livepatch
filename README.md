# Live Patch (v2)

Local-first patch sheet app for live event production — a ground-up rebuild.
Data lives on-device and syncs between crew devices whenever a sync point is
reachable (cloud or venue LAN), so the app keeps working with no internet.

The previous Next.js/Firebase version is preserved in git history. Full
documentation lands with the final phase of the rebuild.

## Development

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm test`.
