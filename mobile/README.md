# Your Family Manager Mobile (Expo MVP)

This Expo app mirrors the current web MVP functionality:

- Login / logout with Quarkus session auth
- Create todo lists
- Share lists with read-write and read-only members
- Create, update, complete, and delete todos

## Run

```bash
cd mobile
npm install
npm run start
```

## Backend URL

The app reads `EXPO_PUBLIC_BACKEND_BASE_URL`.

Defaults when unset:
- iOS: `http://localhost:8080`
- Android emulator: `http://10.0.2.2:8080`

Physical device example:

```bash
EXPO_PUBLIC_BACKEND_BASE_URL=http://192.168.1.42:8080 npm run start
```

## Commands

```bash
npm run ios
npm run android
npm run web
npm run typecheck
```
