# Android Version (PWA)

This project is now configured as an installable Android web app (PWA).

## What was added
- `service-worker.js` for offline/app-shell caching.
- Service-worker registration in `app.js`.
- Android-friendly manifest fields in `site.webmanifest`.

## Test locally
1. Start a local server from this folder (do not open `index.html` directly):
   - `python3 -m http.server 8080`
2. Open `http://localhost:8080` in Chrome.
3. Verify install prompt or Chrome menu: `Add to Home screen` / `Install app`.

## Install on Android phone
1. Deploy this site over `https` (required for service workers outside localhost).
2. Open the site in Chrome on Android.
3. Tap `Install app` (or `Add to Home screen`).

## Optional: Publish to Play Store later
If you want a Play Store APK/AAB from this web app, use one of these wrappers:
- Trusted Web Activity (best for PWA-first apps)
- Capacitor Android WebView app

I can set up either option in this repo next.
