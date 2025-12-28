# BuriedTown - React TypeScript Port

A faithful 1:1 port of BuriedTown (Cocos2d-JS) to React TypeScript.

## Project Status

**Phase 0: Setup & Asset Pipeline** - ✅ **COMPLETE**

- [x] Project initialization (Vite + React + TypeScript)
- [x] Tailwind CSS configuration
- [x] ESLint and Prettier setup
- [x] Asset conversion tools (Python scripts)
- [x] Type definitions created
- [x] Data migration (weather, player, items)
- [x] **All sprite atlases converted (13/13 PNG files ready)**
- [x] **All audio files copied (63 files)**
- [x] **All assets organized and ready**

**Phase 1: Core Systems** - 🚀 **READY TO START**

Next: Implement core game systems (Time Manager, Save System, Audio Manager, Zustand stores)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+ (for asset conversion tools)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Building

```bash
npm run build
```

## Asset Conversion

To convert game assets from the original format:

```bash
# Activate Python environment (if using conda)
conda activate anime

# Install Python dependencies
pip install -r tools/requirements.txt

# Run conversion
python tools/convert_all.py
```

This will:
- Convert PVR.CCZ textures to PNG
- Parse plist files to JSON sprite atlases
- Copy audio files
- Copy other assets

See `tools/README.md` for detailed information.

## Project Structure

```
src/
  assets/          # Game assets (sprites, audio)
  types/           # TypeScript type definitions
  data/            # Game configuration data
  store/           # Zustand state stores
  game/            # Core game logic
  components/      # React components
  hooks/           # Custom React hooks
  utils/           # Utility functions
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **PixiJS 8** - 2D rendering
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Howler.js** - Audio
- **i18next** - Internationalization

## Next Steps

Phase 1: Core Systems
- Time Manager
- Save System
- Audio Manager
- Basic UI components

## License

See original game license.

