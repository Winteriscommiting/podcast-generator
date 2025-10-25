# Enabling XTTS (Coqui) and FreeVC/RVC (HF infer.py) Online

This project supports two Hugging Face-based voice cloning paths:

- XTTS zero-shot (Coqui TTS): text-to-speech in your voice using a reference sample
- FreeVC/RVC via HF repo: runs a repo-provided `infer.py` for voice conversion

## What runs in production

- Python service: `rvc_service_hf.py` (Flask) on port 5000
- Node API/UI: `server.js` (default port 3000)
- Railway: starts both via `railway.toml` startCommand

## Health check

GET http://&lt;host&gt;:5000/health → returns JSON like:

```json
{
  "status": "healthy",
  "mode": "huggingface",
  "device": "cpu",
  "models_loaded": 0,
  "hf_models": 0,
  "xtts_available": false,
  "hf_hub_available": true
}
```

`xtts_available` indicates whether Coqui TTS is installed and usable.

## XTTS (Coqui TTS) setup

XTTS works best on Python 3.10/3.11. On Python 3.12, it may not install.

- Install (locally or in deploy image):
  - `pip install -r requirements-huggingface.txt`
  - `pip install -r requirements-xtts.txt`
- Environment variables:
  - `XTTS_MODEL` (optional): default `tts_models/multilingual/multi-dataset/xtts_v2`
  - `XTTS_LANG` (optional): default `en`

In the UI, select backend `xtts`, add a short reference voice sample (upload voice), and provide `text` in the Convert Test; the service will synthesize speech in your voice.

## FreeVC/RVC via HF repo (infer.py)

- Link a Hugging Face repo in the Edit Voice modal (repo id like `owner/name`).
- The service will cache the repo on first use (requires `huggingface_hub`).
- It will look for `infer.py` in the repo root and run it as:
  
  ```bash
  python infer.py --input <in.wav> --output <out.wav> [--revision <rev>]
  ```

- Timeout can be set via `HF_INFER_TIMEOUT` (seconds), default 600.
- Security: Only use trusted repos. The script executes as a subprocess.

## Railway deployment notes

- We use Nixpacks to run Node + Python together.
- `railway.toml` is configured to start `python rvc_service_hf.py & node server.js`.
- To enable XTTS, set Python version to 3.10 or 3.11 in Railway project variables (recommended):
  - Add environment variable: `NIXPACKS_PYTHON_VERSION=3.11` (or 3.10)
- Ensure Python requirements install:
  - Keep `requirements.txt` (minimal) for core server
  - Install additional HF/XTTS deps by adding a Deploy Hook in Railway or use build variables to run:
    - `pip install -r requirements-huggingface.txt && pip install -r requirements-xtts.txt`

Alternatively, use a Dockerfile to fully control Python version and dependencies.

## Troubleshooting

- `/health` shows `mode=mock` → transformers/torch/torchaudio not installed; install `requirements-huggingface.txt` and restart.
- `xtts_available=false` → Coqui TTS not installed or Python version incompatible; switch to Python 3.10/3.11 and install `requirements-xtts.txt`.
- `infer.py` not found → ensure the linked HF repo has an `infer.py` at its root, or set the backend to `xtts`.
- Timeouts → bump `HF_INFER_TIMEOUT` or optimize the inference script.
