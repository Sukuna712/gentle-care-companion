Memory file: Chronos medical AI app - key decisions and constraints

## Identity
- App name: Chronos (not Baymax)
- AI persona: Chronos, healthcare companion robot

## Auth
- Currently DISABLED (no sign-in required)
- Profiles table with display_name, avatar_url
- Auto-confirm email: ON

## Communication
- Voice input: Web Speech API (SpeechRecognition) — continuous mode, cancels TTS before listening
- Voice output: Web SpeechSynthesis
- Camera: getUserMedia for live feed + capture + upload
- Image analysis: Gemini 2.5 Flash (multimodal)

## Design
- Font display: Quicksand, body: Inter
- DARK vibrant theme — deep navy background (225 25% 8%), cyan primary (195 100% 50%), purple accent (270 80% 65%)
- Neon glow effects on avatar and user bubbles
- Design tokens in index.css (HSL)
