# Install
```
# install backend server

# install frontend server
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
