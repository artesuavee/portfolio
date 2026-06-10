# Планировщик задач (Expo / React Native)

Полноценное мобильное приложение: добавление задач, отметка выполнения, удаление,
фильтры (Все/Активные/Готовые), сохранение между запусками (AsyncStorage).

## Запуск (разработка)
```bash
npm install
npx expo start        # откроется в Expo Go на телефоне или эмуляторе
```

## Сборка APK
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # вернёт ссылку на готовый .apk
```
Локальная сборка (нужен Android SDK + JDK 17):
```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease   # apk в android/app/build/outputs/apk/release/
```
