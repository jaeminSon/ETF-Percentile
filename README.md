# Setting up
```
# set up  backend server on 
$ cd backend
$ pip install -r requirements.txt

# set up frontend server
$ cd frontend
$ npm install

# set up google cloud
(LLM 의 high level plan 은 다음과 같았음)
1. google cloud 가입 및 gcloud 설치
2. google sql 생성
3. docker build, push
4. kubernetes cluster 생성
5. cloudsql credential 생성
6. 쿠버네티스 yaml 파일 적용
```

# Command
```
# initiate backend server
$ cd backend
$ gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app

# initiate frontend server
$ cd frontend
$ npx expo start --web
$ npx expo start --android

# build android app
$ npx expo prebuild --platform android
$ npx expo run
```

# Misc
```
# gunicorn workers that waited too long dies and this is a feature.
[2025-04-06 20:32:55 +0900] [22243] [ERROR] Error handling request (no URI read)

# environment variables on Mac
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH
export JAVA_HOME=$(/usr/libexec/java_home -v17)
```
