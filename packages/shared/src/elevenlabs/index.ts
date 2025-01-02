import { ElevenLabsClient } from "elevenlabs";
import { VoicePresets, Model_id, type LanguageCode } from "./config";

export interface TTSOptions {
  text: string;
  voice_id: string;
  model_id?: string;
}

export class ElevenLabsService {
  private static instance: ElevenLabsService;
  private client: ElevenLabsClient;
  
  private constructor() {
    this.client = new ElevenLabsClient({
      apiKey: 'sk_01830658b133ae71bb9edb68e44b5fd51abbf09ee72a2add',
    });
  }

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  async getVoices() {
    try {
      const voices = await this.client.voices.getAll();
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      throw error;
    }
  }

  async textToSpeech({
    text,
    voice_id,
    model_id = Model_id
  }: TTSOptions): Promise<ArrayBuffer> {
    try {
      const response = await this.client.textToSpeech.convert(voice_id, {
        text,
        model_id
      });

      // 先收集所有的数据块
      const chunks: Uint8Array[] = [];
      for await (const chunk of response) {
        chunks.push(chunk);
      }
      
      // 合并所有数据块成一个 ArrayBuffer
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result.buffer;
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }

  // 流式转换方法保持不变
  async textToSpeechStream({
    text,
    voice_id,
    model_id = Model_id
  }: TTSOptions) {
    try {
      return await this.client.textToSpeech.convertAsStream(voice_id, {
        text,
        model_id
      });
    } catch (error) {
      console.error('Error streaming text to speech:', error);
      throw error;
    }
  }
}

export { Model_id, VoicePresets, type LanguageCode }; 