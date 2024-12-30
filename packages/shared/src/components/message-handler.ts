import type { MessageResult } from '../types/chat';

export class MessageHandler {
  private jsonBuffer: string = '';
  private textBuffer: string = '';
  private isJsonMessage: boolean = false;
  private isPotentialCommand: boolean = false;

  processMessage(content: string): MessageResult {
    // 第一次收到消息时判断类型
    if (!this.jsonBuffer && !this.textBuffer) {
      const trimmedContent = content.trim();
      if (trimmedContent.startsWith('{')) {
        this.isJsonMessage = true;
      } else if (trimmedContent.startsWith('[')) {
        this.isPotentialCommand = true;
      }
    }

    // 处理不同类型的消息
    if (this.isJsonMessage) {
      this.jsonBuffer += content;
      try {
        JSON.parse(this.jsonBuffer);
        return {
          type: 'json',
          content: this.jsonBuffer,
          isComplete: true
        };
      } catch {
        return {
          type: 'json',
          content: this.jsonBuffer,
          isComplete: false
        };
      }
    }

    if (this.isPotentialCommand) {
      this.textBuffer += content;
      const isComplete = this.textBuffer.endsWith(']');
      
      if (isComplete) {
        const isRealCommand = this.textBuffer.includes('[mikoCmd:');
        return {
          type: 'text',
          content: this.textBuffer,
          isComplete: true,
          isCommand: isRealCommand
        };
      }

      return {
        type: 'text',
        content: this.textBuffer,
        isComplete: false,
        isCommand: false
      };
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
    this.isPotentialCommand = false;
  }
}
