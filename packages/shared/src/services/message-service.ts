import { MessageResult } from '../hooks/useChat';

export class MessageService {
  private jsonBuffer = '';

  processStreamMessage(content: string): MessageResult {
    this.jsonBuffer += content;
    
    try {
      const parsedContent = JSON.parse(this.jsonBuffer);
      // 如果成功解析为 JSON，检查是否是完成消息
      this.jsonBuffer = '';
    //   console.log('是Json');

      // 如果是完成消息，返回空内容
      if (parsedContent?.type === 'msg' && 
          parsedContent?.category === 'workflow' && 
          parsedContent?.message === 'done') {
        // console.log('是完成消息');
        return { type: 'buffering' };  // 或者返回 { type: 'formatted', content: null }
      }

      return {
        type: 'formatted',
        content: parsedContent
      };
    } catch {
      // 如果不是 JSON 开始，则作为普通文本处理
      if (!this.jsonBuffer.includes('{')) {
        // console.log('不是Json');
        const text = this.jsonBuffer;
        this.jsonBuffer = '';
        return {
          type: 'text',
          content: text
        };
      }
      // 可能是不完整的 JSON，继续缓冲
      return {
        type: 'buffering'
      };
    }
  }
} 