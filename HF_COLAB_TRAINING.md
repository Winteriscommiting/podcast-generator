# Hugging Face Training (Colab) Guide

This guide helps you train or package a voice model and upload it to Hugging Face Hub for use in the app.

## Option A: Zero-shot XTTS (no training)

- If you just want to synthesize speech using your voice sample and text, set the backend to `xtts` in the Edit Voice modal and link any placeholder HF repo (or skip linking). The Python service will try to use Coqui XTTS when installed.
- For best results, provide 30–60 seconds of clean reference audio in your voice sample when uploading the voice.

## Option B: Train an RVC-style model on Colab

1) Open the notebook generated in this repo (search for `HF_RVC_Training_Colab` in VS Code) and upload it to Google Colab. GPU is strongly recommended.
2) Follow the steps:
   - Install dependencies
   - Upload your training audio (2–10 minutes of clean speech)
   - (Optional) Auto-slice audio into segments
   - Train the model (this can take ~30–90 minutes depending on runtime)
   - Save weights (.pth)
   - Push to Hugging Face Hub
3) Copy your HF repo id (e.g., `username/my-voice-rvc`).
4) In the Dashboard > Edit Voice, fill in the HF Repo, optional Revision, and Backend (e.g., `rvc` or `freevc`). Click "Link Hugging Face Model".

## Option C: Push existing weights
If you already have weights locally, use the CLI helper to push to HF Hub:

```powershell
# Windows PowerShell example
# Set your token once per session
$env:HF_TOKEN = "hf_xxx" 

# Upload a file
python scripts/push_to_hf.py --repo username/my-voice-rvc --path .\weights\my_voice.pth

# Or upload an entire folder
python scripts/push_to_hf.py --repo username/my-voice-rvc --path .\weights\
```

## Link the model in the app

- Edit your voice in the app and enter the HF repo (and optional revision), then press Link. The backend will mark the voice as ready and use Hugging Face for conversions.

## Troubleshooting

- If conversions just copy input audio, ensure you’ve selected the right backend. `xtts` requires the Coqui TTS package and text input for best results.
- For RVC/FreeVC real conversion, we will integrate specific pipelines next; until then, the HF service uses a passthrough placeholder for non-XTTS.
- Check the server logs for Python dependency errors. Install from `requirements-huggingface.txt`.
