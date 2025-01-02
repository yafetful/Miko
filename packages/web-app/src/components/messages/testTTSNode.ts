import { ElevenLabsService, Model_id, VoicePresets } from '@shared/elevenlabs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function saveTestAudioNode() {
  try {
    console.log('Starting TTS test...');
    const tts = ElevenLabsService.getInstance();
    
    // 测试获取声音列表
    const voices = await tts.getVoices();
    console.log('Available voices:', voices);

    const testText = "Hello! This is a test of the text to speech system. How does my voice sound?此参数主要通过禁用块调度和所有缓冲区来减少延迟。仅建议在发送完整句子或短语时使用，发送部分短语会导致质量大幅下降。默认情况下，它设置为 false。";
    console.log('Converting text to speech:', testText);
    
    const audioBuffer = await tts.textToSpeech({
      text: testText,
      voice_id: VoicePresets.zh.voice_id,
      model_id: Model_id
    });

    // 保存文件
    const outputPath = join(__dirname, 'test-speech.mp3');
    await writeFile(outputPath, Buffer.from(audioBuffer));
    console.log('Audio file saved to:', outputPath);

  } catch (error) {
    console.error('Error in TTS test:', error);
  }
}

// 直接运行测试
saveTestAudioNode().then(() => {
  console.log('Test completed');
}).catch(error => {
  console.error('Test failed:', error);
}); 