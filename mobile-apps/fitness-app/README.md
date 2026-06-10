# Фитнес-трекер (Expo / React Native)

Трекер активности: кольцо прогресса по шагам (цель 10 000), журнал тренировок
(бег, ходьба, велосипед, зал, йога) с расчётом калорий/шагов, дневная статистика,
сохранение между запусками (AsyncStorage). Удаление записи — долгим нажатием.

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
