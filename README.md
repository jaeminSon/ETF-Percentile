# Setting up
```
# Backend server
$ cd backend
$ pip install -r requirements.txt

# Frontend server
$ cd frontend
$ npm install

# Home server
# portforwarding: router page 에서 세팅
# Caddy for https on mac
$ brew install caddy

# Google cloud
(LLM 의 high level plan 은 다음과 같았음)
1. google cloud 가입 및 gcloud 설치
2. google sql 생성
3. docker build, push
4. kubernetes cluster 생성
5. cloudsql credential 생성
6. 쿠버네티스 yaml 파일 적용
```

# Server Command
```
# initiate backend server
$ cd backend
$ gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app

# initiate frontend server
$ cd frontend
$ npx expo start --web
$ npx expo start --android
# native code integration 이 필요한 경우, build 후 실행해야함.
$ npx expo run:android

# run caddy for https
$ sudo caddy run --config ./Caddyfile --adapter caddyfile
```

# apk 파일 생성 (실행 파일)

```
# pre-build (Expo config 를 native code 로 변환, android 폴더 생성, native modules 설치)
$ npx expo prebuild --platform android

# metro.config.js 가 없는 경우, README 페이지 하단의 misc 의 예제를 참조하여 만들기
$ npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.ts \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# apk 생성
$ cd android
$ ./gradlew assembleRelease

# apk 설치
$ adb install -r app/build/outputs/apk/release/app-release.apk

# android app 내 폰에서 확인
- app-release.apk 파일을 google drive 를 통해 옮겨 폰으로 다운받아서 설치 (카카오톡은 안됨).
```

# abb 파일 생성 (구글 플레이 업로드)

```
# pre-build
$ npx expo prebuild --platform android
```

- keytool 저장

```
$ keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
$ mv my-release-key.keystore android/app
```

- android/gradle.properties 에 upload credential 추가

```
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

- android/gradle.properties 에 fabric / New architecture 사용 안함을 명시

```
newArchEnabled=false
```

- android/app/build.gradle 의 android 블락 안에 다음 추가

```
signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        shrinkResources true
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

- js bundle 생성

```
# metro.config.js 가 없는 경우, README 페이지 하단의 misc 의 예제를 참조하여 만들기
$ npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.ts \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res
```

- aab 파일 생성 

```
$ cd android
$ ./gradlew clean
$ ./gradlew bundleRelease
# android/app/build/outputs/bundle/release/app-release.aab 에 생성됨
# aab 파일은 에뮬레이터에 설치 안되므로, apk 파일로 테스트후 Play Store 업로드 시에만 활용
```


# Misc
- gunicorn workers that waited too long dies and this is a feature.

```
[2025-04-06 20:32:55 +0900] [22243] [ERROR] Error handling request (no URI read)
```

- environment variables on Mac

```
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH
export JAVA_HOME=$(/usr/libexec/java_home -v17)
```

- metro.config.js 예시

```
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
```

- crontab 을 활용한 daily update

```
# crontab 열고, 내용 기입
$ crontab -e
<minute> <hour> * * * <path/to/shellscriptfile>

# shell script 에 실행 권한 추가
chmod +x <path/to/shellscriptfile>
```

- emulator 에서 error log 보기

```
adb logcat "*:E"
```

- aab file 생성시 version code 를 android/app/build.gradle 에서 변경해야함

```
defaultConfig {
    ...
    versionCode 2       // <--- Increase this (must be an integer and unique)
    ...
}
```

- Android emulator 에서 삭제

```
adb uninstall com.<str>.<str>
```