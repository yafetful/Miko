export type LanguageCode = keyof typeof VoicePresets;

export const Model_id = "eleven_turbo_v2_5";

export const VoicePresets = {
  jp: {
    voice_id: "8EkOjt4xTPGMclNlh1pk", // Morioki voice ID
    voice_settings: {
      stability: 0.9,
      similarity_boost: 1,
      use_speaker_boost: true
    }
  },
  en: {
    voice_id: "aEO01A4wXwd1O8GPgGlF", // Arabella voice ID
    voice_settings: {
      stability: 0.53,
      similarity_boost: 1,
      use_speaker_boost: true
    }
  },
  fr: {
    voice_id: "FvmvwvObRqIHojkEGh5N", // Adina voice ID
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.9,
      use_speaker_boost: true
    }
  },
  es: {
    voice_id: "gD1IexrzCvsXPHUuT0s3", // Sara Martin voice ID
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
      use_speaker_boost: true
    }
  },
  kr: {
    voice_id: "DMkRitQrfpiddSQT5adl", // Jjeong voice ID
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.75,
      use_speaker_boost: true
    }
  },
  zh: {
    voice_id: "hkfHEbBvdQFNX4uWHqRF", // Stacy voice ID
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.9,
      use_speaker_boost: true
    }
  }
} as const; 