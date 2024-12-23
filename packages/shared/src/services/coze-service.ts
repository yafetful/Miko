import { CozeAPI, ChatEventType, RoleType, type EnterMessage, type FileObject, type CreateChatData } from '@coze/api';
import type { ChatConfig, StreamChatConfig } from '../types/chat';

export class CozeService {
  private client: CozeAPI;
  private botId: string;
  private fileInfo?: FileObject;

  constructor(config: ChatConfig) {
    this.client = new CozeAPI({
      token: config.pat,
      baseURL: config.baseUrl,
      allowPersonalAccessTokenInBrowser: true,
    });
    this.botId = config.botId;
  }

  private createMessage(query: string, fileInfo?: FileObject): EnterMessage[] {
    const baseMessage: EnterMessage = {
      role: RoleType.User,
      type: 'question',
    };

    if (fileInfo) {
      return [{
        ...baseMessage,
        content: [
          { type: 'text', text: query },
          { type: 'file', file_id: fileInfo.id },
        ],
        content_type: 'object_string',
      }];
    }

    return [{
      ...baseMessage,
      content: [{ type: 'text', text: query }],
      content_type: 'text',
    }];
  }

  async streamChat(config: StreamChatConfig): Promise<void> {
    const { query, conversationId, user_id, meta_data, onUpdate, onSuccess, onCreated } = config;
    const messages = this.createMessage(query, this.fileInfo);
    
    console.log('Sending chat request:', {
      bot_id: this.botId,
      user_id,
      messages,
      conversation_id: conversationId,
      meta_data,
      auto_save_history: true
    });
    
    try {
      const stream = await this.client.chat.stream({
        bot_id: this.botId,
        user_id,
        auto_save_history: true,
        additional_messages: messages,
        conversation_id: conversationId,
        meta_data,
      });
      
      let msg = '';

      for await (const part of stream) {
        switch (part.event) {
          case ChatEventType.CONVERSATION_CHAT_CREATED:
            console.log('[START]');
            onCreated(part.data);
            break;
          case ChatEventType.CONVERSATION_MESSAGE_DELTA:
            msg += part.data.content;
            onUpdate(msg);
            break;
          case ChatEventType.CONVERSATION_MESSAGE_COMPLETED:
            const { role, type, content: msgContent, content_type } = part.data;
            console.log('content_type', content_type);
            if (role === 'assistant' && type === 'answer') {
              if (content_type === 'card') {
                // 如果是card类型,显示原始JSON
                msg = JSON.stringify(msgContent, null, 2);
              }
              msg += '\n';
              onSuccess(msg);
            }
            break;
          case ChatEventType.CONVERSATION_CHAT_COMPLETED:
            console.log('Usage:', part.data.usage);
            break;
          case ChatEventType.DONE:
            console.log('Done:', part.data);
            break;
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async uploadFile(file?: File) {
    if (!file) {
      this.fileInfo = undefined;
      return;
    }

    const response = await this.client.files.upload({ file });
    this.fileInfo = response;
    return response;
  }

  async getBotInfo() {
    return await this.client.bots.retrieve({
      bot_id: this.botId,
    });
  }
}
