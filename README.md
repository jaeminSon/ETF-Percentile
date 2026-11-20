# Setting up

```
# Backend server (no database: data lives in backend/data/*.json)
$ cd backend
$ uv venv -p 3.11 .venv && uv pip install -p .venv/bin/python -r requirements.txt
$ ./update_data.sh   # first full download from Yahoo Finance (~2 min)

# Frontend server
$ cd frontend
$ npm install

# Home server
# portforwarding: router page 에서 세팅 (no-ip 들어가서 Reset Update Client DDNS Key)
# Caddy for https on mac
$ brew install caddy   # or: official binary from github.com/caddyserver/caddy/releases into ~/.local/bin

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
# initiate everything (caddy, backend) on the home server
$ ./initiate-ETF-Percentile.sh

# initiate backend server only
$ cd backend
$ .venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app

# refresh data manually (all tickers, or only some)
$ cd backend
$ .venv/bin/python -m gauger.update
$ .venv/bin/python -m gauger.update SPY QQQ
# result of the last update: GET /status

# initiate frontend server
$ cd frontend
$ npx expo start --web
$ npx expo start --android
# native code integration 이 필요한 경우, build 후 실행해야함.
$ npx expo run:android

# run caddy for https
$ caddy run --config ./Caddyfile --adapter caddyfile   # no sudo needed on macOS
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

# aab 파일 생성 (구글 플레이 업로드)

android/ 폴더는 `expo prebuild` 로 생성되는 파일이라 직접 수정하지 않음 (gitignore).
target SDK, 서명, minify, versionCode 는 모두 frontend/app.config.js 와 frontend/plugins/ 에 있음.

- 업로드 키 (한 번만): keystore 는 frontend/credentials/ (gitignore), 비밀번호는 ~/.gradle/gradle.properties

```
ETF_UPLOAD_STORE_FILE=/Users/jaeminson/ETF-Percentile/frontend/credentials/etf-percentile.keystore
ETF_UPLOAD_KEY_ALIAS=etf-percentile
ETF_UPLOAD_STORE_PASSWORD=*****
ETF_UPLOAD_KEY_PASSWORD=*****
```

- 릴리즈마다 frontend/app.config.js 의 `version` 과 `android.versionCode` 를 올림 (versionCode 는 마지막 업로드보다 커야 함)

- aab 생성 (JS bundle 은 gradle 이 자동으로 포함)

```
$ cd frontend
$ npx expo prebuild --platform android --clean
$ cd android
$ ./gradlew bundleRelease
# android/app/build/outputs/bundle/release/app-release.aab 에 생성됨
# 테스트용 apk: ./gradlew assembleRelease -> android/app/build/outputs/apk/release/app-release.apk
# Test and Release tab -> Production tab -> Create New Release button
```

- Play 요구사항: target API 36 (Android 16, 2026-08-31 부터), 16 KB page size 지원 (Expo SDK 54 / RN 0.81 로 충족)
- Play Age Signals API: frontend/modules/age-signals (native module) + frontend/component/ageSignals.ts
  - 법적으로 공유가 의무인 지역에서만 Play 의 연령 공유 요청 화면을 띄움, 그 외 지역은 이미 공유된 연령만 읽음
  - 18세 미만이면 광고를 아동/청소년용 설정 (G/PG 등급, 비개인화) 으로 제한. 연령 정보는 저장/전송하지 않음
  - 테스트 (debug 빌드): `EXPO_PUBLIC_AGE_SIGNALS_TEST="1,13,15" npx expo run:android` (1 SHARED, 2 NOT_SHARED, 3 VERIFICATION_REQUIRED)

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
# Mac mini: JDK 17 / Node 22 은 ~/.local/opt 에 설치됨
# export JAVA_HOME=$HOME/.local/opt/jdk17 PATH=$HOME/.local/opt/node/bin:$PATH
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

# 예: 매일 10:00 (KST) 데이터 갱신
0 10 * * * /Users/jaeminson/ETF-Percentile/backend/update_data.sh >> /Users/jaeminson/ETF-Percentile/backend/cron.log 2>&1
```

- emulator 에서 error log 보기

```
adb logcat "*:E"
```

- aab file 생성시 version code 를 frontend/app.config.js 에서 변경해야함

```
android: {
    ...
    versionCode: 9,       // <--- Increase this (must be an integer and unique)
    ...
}
```

- Android emulator 에서 삭제

```
adb uninstall com.<str>.<str>
```
