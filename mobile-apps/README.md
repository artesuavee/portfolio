# Mobile Apps — 5 приложений (Expo / React Native)

Полноценные мобильные приложения, собранные на основе демо-макетов портфолио.
Каждое — самостоятельный проект, запускается на телефоне и собирается в **APK**.

| Приложение | Папка | Что умеет |
|------------|-------|-----------|
| 📝 Планировщик задач | `tasks-app` | Задачи, статусы, фильтры, сохранение |
| 💰 Учёт финансов | `finance-app` | Доходы/расходы, баланс, категории |
| 🛒 Магазин | `shop-app` | Каталог, корзина, оформление заказа |
| 🛵 Доставка еды | `food-app` | Меню, корзина, расчёт доставки, заказ |
| 💪 Фитнес-трекер | `fitness-app` | Шаги/цель, журнал тренировок, статистика |

Стек: React Native (Expo SDK 51), AsyncStorage для локального хранения.

## Быстрый старт (любое приложение)
```bash
cd tasks-app          # или другое
npm install
npx expo start        # сканируйте QR в приложении Expo Go (Android)
```

## Сборка APK
**Облако (проще всего, без Android SDK):**
```bash
npm install -g eas-cli
eas login                                  # нужен бесплатный аккаунт Expo
cd tasks-app
eas build -p android --profile preview     # на выходе — ссылка на .apk
```

**Локально (нужен Android SDK + JDK 17):**
```bash
cd tasks-app
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## Примечание
На машине разработки сейчас нет Android SDK/Gradle (только JDK 8), поэтому
готовые `.apk` не приложены — проекты полностью готовы к сборке любой из команд выше.
Для облачной сборки EAS нужен бесплатный аккаунт Expo (вход через `eas login`).
