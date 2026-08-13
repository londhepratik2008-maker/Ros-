# justFE — Rosee

> A reactive AI assistant running entirely in your browser with a rose nebula background.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-00A3E0?style=flat)

---

## What is this?

Rosee is a fully local AI assistant that runs **Qwen 2.5 7B** in your browser using WebGPU. No servers, no API keys, no data sent anywhere. The UI features a **3D rose nebula** built with Three.js that reacts to audio input — it pulses with your voice, glows with bass, and ripples with treble.

## Features

### AI Chat
- **In-browser inference** via [WebLLM](https://github.com/mlc-ai/web-llm) — models run entirely on your GPU
- **Streaming responses** with real-time token generation
- **Markdown rendering** with syntax highlighting for 100+ languages
- **Code blocks** with one-click copy
- **File uploads** — attach images, text files, PDFs via drag & drop

### Rose Nebula Background
- **15,000 particles** forming a living rose-shaped nebula
- **3 orbital rings** rotating at different speeds and tilts
- **3 particle trails** orbiting the nebula
- **Audio reactive** — mic input modulates:
  - Bass → core pulse, petal expansion, depth increase
  - Mid → petal curl, saturation boost, turbulence
  - Treble → halo warping, star twinkling, ring pulsing
  - Volume → overall brightness and size
- **Smooth interpolation** to prevent jitter

### Voice I/O
- **Speech-to-text** via Web Speech API — dictate messages
- **Text-to-speech** — assistant responses can be spoken aloud

### Themes
| Theme | Accent | Background |
|-------|--------|------------|
| **Rose** (default) | Rose pink `#d63384` | Deep space `#050208` |
| **Matrix** | Green `#00ff41` | Dark green `#0a0f0a` |
| **Fire** | Orange `#ff6b35` | Dark red `#1a0a0a` |

### Monitor Dashboard
- Token speed gauge (tok/s)
- Latency gauge (ms)
- GPU adapter info
- Session message count
- Model status and progress

### Persistence
- Chat sessions saved to `localStorage`
- Theme choice remembered
- Sidebar state preserved

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| 3D Graphics | Three.js + React Three Fiber |
| AI Engine | @mlc-ai/web-llm (WebGPU) |
| Markdown | react-markdown + remark-gfm |
| Code Highlighting | react-syntax-highlighter |
| Voice | Web Speech API |

---

## Getting Started

### Prerequisites
- **Chrome 113+** or **Edge 113+** (WebGPU support required)
- Node.js 18+

### Install

```bash
git clone https://github.com/londhepratik2008-maker/justFE.git
cd justFE
npm install
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173` in Chrome or Edge.

### First Launch
1. Click **Load Model** in the sidebar
2. Wait for Qwen 2.5 7B to download (~4.5GB, cached after first load)
3. Start chatting!
4. Click **NEBULA** in the header to enable audio-reactive mode

---

## Project Structure

```
src/
├── core/
│   ├── engine.ts          # WebLLM wrapper — model loading, streaming
│   ├── models.ts          # Available model configs
│   └── types.ts           # TypeScript interfaces
├── store/
│   ├── chatStore.ts       # Chat sessions, messages, persistence
│   ├── modelStore.ts      # Model status, GPU info, metrics
│   └── uiStore.ts         # Sidebar, theme, active panel
├── components/
│   ├── core/
│   │   ├── RoseNebula.tsx # 3D nebula background with audio reactivity
│   │   ├── AICore.tsx     # Animated AI core visualization
│   │   └── AgentVisualization.tsx # Thinking process display
│   ├── chat/
│   │   ├── ChatPanel.tsx  # Message list with markdown rendering
│   │   ├── ChatInput.tsx  # Input with file upload, voice, send
│   │   └── MarkdownRenderer.tsx # Markdown + code highlighting
│   ├── layout/
│   │   ├── MainLayout.tsx # App shell
│   │   ├── Sidebar.tsx    # Sessions, model status, nav
│   │   ├── Header.tsx     # GPU info, metrics, audio toggle
│   │   └── SettingsPanel.tsx # Theme switcher, about
│   ├── monitor/
│   │   └── MonitorPanel.tsx # Dashboard gauges and stats
│   ├── multimodal/
│   │   └── FileUpload.tsx # Drag & drop file attachments
│   ├── voice/
│   │   ├── VoiceControl.tsx # Mic/speaker controls
│   │   └── AudioToggle.tsx  # Nebula audio reactivity toggle
│   └── ui/
│       ├── HUDPanel.tsx   # Glowing panel container
│       ├── GlowButton.tsx # Themed button
│       ├── StatusIndicator.tsx # Colored status dot
│       ├── ThemeSwitcher.tsx   # Theme selection
│       ├── TypewriterText.tsx  # Animated text reveal
│       └── ErrorBoundary.tsx   # Crash recovery
├── hooks/
│   ├── useLLM.ts          # Chat inference hook
│   ├── useVoice.ts        # Speech I/O hook
│   └── useAudioAnalyzer.ts # Mic frequency analysis
├── utils/
│   ├── webgpu.ts          # GPU detection
│   ├── format.ts          # Token/duration formatting
│   └── storage.ts         # localStorage wrapper
├── styles/
│   └── themes.css         # Theme CSS variables
├── App.tsx                # Root component
├── main.tsx               # Entry point
└── index.css              # Tailwind + animations + themes
```

---

## Audio Reactivity

When you click **NEBULA** in the header, Rosee requests microphone access and analyzes audio frequencies in real-time:

```
Microphone → AudioContext → AnalyserNode → FFT → Particle Parameters
```

| Frequency Band | Range | Nebula Effect |
|---------------|-------|---------------|
| Bass | 0-400Hz | Core brightness, petal expansion, depth |
| Mid | 400-1600Hz | Petal curl, color saturation, turbulence |
| Treble | 1600Hz+ | Halo warping, star twinkle speed, ring pulse |
| Volume | Overall | Global brightness and size scaling |

Values are smoothed with exponential interpolation to prevent flickering.

---

## Browser Support

| Browser | WebGPU | Status |
|---------|--------|--------|
| Chrome 113+ | ✅ | Full support |
| Edge 113+ | ✅ | Full support |
| Firefox | ❌ | Not yet supported |
| Safari | ❌ | Not yet supported |

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run linter
```

---

## License

MIT
