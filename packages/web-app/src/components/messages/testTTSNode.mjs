import { ElevenLabsService, VoicePresets } from '../../../shared/dist/index.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function saveTestAudioNode() {
  try {
    console.log('Starting TTS test...');
    const tts = ElevenLabsService.getInstance();
    
    // ... 其余代码保持不变 ...
  } catch (error) {
    console.error('Error in TTS test:', error);
  }
}

saveTestAudioNode().then(() => {
  console.log('Test completed');
}).catch(error => {
  console.error('Test failed:', error);
}); 