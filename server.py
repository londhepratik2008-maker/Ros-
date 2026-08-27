"""
Rosee — Local LLM Server
FastAPI backend using llama-cpp-python for Qwen2.5 GGUF models.
Serves a streaming chat completion API compatible with the frontend.
"""

import json
import os
import sys
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from llama_cpp import Llama

app = FastAPI(title="Rosee Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODELS_DIR = Path(__file__).parent / "models"
DEFAULT_MODEL = "qwen2.5-3b-instruct-q4_k_m.gguf"

llm: Optional[Llama] = None
loaded_model_path: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str = DEFAULT_MODEL
    messages: list[ChatMessage]
    temperature: float = 0.65
    max_tokens: int = 1024
    stream: bool = True


# ---------------------------------------------------------------------------
# Health / status
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "loaded_model": loaded_model_path,
        "models_dir": str(MODELS_DIR),
        "available_models": [f.name for f in MODELS_DIR.glob("*.gguf")] if MODELS_DIR.exists() else [],
    }


# ---------------------------------------------------------------------------
# Load model
# ---------------------------------------------------------------------------
@app.post("/load")
def load_model(request: dict):
    global llm, loaded_model_path

    model_name = request.get("model", DEFAULT_MODEL)
    model_path = MODELS_DIR / model_name

    if not model_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Model not found: {model_name}. Run download_models.py first.",
        )

    if loaded_model_path == str(model_path) and llm is not None:
        return {"status": "already_loaded", "model": model_name}

    # Unload previous
    if llm is not None:
        del llm
        llm = None

    n_gpu_layers = request.get("n_gpu_layers", 0)  # 0 = CPU only

    llm = Llama(
        model_path=str(model_path),
        n_ctx=4096,
        n_gpu_layers=n_gpu_layers,
        verbose=False,
    )
    loaded_model_path = str(model_path)

    return {"status": "loaded", "model": model_name}


# ---------------------------------------------------------------------------
# Chat completion (streaming)
# ---------------------------------------------------------------------------
@app.post("/v1/chat/completions")
def chat_completions(req: ChatRequest):
    global llm

    if llm is None:
        # Auto-load default model if available
        model_path = MODELS_DIR / req.model
        if model_path.exists():
            global loaded_model_path
            llm = Llama(
                model_path=str(model_path),
                n_ctx=4096,
                n_gpu_layers=0,  # CPU only
                verbose=False,
            )
            loaded_model_path = str(model_path)
        else:
            raise HTTPException(
                status_code=400,
                detail="No model loaded. POST to /load first or ensure models/ has .gguf files.",
            )

    # Convert messages to prompt format
    prompt_messages = [{"role": m.role, "content": m.content} for m in req.messages]

    if req.stream:
        return StreamingResponse(
            _stream_completion(req.model, prompt_messages, req.temperature, req.max_tokens),
            media_type="text/event-stream",
        )

    # Non-streaming fallback
    output = llm.create_chat_completion(
        messages=prompt_messages,
        temperature=req.temperature,
        max_tokens=req.max_tokens,
        stream=False,
    )
    return output


def _stream_completion(model: str, messages: list, temperature: float, max_tokens: int):
    """Generator that yields SSE chunks matching OpenAI's format."""
    try:
        for chunk in llm.create_chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        ):
            delta = chunk["choices"][0].get("delta", {})
            finish_reason = chunk["choices"][0].get("finish_reason")

            payload = {
                "choices": [
                    {
                        "delta": delta,
                        "finish_reason": finish_reason,
                        "index": 0,
                    }
                ]
            }
            yield f"data: {json.dumps(payload)}\n\n"

            if finish_reason:
                break

        yield "data: [DONE]\n\n"
    except Exception as e:
        error_payload = {"error": str(e)}
        yield f"data: {json.dumps(error_payload)}\n\n"
        yield "data: [DONE]\n\n"


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    print(f"\n  Rosee Server starting on http://127.0.0.1:{port}")
    print(f"  Models directory: {MODELS_DIR.resolve()}\n")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
