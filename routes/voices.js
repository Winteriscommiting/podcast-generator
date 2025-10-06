const express = require('express');
const { protect } = require('../middleware/auth');
const { getAvailableVoices } = require('../services/tts');

const router = express.Router();

// @desc    Get available voices for a provider
// @route   GET /api/voices/available
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const provider = req.query.provider || 'google';
    const languageCode = req.query.languageCode || 'en-US';
    
    console.log(`🎤 Fetching voices for provider: ${provider}, language: ${languageCode}`);
    
    let voices = [];
    
    if (provider === 'google' || process.env.USE_GOOGLE_TTS === 'true') {
      // Get real Google TTS voices from API
      try {
        const googleVoices = await getAvailableVoices(languageCode);
        
        if (googleVoices && googleVoices.length > 0) {
          voices = googleVoices.map(voice => ({
            id: voice.name,
            name: formatVoiceName(voice.name),
            language: voice.languageCode,
            gender: voice.gender,
            provider: 'google',
            quality: voice.name.includes('Neural') ? 'high' : voice.name.includes('Studio') ? 'premium' : 'standard',
            sampleRate: voice.naturalSampleRateHertz
          }));
          console.log(`   ✅ Loaded ${voices.length} Google TTS voices`);
        } else {
          // Fallback to curated list
          voices = getDefaultGoogleVoices(languageCode);
          console.log(`   ⚠️  Using ${voices.length} fallback voices`);
        }
      } catch (error) {
        // Silently fallback - don't log full error as it's expected without billing
        if (error.message && error.message.includes('PERMISSION_DENIED')) {
          console.log('   ℹ️  Google TTS API not available (billing required), using fallback voices');
        } else {
          console.error('   ❌ Error fetching Google voices:', error.message);
        }
        voices = getDefaultGoogleVoices(languageCode);
      }
    } else if (provider === 'browser') {
      voices = getBrowserVoices();
    } else {
      voices = getDefaultGoogleVoices(languageCode);
    }
    
    res.status(200).json({
      success: true,
      voices,
      provider,
      count: voices.length
    });
  } catch (error) {
    console.error('❌ Error in voices endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      voices: getDefaultGoogleVoices('en-US')
    });
  }
});

/**
 * Format voice name for display
 */
function formatVoiceName(voiceName) {
  return voiceName
    .replace(/^[a-z]{2}-[A-Z]{2}-/, '') // Remove language code prefix
    .replace(/Neural2?-/, 'Neural ') // Format Neural voices
    .replace(/Studio-/, 'Studio ') // Format Studio voices
    .replace(/Wavenet-/, 'Wavenet ') // Format Wavenet voices
    .replace(/-/g, ' '); // Replace remaining hyphens with spaces
}

/**
 * Default Google TTS voices (fallback)
 */
function getDefaultGoogleVoices(languageCode = 'en-US') {
  const allVoices = {
    'en-US': [
      { id: 'en-US-Neural2-A', name: 'Neural A (Male)', language: 'en-US', gender: 'MALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-C', name: 'Neural C (Female)', language: 'en-US', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-D', name: 'Neural D (Male)', language: 'en-US', gender: 'MALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-E', name: 'Neural E (Female)', language: 'en-US', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-F', name: 'Neural F (Female)', language: 'en-US', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-G', name: 'Neural G (Female)', language: 'en-US', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-H', name: 'Neural H (Female)', language: 'en-US', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-I', name: 'Neural I (Male)', language: 'en-US', gender: 'MALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Neural2-J', name: 'Neural J (Male)', language: 'en-US', gender: 'MALE', provider: 'google', quality: 'high' },
      { id: 'en-US-Studio-O', name: 'Studio O (Female Premium)', language: 'en-US', gender: 'FEMALE', provider: 'google', quality: 'premium' },
      { id: 'en-US-Studio-Q', name: 'Studio Q (Male Premium)', language: 'en-US', gender: 'MALE', provider: 'google', quality: 'premium' }
    ],
    'en-GB': [
      { id: 'en-GB-Neural2-A', name: 'Neural A (Female)', language: 'en-GB', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-GB-Neural2-B', name: 'Neural B (Male)', language: 'en-GB', gender: 'MALE', provider: 'google', quality: 'high' },
      { id: 'en-GB-Neural2-C', name: 'Neural C (Female)', language: 'en-GB', gender: 'FEMALE', provider: 'google', quality: 'high' },
      { id: 'en-GB-Neural2-D', name: 'Neural D (Male)', language: 'en-GB', gender: 'MALE', provider: 'google', quality: 'high' }
    ]
  };
  
  return allVoices[languageCode] || allVoices['en-US'];
}

/**
 * Browser voices (Web Speech API)
 */
function getBrowserVoices() {
  return [
    { id: 'default', name: 'Default Voice', language: 'en-US', gender: 'NEUTRAL', provider: 'browser', quality: 'standard' },
    { id: 'male', name: 'Male Voice', language: 'en-US', gender: 'MALE', provider: 'browser', quality: 'standard' },
    { id: 'female', name: 'Female Voice', language: 'en-US', gender: 'FEMALE', provider: 'browser', quality: 'standard' }
  ];
}

module.exports = router;
