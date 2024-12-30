import type { MessageResult } from '../types/chat';

export class MessageHandler {
  private jsonBuffer: string = '';
  private textBuffer: string = '';
  private isJsonMessage: boolean = false;

  processMessage(content: string): MessageResult {
    // 第一次收到消息时判断类型
    if (!this.jsonBuffer && !this.textBuffer && content.trim().startsWith('{')) {
      this.isJsonMessage = true;
    }

    if (this.isJsonMessage) {
      this.jsonBuffer += content;
      try {
        // 尝试解析完整的JSON
        JSON.parse(this.jsonBuffer);
        // 如果解析成功，返回处理后的消息和类型
        return {
          type: 'json',
          content: this.jsonBuffer,
          isComplete: true
        };
      } catch {
        // JSON 还不完整，继续累积
        return {
          type: 'json',
          content: this.jsonBuffer,
          isComplete: false
        };
      }
    }

    // 普通文本消息
    this.textBuffer += content;
    return {
      type: 'text',
      content: this.textBuffer,
      isComplete: true
    };
  }

  reset() {
    this.jsonBuffer = '';
    this.textBuffer = '';
    this.isJsonMessage = false;
  }
}
