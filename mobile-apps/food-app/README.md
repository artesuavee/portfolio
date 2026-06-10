# Доставка еды (Expo / React Native)

Приложение доставки: меню по категориям, корзина (+/−), расчёт доставки
(бесплатно от 1500 ₽), оформление заказа.

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
