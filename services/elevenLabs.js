const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ElevenLabsService {
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        this.baseURL = 'https://api.elevenlabs.io/v1';
    }

    /**
     * Get all available voices
     */
    async getVoices() {
        try {
            const response = await axios.get(`${this.baseURL}/voices`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            return response.data.voices;
        } catch (error) {
            console.error('Error fetching voices:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Clone a voice from audio samples
     * @param {string} name - Name for the cloned voice
     * @param {Array} audioFiles - Array of audio file paths (min 1, max 25)
     * @param {string} description - Optional description
     */
    async cloneVoice(name, audioFiles, description = '') {
        try {
            const formData = new FormData();
            formData.append('name', name);
            
            if (description) {
                formData.append('description', description);
            }

            // Add audio files
            for (const filePath of audioFiles) {
                formData.append('files', fs.createReadStream(filePath));
            }

            const response = await axios.post(
                `${this.baseURL}/voices/add`,
                formData,
                {
                    headers: {
                        'xi-api-key': this.apiKey,
                        ...formData.getHeaders()
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error cloning voice:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate speech from text using a voice
     * @param {string} text - Text to convert to speech
     * @param {string} voiceId - Voice ID to use
     * @param {string} outputPath - Path to save audio file
     */
    async textToSpeech(text, voiceId, outputPath) {
        try {
            const response = await axios.post(
                `${this.baseURL}/text-to-speech/${voiceId}`,
                {
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                },
                {
                    headers: {
                        'xi-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream'
                }
            );

            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(outputPath));
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('Error generating speech:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Delete a cloned voice
     * @param {string} voiceId - Voice ID to delete
     */
    async deleteVoice(voiceId) {
        try {
            await axios.delete(`${this.baseURL}/voices/${voiceId}`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            return { success: true };
        } catch (error) {
            console.error('Error deleting voice:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get voice details
     * @param {string} voiceId - Voice ID
     */
    async getVoiceDetails(voiceId) {
        try {
            const response = await axios.get(`${this.baseURL}/voices/${voiceId}`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching voice details:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new ElevenLabsService();
