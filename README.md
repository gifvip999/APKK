# APKK

A minimal Android application project that builds an APK.

## Requirements

- Android Studio or Gradle 8.2+
- JDK 8+
- Android SDK with API 34

## Build

```bash
./gradlew assembleDebug
```

The output APK will be located at `app/build/outputs/apk/debug/app-debug.apk`.

## Project Structure

```
APKK/
├── app/
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/example/apkk/
│       │   └── MainActivity.java
│       └── res/
│           ├── layout/activity_main.xml
│           └── values/
│               ├── strings.xml
│               └── themes.xml
├── build.gradle
├── settings.gradle
└── gradle/wrapper/
    └── gradle-wrapper.properties
```
