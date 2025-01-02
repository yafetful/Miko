import { ElevenLabsService, VoicePresets, Model_id } from '@shared/elevenlabs';

async function testTextToSpeech() {
  try {
    console.log('Starting TTS test...');
    const tts = ElevenLabsService.getInstance();
    
    // 测试获取声音列表
    const voices = await tts.getVoices();
    console.log('Available voices:', voices);

    // 测试文本转语音
    const testText = "Hello! This is a test of the text to speech system. How does my voice sound?此参数主要通过禁用块调度和所有缓冲区来减少延迟。仅建议在发送完整句子或短语时使用，发送部分短语会导致质量大幅下降。默认情况下，它设置为 false。";
    console.log('Converting text to speech:', testText);
    
    const audioBuffer = await tts.textToSpeech({
      text: testText,
      voice_id: VoicePresets.zh.voice_id,
      model_id: Model_id
    });

    // 创建音频元素并播放
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'test-speech.mp3'; // 设置下载文件名
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      console.log('Audio playback completed');
    };

    console.log('Playing audio...');
    await audio.play();

  } catch (error) {
    console.error('Error in TTS test:', error);
  }
}

// 添加一个只保存不播放的函数
async function saveTestAudio() {
  try {
    console.log('Starting TTS test (save only)...');
    const tts = ElevenLabsService.getInstance();
    
    const testText = "Hello! This is a test of the text to speech system. How does my voice sound?";
    console.log('Converting text to speech:', testText);
    
    const audioBuffer = await tts.textToSpeech({
      text: testText,
      voice_id: VoicePresets.zh.voice_id,
      model_id: Model_id
    });

    // 只创建下载链接
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'test-speech.mp3';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // 清理 URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    console.log('Audio file saved');
  } catch (error) {
    console.error('Error in TTS test:', error);
  }
}

export { testTextToSpeech, saveTestAudio };

// 测试保存功能
/*
saveTestAudio().then(() => {
  console.log('Save completed');
}).catch(error => {
  console.error('Save failed:', error);
});
*/ 