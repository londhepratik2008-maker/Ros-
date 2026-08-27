<div align="center">

# Rosee

**A fully local AI assistant with a 3D rose nebula, glassmorphism UI, and voice I/O.**

Runs [Qwen 2.5 3B](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF) entirely on your machine via a Python backend. No cloud APIs. No data leaves your computer.

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite)
![Python](https://img.shields.io/badge/Python_3.14-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)

</div>

---

## Overview

Rosee is a desktop AI chat application that runs a quantized language model locally on your CPU. The frontend is built with React and features a living 3D nebula background made of 15,000 particles. The backend is a lightweight Python server using `llama-cpp-python` for inference.

### How It Works

```
Browser (React)  ──HTTP──>  Python Backend (FastAPI)  ──>  llama-cpp-python  ──>  Qwen 2.5 3B GGUF
     UI + 3D Nebula              Streaming API                 CPU Inference          ~2GB model
```

- **Frontend** serves on `http://localhost:5173`
- **Backend** serves on `http://127.0.0.1:8000`
- Vite proxies `/v1`, `/load`, and `/health` to the backend automatically

---

## Features

### AI Chat
- Streaming responses via Server-Sent Events (SSE)
- Markdown rendering with syntax highlighting for 100+ languages
- One-click code block copying
- File uploads via drag & drop (images, text, PDFs)

### Slash Commands

| Command | Description |
|---------|-------------|
| `/new` | Start a new chat session |
| `/sessions` | List all chat sessions |
| `/switch <id>` | Switch to a session by ID or name |
| `/delete <id>` | Delete a session |
| `/commands` | Show all available commands |

### Special Commands

| Command | Effect |
|---------|--------|
| `log off` | Nebula shatters — 15,000 particles explode outward |
| `log in` | Nebula reassembles — particles fly back to position |

### Rose Nebula Background
- **15,000 particles** forming a living rose-shaped nebula
- **3 orbital rings** rotating at different speeds and tilts
- **Audio reactive** — mic input modulates core pulse, petal expansion, halo warping, and more
- **Shatter & assemble** effects

### Voice I/O
- Speech-to-text via Web Speech API
- Text-to-speech for assistant responses

### Themes

| Theme | Accent | Background |
|-------|--------|------------|
| **Rose** (default) | `#d63384` | `#050208` |
| **Matrix** | `#00ff41` | `#0a0f0a` |
| **Fire** | `#ff6b35` | `#1a0a0a` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| 3D Graphics | Three.js + React Three Fiber |
| Markdown | react-markdown + remark-gfm |
| Code Highlighting | react-syntax-highlighter |
| Voice | Web Speech API |
| Backend | FastAPI + llama-cpp-python |
| Model | Qwen 2.5 3B Instruct (Q4_K_M GGUF, ~2 GB) |

---

## Getting Started

### Prerequisites

- **Python 3.10+** (tested with 3.14.5)
- **Node.js 18+**
- **~2 GB** free disk space for the model

### Quick Start (Windows)

Double-click **`start.bat`**. It will:

1. Create a Python virtual environment
2. Install dependencies
3. Download the model (~2 GB, first run only)
4. Start the backend server
5. Open the browser and start the frontend

### Manual Setup

#### Backend

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # macOS/Linux

pip install --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu -r requirements.txt
python download_models.py      # Downloads Qwen 2.5 3B (~2 GB)
python server.py               # Starts on http://127.0.0.1:8000
```

#### Frontend

```bash
npm install
npm run dev                    # Starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

### First Launch

1. Open the app in your browser
2. Go to **Settings** and click **Load** to load the model
3. Wait for the model to initialize (~10 seconds)
4. Start chatting!

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server status, loaded model, available models |
| `POST` | `/load` | Load a model into memory |
| `POST` | `/v1/chat/completions` | OpenAI-compatible chat completion (streaming) |

---

## Project Structure

```
rosee/
├── server.py                  # FastAPI backend
├── download_models.py         # HuggingFace model downloader
├── requirements.txt           # Python dependencies
├── start.bat                  # One-click launcher (Windows)
├── models/                    # GGUF model files (gitignored)
├── package.json
├── vite.config.ts             # Proxy config for backend
├── src/
│   ├── core/
│   │   ├── engine.ts          # HTTP client for backend
│   │   ├── models.ts          # Model configuration
│   │   └── types.ts           # TypeScript interfaces
│   ├── store/
│   │   ├── chatStore.ts       # Chat sessions + persistence
│   │   ├── modelStore.ts      # Model status + metrics
│   │   └── uiStore.ts         # Theme, panels, effects
│   ├── components/
│   │   ├── core/RoseNebula.tsx        # 3D nebula + effects
│   │   ├── chat/ChatPanel.tsx         # Message list
│   │   ├── chat/ChatInput.tsx         # Input + commands
│   │   ├── chat/MarkdownRenderer.tsx  # Markdown + code
│   │   └── layout/SettingsPanel.tsx   # Settings UI
│   ├── hooks/
│   │   ├── useLLM.ts          # Chat inference hook
│   │   └── useVoice.ts        # Speech I/O
│   └── utils/
│       └── webgpu.ts          # GPU detection
```

---

## License

MIT
