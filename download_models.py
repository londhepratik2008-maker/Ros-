#!/usr/bin/env python3
"""
Rosee — Model Downloader
Downloads Qwen2.5 3B Q4_K_M GGUF from Hugging Face with resume + progress bar.
"""

import sys
from pathlib import Path

try:
    from huggingface_hub import hf_hub_download
except ImportError:
    print("Error: huggingface_hub not installed. Run: pip install huggingface_hub")
    sys.exit(1)

REPO_ID = "Qwen/Qwen2.5-3B-Instruct-GGUF"
FILENAME = "qwen2.5-3b-instruct-q4_k_m.gguf"
MODELS_DIR = Path(__file__).parent / "models"

def main():
    print(f"\n  Rosee Model Downloader")
    print(f"  Repo: {REPO_ID}")
    print(f"  File: {FILENAME}")
    print(f"  Target: {MODELS_DIR.resolve()}\n")

    MODELS_DIR.mkdir(exist_ok=True)

    try:
        path = hf_hub_download(
            repo_id=REPO_ID,
            filename=FILENAME,
            local_dir=MODELS_DIR,
            local_dir_use_symlinks=False,
            resume_download=True,
        )
        size_mb = Path(path).stat().st_size / (1024 * 1024)
        print(f"\n  Done! Model saved to: {path}")
        print(f"  Size: {size_mb:.1f} MB")
    except Exception as e:
        print(f"\n  Download failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()