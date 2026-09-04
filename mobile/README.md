# Native Android (Wave A)

Compose Play Store app (`:androidApp`) plus a JVM rules library (`:core`). This is not a TWA and does not wrap the PWA.

Requires JDK 17. Android SDK is required only for `:androidApp` tasks (`compileSdk` / `targetSdk` 36).

```
./gradlew :core:test
./gradlew :androidApp:assembleDebug
```

Release signing uses the same hooks as `android/`:

- Environment: `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
- Or Gradle properties: `storeFile`, `storePassword`, `keyAlias`, `keyPassword`

`signingConfigs.release` is applied only when the store file exists and all four secrets are present.
