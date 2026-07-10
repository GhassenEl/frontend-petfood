# AIHub — Assistant IA

Application Flutter multi-capacités : chat GPT-4o, Whisper, OCR, DALL-E, traduction et TTS OpenAI.

## Fonctionnalités

- **Chat IA** — GPT-4o-mini (conversations contextuelles)
- **Reconnaissance vocale** — Whisper (micro ou import audio)
- **TTS** — synthèse vocale OpenAI (tts-1)
- **OCR** — extraction de texte via GPT-4o Vision
- **Génération d'images** — DALL-E 3
- **Traduction** — multilingue (FR, EN, AR, ES, DE, IT…)
- Thème noir & blanc clair/sombre
- Mode démo sans clé API

## Configuration

1. Obtenir une clé sur [platform.openai.com](https://platform.openai.com)
2. Dans l'app, appuyer sur l'icône 🔑 et coller la clé `sk-…`
3. La clé reste en mémoire locale (session)

## Lancer

```bash
cd mini-projects/flutter/aihub_assistant
flutter pub get
flutter run -d web-server --web-hostname=0.0.0.0 --web-port=5556
```

Ouvrir http://localhost:5556

## Technologies

- Flutter
- API OpenAI (Chat, Whisper, TTS, Vision, DALL-E)
- `record` — capture micro
- `audioplayers` — lecture TTS
- `file_picker` — images & audio

## Branche GitHub

`project-aihub`
