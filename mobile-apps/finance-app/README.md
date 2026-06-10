# Учёт финансов (Expo / React Native)

Учёт доходов и расходов: баланс, категории, история операций, удержание долгим
нажатием для удаления, сохранение между запусками (AsyncStorage).

## Запуск
```bash
npm install
npx expo start
```

## Сборка APK
```bash
npm install -g eas-cli && eas login
eas build -p android --profile preview
```
Локально (Android SDK + JDK 17): `npx expo prebuild -p android && cd android && ./gradlew assembleRelease`
