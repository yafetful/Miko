import { wait } from "@/utils/wait";
import { ElevenLabsService, Model_id, VoicePresets } from '@shared/elevenlabs';
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay, LocalScreenplay } from "./messages";
import { Talk } from "./messages";
import { AudioCache } from '@shared/audio-cache';

// 添加音频源类型定义
type AudioSource = {
  type: 'tts' | 'local';
  content: string; // TTS时为文本，local时为音频文件路径
}

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();
  let tts: ElevenLabsService;

  // 新增：加载本地音频文件
  const loadLocalAudio = async (audioPath: string): Promise<ArrayBuffer> => {
    const response = await fetch(audioPath);
    return await response.arrayBuffer();
  };

  return (
    screenplay: Screenplay | LocalScreenplay,
    viewer: Viewer,
    onStart?: () => void,
    onComplete?: () => void,
    audioSource?: AudioSource
  ) => {
    if (!tts && audioSource?.type !== 'local') {
      tts = ElevenLabsService.getInstance();
    }

    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      let buffer: ArrayBuffer | null = null;
      
      // 根据音频源类型选择不同的处理方式
      if (audioSource?.type === 'local') {
        buffer = await loadLocalAudio(audioSource.content).catch(() => null);
      } else {
        // 确保有 voice_id 和 timestamp
        if ('voice_id' in screenplay && 'timestamp' in screenplay) {
          buffer = await fetchAudio(
            screenplay.talk, 
            screenplay.voice_id,
            screenplay.timestamp
          ).catch(() => null);
        }
      }
      
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (talk: Talk, voice_id: string, timestamp: number): Promise<ArrayBuffer> => {
  // 尝试从缓存获取
  const cachedAudio = await AudioCache.getAudio(timestamp);
  if (cachedAudio) {
    return cachedAudio;
  }

  // 生成新的音频
  const tts = ElevenLabsService.getInstance();
  const audioData = await tts.textToSpeech({
    text: talk.message,
    voice_id: voice_id,
    model_id: Model_id
  });

  // 保存到缓存
  await AudioCache.saveAudio(timestamp, audioData);

  return audioData;
};
