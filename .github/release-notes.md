## 🎉 Cursor API Key Toggle v1.0.0

First release of the Cursor API Key Toggle extension.

### Features
- 🔄 Toggle between custom OpenAI API key and Cursor's built-in key with hotkey (Ctrl+Alt+K / Cmd+Alt+K)
- 📊 Status bar indicator showing current mode
- ✨ Visual feedback (highlighted when using custom key)
- 🎯 Notifications on toggle

### Installation

Download the `.vsix` file below and install it in Cursor IDE:
1. Open Cursor
2. Go to Extensions → Install from VSIX
3. Select the downloaded `.vsix` file

### Usage

- **Hotkey**: Press `Ctrl+Alt+K` (Linux/Windows) or `Cmd+Alt+K` (macOS)
- **Status bar**: Click the indicator in the bottom right corner
- **Commands**: Use Command Palette (`Ctrl+Shift+P`) and search for "Cursor API Key"

### Status Indicators
- `$(key) Custom API` (highlighted) — using your custom key
- `$(key) Cursor Key` — using Cursor's built-in key

### Requirements
- Cursor IDE or VSCode 1.80+

