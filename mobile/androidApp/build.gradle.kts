plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

val keystorePath = System.getenv("ANDROID_KEYSTORE_PATH") ?: project.findProperty("storeFile")
val keystorePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: project.findProperty("storePassword")
val signingKeyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: project.findProperty("keyAlias")
val signingKeyPassword = System.getenv("ANDROID_KEY_PASSWORD") ?: project.findProperty("keyPassword")
val releaseStoreFile = keystorePath?.toString()?.takeIf { it.isNotEmpty() }?.let { file(it) }
val hasReleaseSigning = releaseStoreFile != null && releaseStoreFile.exists() &&
    !keystorePassword?.toString().isNullOrEmpty() &&
    !signingKeyAlias?.toString().isNullOrEmpty() &&
    !signingKeyPassword?.toString().isNullOrEmpty()

android {
    namespace = "app.completetheverse"
    compileSdk = 36

    defaultConfig {
        applicationId = "app.completetheverse"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0-waveA"
    }

    if (hasReleaseSigning) {
        signingConfigs {
            create("release") {
                storeFile = releaseStoreFile
                storePassword = keystorePassword.toString()
                keyAlias = signingKeyAlias.toString()
                keyPassword = signingKeyPassword.toString()
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(project(":core"))

    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.9.3")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
