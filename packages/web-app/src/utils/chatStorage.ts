interface ChatMessage {
  role: 'User' | 'Assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface UserChatHistory {
  conversations: Record<string, Conversation>;
  lastUpdated: number;
}

export class ChatStorageManager {
  private getStorageKey(walletAddress: string) {
    return `chat_history_${walletAddress}`;
  }

  saveMessage(walletAddress: string, conversationId: string, message: ChatMessage) {
    if (!walletAddress || !conversationId) return;

    const key = this.getStorageKey(walletAddress);
    const existingData = localStorage.getItem(key);
    let history: UserChatHistory;

    if (existingData) {
      history = JSON.parse(existingData);
      if (!history.conversations[conversationId]) {
        history.conversations[conversationId] = {
          id: conversationId,
          messages: [],
          lastUpdated: Date.now()
        };
      }
    } else {
      history = {
        conversations: {
          [conversationId]: {
            id: conversationId,
            messages: [],
            lastUpdated: Date.now()
          }
        },
        lastUpdated: Date.now()
      };
    }

    history.conversations[conversationId].messages.push(message);
    history.conversations[conversationId].lastUpdated = Date.now();
    history.lastUpdated = Date.now();

    localStorage.setItem(key, JSON.stringify(history));
  }

  getHistory(walletAddress: string): UserChatHistory | null {
    if (!walletAddress) return null;
    const key = this.getStorageKey(walletAddress);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  getConversation(walletAddress: string, conversationId: string): Conversation | null {
    const history = this.getHistory(walletAddress);
    return history?.conversations[conversationId] || null;
  }

  clearConversation(walletAddress: string, conversationId: string) {
    if (!walletAddress) return;
    const history = this.getHistory(walletAddress);
    if (history && history.conversations[conversationId]) {
      delete history.conversations[conversationId];
      localStorage.setItem(this.getStorageKey(walletAddress), JSON.stringify(history));
    }
  }

  clearAllHistory(walletAddress: string) {
    if (!walletAddress) return;
    localStorage.removeItem(this.getStorageKey(walletAddress));
  }
}

export const chatStorage = new ChatStorageManager(); 