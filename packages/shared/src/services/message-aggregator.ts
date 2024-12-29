type AggregatedMessage = {
  coin: string;
  messages: any[];
  isComplete: boolean;
};

export class MessageAggregator {
  private isCollecting: boolean = false;
  private currentMessages: any[] = [];
  private currentCoin: string = '';

  reset() {
    this.isCollecting = false;
    this.currentMessages = [];
    this.currentCoin = '';
  }

  processMessage(content: any): {
    shouldAggregate: boolean;
    shouldRender: boolean;
    message?: any;
    aggregatedData?: AggregatedMessage;
    isComplete?: boolean;
  } {
    // 如果是字符串指令
    if (typeof content === 'string' && content.startsWith('[miko]')) {
        console.log('开始收集消息', content);
      this.isCollecting = true;
      this.currentCoin = content.replace('[miko]', '').trim();
      return { shouldAggregate: true, shouldRender: false };
    }

    // 如果是正在收集状态
    if (this.isCollecting) {
      // 检查是否是结束消息
      if (this.isCompletionMessage(content)) {
        this.isCollecting = false;
        const aggregatedData = {
          coin: this.currentCoin,
          messages: this.currentMessages,
          isComplete: true
        };
        this.currentMessages = [];
        return {
          shouldAggregate: false,
          shouldRender: true,
          aggregatedData,
          isComplete: true
        };
      }

      // 继续收集消息
      this.currentMessages.push(content);
      return { shouldAggregate: true, shouldRender: false };
    }

    // 普通消息直接渲染，并重置状态
    this.reset();
    return {
      shouldAggregate: false,
      shouldRender: true,
      message: content
    };
  }

  private isCompletionMessage(content: any): boolean {
    return (
      content?.type === 'msg' &&
      content?.category === 'workflow' &&
      content?.message === 'done'
    );
  }
} 