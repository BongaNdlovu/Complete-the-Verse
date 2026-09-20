# Native Android (Waves A–E)

Compose Play Store app (`:androidApp`) plus a JVM rules library (`:core`). This is not a TWA and does not wrap the PWA.

Version `1.0.0` (`versionCode` 1) is the first Play AAB for package `app.completetheverse`. Waves A–D are the game. Wave E is store cutover in this repo. Wave F is one content pipe: `shared/content/*.json` from `npm run content:export`. The PWA fetches that JSON on http(s) (`js/content-json.js`); `file://` and Node tests keep the JS banks. Android assets are mirrored from the same JSON.

The Valley stays incoming until the website drops `incoming` on Beat. Play Asset Delivery is deferred. Atlas is rail-first (no Leaflet tiles).

Screenshot-diff hall, play, and settings at 390×844 against the live PWA. That remains a human step. `VisualQaChecklistTest` checks VisualProfile gates and that hall/intro films are bundled — it is not a screenshot test.

Requires JDK 17. Android SDK is required only for `:androidApp` tasks (`compileSdk` / `targetSdk` 36).

```
./gradlew :core:test
./gradlew :androidApp:testDebugUnitTest
./gradlew :androidApp:assembleDebug
./gradlew :androidApp:bundleRelease
```

Release signing uses the same hooks as `android/`:

- Environment: `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
- Or Gradle properties: `storeFile`, `storePassword`, `keyAlias`, `keyPassword`

`signingConfigs.release` is applied only when the store file exists and all four secrets are present. Tag `v*` so CI uploads `app-completetheverse-release.aab`.

## Play Console (owner)

These cannot be done from the repo:

1. Deploy this branch so live `https://complete-the-verse.vercel.app/.well-known/assetlinks.json` includes `app.completetheverse`.
2. In Supabase Auth, add redirect URLs `https://complete-the-verse.vercel.app/**` and `completetheverse://**`.
3. Create app `app.completetheverse` (new listing, not the TWA package).
4. Upload the signed AAB to a closed testing track, then promote to production.
5. When native is the default download, unpublish the TWA listing (`app.completetheverse.twa`). Keep TWA CI for GitHub sideload until then.
6. Content rating questionnaire, store listing, privacy policy URL: `https://complete-the-verse.vercel.app/privacy.html`

### Listing copy

Short (80): Complete the missing phrase before the clock falls. KJV memory, Ur to Patmos.

Full: Complete the Verse is a King James memory ordeal. Hold the line before the clock falls, walk forty-six sites from Ur to Patmos, carve Word Tablets, and sit the Daily Trial. Sign in with Google or email to keep one pilgrimage and appear on Blitz. Progress already on this device merges into your account. There is no Daily public board.

Category: Trivia / Educational. Ads: none. In-app purchases: none.
