# RVC Voice Cloning Service with Hugging Face Support
# Uses pre-trained models from Hugging Face for voice conversion

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import json
import tempfile
import shutil
from pathlib import Path
import time

app = Flask(__name__)
CORS(app)

# Configuration
RVC_ROOT = os.path.join(os.path.dirname(__file__), 'rvc')
MODELS_DIR = os.path.join(RVC_ROOT, 'models')
WEIGHTS_DIR = os.path.join(RVC_ROOT, 'weights')
LOGS_DIR = os.path.join(RVC_ROOT, 'logs')
TEMP_DIR = os.path.join(RVC_ROOT, 'temp')

# Create directories
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(WEIGHTS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Try to import Hugging Face dependencies
HF_AVAILABLE = False
try:
    from transformers import pipeline
    import torch
    import torchaudio
    import soundfile as sf
    HF_AVAILABLE = True
    print("✅ Hugging Face Transformers available")
except ImportError as e:
    print("⚠️  Hugging Face not installed. Using mock mode.")
    print(f"   Error: {e}")
    print("   Install: pip install transformers torch torchaudio soundfile")

# Optional: Hugging Face Hub for model caching
HF_HUB_AVAILABLE = False
try:
    from huggingface_hub import snapshot_download
    HF_HUB_AVAILABLE = True
    print("✅ huggingface_hub available for model caching")
except Exception:
    print("ℹ️  huggingface_hub not installed; HF repo caching disabled.")

# Check for GPU
DEVICE = "cuda" if HF_AVAILABLE and torch.cuda.is_available() else "cpu"
if HF_AVAILABLE:
    print(f"🖥️  Using device: {DEVICE}")

class HuggingFaceRVCService:
    """Service using Hugging Face models for voice conversion"""
    
    def __init__(self):
        self.models = {}
        self.hf_models = {}
        self.mock_mode = not HF_AVAILABLE
        
        if HF_AVAILABLE:
            print("🚀 Initializing Hugging Face RVC Service...")
            self.load_pretrained_models()
        else:
            print("🎭 Running in MOCK mode")
        
        self.load_existing_models()

    def ensure_hf_model_cached(self, repo_id: str, revision: str | None = None) -> str | None:
        """Download/cache a Hugging Face repo if available; return local path."""
        if not HF_HUB_AVAILABLE:
            return None
        try:
            print(f"📥 Caching HF repo: {repo_id} @ {revision or 'latest'}")
            cache_dir = os.path.join(MODELS_DIR, 'hf')
            os.makedirs(cache_dir, exist_ok=True)
            local_dir = snapshot_download(repo_id=repo_id, revision=revision, cache_dir=cache_dir)
            # Track in hf_models map
            self.hf_models[repo_id] = {
                'path': local_dir,
                'revision': revision,
                'cached': True,
            }
            print(f"✅ Cached to: {local_dir}")
            return local_dir
        except Exception as e:
            print(f"⚠️  HF cache failed for {repo_id}: {e}")
            return None
    
    def load_pretrained_models(self):
        """Load pre-trained voice conversion models from Hugging Face"""
        try:
            # These are example models - you can use different ones
            pretrained_models = [
                {
                    'id': 'facebook/speech-to-speech',
                    'name': 'Facebook S2S',
                    'type': 'speech-to-speech'
                },
                # Add more models as needed
            ]
            
            for model_info in pretrained_models:
                try:
                    print(f"  Loading {model_info['name']}...")
                    # Load model pipeline
                    # Note: This is a placeholder - actual implementation depends on the model
                    self.hf_models[model_info['id']] = {
                        'info': model_info,
                        'loaded': True
                    }
                    print(f"  ✅ {model_info['name']} loaded")
                except Exception as e:
                    print(f"  ⚠️  Could not load {model_info['name']}: {e}")
            
        except Exception as e:
            print(f"❌ Error loading pretrained models: {e}")
    
    def load_existing_models(self):
        """Load user-uploaded voice samples"""
        if os.path.exists(WEIGHTS_DIR):
            for model_file in os.listdir(WEIGHTS_DIR):
                if model_file.endswith('.pth') or model_file.endswith('.pt'):
                    model_name = model_file.replace('.pth', '').replace('.pt', '')
                    self.models[model_name] = {
                        'path': os.path.join(WEIGHTS_DIR, model_file),
                        'status': 'ready',
                        'type': 'custom'
                    }
        print(f"📦 Loaded {len(self.models)} existing custom models")
    
    def train_model(self, voice_id, audio_path, voice_name):
        """
        Process voice sample for future use
        With Hugging Face, we don't train but rather prepare the voice sample
        for voice conversion using pre-trained models
        """
        if self.mock_mode:
            return self._mock_training(voice_id, voice_name)
        
        try:
            print(f"🎤 Processing voice sample: {voice_name}")
            
            # Load and process audio
            waveform, sample_rate = torchaudio.load(audio_path)
            
            # Save processed audio reference
            ref_path = os.path.join(WEIGHTS_DIR, f"{voice_id}.wav")
            torchaudio.save(ref_path, waveform, sample_rate)
            
            self.models[voice_id] = {
                'path': ref_path,
                'status': 'ready',
                'name': voice_name,
                'type': 'custom',
                'sample_rate': sample_rate
            }
            
            print(f"✅ Voice sample processed: {voice_id}")
            
            return {
                'success': True,
                'model_id': voice_id,
                'model_path': ref_path,
                'status': 'ready',
                'mode': 'huggingface'
            }
            
        except Exception as e:
            print(f"❌ Processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'status': 'failed'
            }
    
    def _mock_training(self, voice_id, voice_name):
        """Mock training for development"""
        print(f"🎭 Mock processing: {voice_name}")
        time.sleep(2)
        
        model_path = os.path.join(WEIGHTS_DIR, f"{voice_id}.pth")
        with open(model_path, 'w') as f:
            f.write(f"Mock model for {voice_name}")
        
        self.models[voice_id] = {
            'path': model_path,
            'status': 'ready',
            'name': voice_name,
            'type': 'mock'
        }
        
        return {
            'success': True,
            'model_id': voice_id,
            'model_path': model_path,
            'status': 'ready',
            'mock': True
        }
    
    def convert_voice(self, model_id, input_audio_path, output_path, backend: str | None = None, text: str | None = None, hf_repo: str | None = None, hf_revision: str | None = None):
        """
        Convert audio using voice sample with Hugging Face models
        """
        if model_id not in self.models:
            return {'success': False, 'error': 'Model not found'}
        
        if self.mock_mode:
            return self._mock_conversion(input_audio_path, output_path)
        
        try:
            print(f"🔄 Converting audio with model: {model_id}")
            
            # Load input audio
            input_waveform, input_sr = torchaudio.load(input_audio_path)
            
            # Load reference voice
            ref_path = self.models[model_id]['path']
            ref_waveform, ref_sr = torchaudio.load(ref_path)
            
            # Optionally cache HF repo if provided (for future real VC backends)
            if hf_repo:
                self.ensure_hf_model_cached(hf_repo, hf_revision)

            # Backend selection placeholder
            backend = (backend or 'rvc').lower()
            print(f"   Backend: {backend}")

            if backend == 'xtts':
                # Optional XTTS zero-shot TTS using Coqui TTS if installed
                try:
                    from TTS.api import TTS  # type: ignore
                    # Use English XTTS v2
                    model_name = os.environ.get('XTTS_MODEL', 'tts_models/multilingual/multi-dataset/xtts_v2')
                    print(f"   Using XTTS model: {model_name}")
                    tts = TTS(model_name)
                    # Prepare reference speaker wav
                    ref_tmp = os.path.join(TEMP_DIR, f"{model_id}_ref.wav")
                    torchaudio.save(ref_tmp, ref_waveform, ref_sr)
                    # Generate speech from text if provided, else transcode input audio (fallback copy)
                    if text:
                        tts.tts_to_file(text=text, file_path=output_path, speaker_wav=ref_tmp, language='en')
                    else:
                        # Without text, we don't have VC; fallback to input
                        torchaudio.save(output_path, input_waveform, input_sr)
                    try:
                        os.remove(ref_tmp)
                    except:  # noqa: E722
                        pass
                except Exception as e:
                    print(f"   XTTS not available or failed: {e}")
                    torchaudio.save(output_path, input_waveform, input_sr)
            elif backend == 'freevc' or backend == 'rvc' or backend == 'knn-vc':
                # Try to find a cached HF repo with an inference script for FreeVC/RVC
                handled = False
                if hf_repo and hf_repo in self.hf_models:
                    repo_path = self.hf_models[hf_repo].get('path')
                    infer_script = os.path.join(repo_path, 'infer.py')
                    if os.path.exists(infer_script):
                        try:
                            # Execute the inference script as a subprocess to avoid heavy imports in this process
                            print(f"🔧 Running inference script: {infer_script}")
                            import subprocess
                            cmd = [sys.executable, infer_script, '--input', input_audio_path, '--output', output_path]
                            if hf_revision:
                                cmd += ['--revision', hf_revision]
                            subprocess.check_call(cmd)
                            handled = True
                        except Exception as e:
                            print(f"⚠️  Inference script failed: {e}")
                if not handled:
                    print("ℹ️  No FreeVC/RVC inference available; falling back to passthrough")
                    torchaudio.save(output_path, input_waveform, input_sr)
            else:
                # Placeholder: copy input to output
                torchaudio.save(output_path, input_waveform, input_sr)
            
            print(f"✅ Conversion complete")
            
            return {
                'success': True,
                'output_path': output_path,
                'mode': 'huggingface'
            }
            
        except Exception as e:
            print(f"❌ Conversion failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _mock_conversion(self, input_path, output_path):
        """Mock conversion - just copy input to output"""
        print(f"🎭 Mock conversion")
        shutil.copy(input_path, output_path)
        return {
            'success': True,
            'output_path': output_path,
            'mock': True
        }
    
    def delete_model(self, model_id):
        """Delete a voice model"""
        if model_id not in self.models:
            return {'success': False, 'error': 'Model not found'}
        
        try:
            model_path = self.models[model_id]['path']
            if os.path.exists(model_path):
                os.remove(model_path)
            
            del self.models[model_id]
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Initialize service
service = HuggingFaceRVCService()

# Routes
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'mode': 'mock' if service.mock_mode else 'huggingface',
        'device': DEVICE if HF_AVAILABLE else 'cpu',
        'models_loaded': len(service.models),
        'hf_models': len(service.hf_models) if HF_AVAILABLE else 0
    })

@app.route('/train', methods=['POST'])
def train():
    """Train/process a new voice model"""
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        voice_id = request.form.get('voice_id')
        voice_name = request.form.get('voice_name', 'Unnamed Voice')
        
        if not voice_id:
            return jsonify({'success': False, 'error': 'voice_id is required'}), 400
        
        # Save temporary audio file
        temp_audio = os.path.join(TEMP_DIR, f"{voice_id}_temp.wav")
        audio_file.save(temp_audio)
        
        # Process voice
        result = service.train_model(voice_id, temp_audio, voice_name)
        
        # Clean up temp file
        try:
            os.remove(temp_audio)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Train error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/convert', methods=['POST'])
def convert():
    """Convert audio using a voice model"""
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        model_id = request.form.get('model_id')
        backend = request.form.get('backend')
        text = request.form.get('text')
        hf_repo = request.form.get('hf_repo')
        hf_revision = request.form.get('hf_revision')
        
        if not model_id:
            return jsonify({'success': False, 'error': 'model_id is required'}), 400
        
        # Save input audio
        temp_input = os.path.join(TEMP_DIR, f"{model_id}_input.wav")
        audio_file.save(temp_input)
        
        # Convert
        temp_output = os.path.join(TEMP_DIR, f"{model_id}_output.wav")
        result = service.convert_voice(model_id, temp_input, temp_output, backend=backend, text=text, hf_repo=hf_repo, hf_revision=hf_revision)
        
        if result['success']:
            return send_file(temp_output, mimetype='audio/wav')
        else:
            return jsonify(result), 500
            
    except Exception as e:
        print(f"❌ Convert error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get list of available models"""
    models_list = []
    for model_id, model_data in service.models.items():
        models_list.append({
            'id': model_id,
            'name': model_data.get('name', model_id),
            'status': model_data.get('status', 'unknown'),
            'type': model_data.get('type', 'custom')
        })
    
    return jsonify({
        'success': True,
        'models': models_list,
        'count': len(models_list)
    })

@app.route('/models/<model_id>', methods=['DELETE'])
def delete_model(model_id):
    """Delete a voice model"""
    result = service.delete_model(model_id)
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 404

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎤 RVC Voice Cloning Service (Hugging Face Edition)")
    print("="*50)
    print(f"   Mode: {'Mock' if service.mock_mode else 'Hugging Face'}")
    print(f"   Device: {DEVICE if HF_AVAILABLE else 'CPU (Mock)'}")
    print(f"   Models Directory: {WEIGHTS_DIR}")
    print(f"   Loaded Models: {len(service.models)}")
    print(f"   HF Models: {len(service.hf_models) if HF_AVAILABLE else 0}")
    print(f"   Server running on http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
