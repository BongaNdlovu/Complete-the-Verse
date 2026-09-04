plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
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
        isCoreLibraryDesugaringEnabled = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "/META-INF/INDEX.LIST"
        }
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
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    implementation(platform("io.github.jan-tennert.supabase:bom:3.1.4"))
    implementation("io.github.jan-tennert.supabase:auth-kt")
    implementation("io.github.jan-tennert.supabase:postgrest-kt")
    implementation("io.github.jan-tennert.supabase:functions-kt")
    implementation("io.ktor:ktor-client-android:3.0.3")

    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
