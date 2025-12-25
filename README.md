# Cursor API Key Toggle

Toggle between custom OpenAI API key and Cursor's built-in key with visual indicator.

## Features

- 🔄 **Hotkey** for quick toggle (Ctrl+Alt+K / Cmd+Alt+K)
- 📊 **Status bar** indicator showing current mode
- ✨ **Visual feedback** (highlighted when using custom key)
- 🎯 **Notifications** on toggle

## Installation

### Install from VSIX

1. Open Cursor IDE
2. Go to Extensions → Install from VSIX
3. Select `cursor-api-key-toggle-1.0.0.vsix`

### Build from source

```bash
npm install
npm run compile
npx vsce package
```

## Usage

### Hotkey

Press `Ctrl+Alt+K` (Linux/Windows) or `Cmd+Alt+K` (macOS)

### Commands (Ctrl+Shift+P / Cmd+Shift+P)

- `Cursor API Key: Toggle API Key Mode`
- `Cursor API Key: Manual Toggle (Quick Pick)`
- `Cursor API Key: Show Log`

### Status Bar

Click the indicator in the bottom right corner.

### Indicators

- `$(key) Custom API` (highlighted) — using your custom key
- `$(key) Cursor Key` — using Cursor's built-in key

## Requirements

- Cursor IDE or VSCode 1.80+

## License

MIT
