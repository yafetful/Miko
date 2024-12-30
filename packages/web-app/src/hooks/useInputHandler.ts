import { KeyboardEvent } from 'react';

export function useInputHandler() {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // 处理字母键
    if (event.code.startsWith('Key')) {
      emitCharacterEvent(event.code.slice(3).toLowerCase());
    }
    // 处理回车键
    else if (event.code === 'Enter') {
      emitCharacterEvent('enter');
    }
    // 处理标点符号
    else {
      const codeMap: Record<string, string> = {
        'Period': '.',
        'Slash': '?',
        'Space': ' ',
        'Digit1': '!',
      };

      const char = codeMap[event.code] || event.key;
      if ([' ', '?', '!', '.'].includes(char)) {
        emitCharacterEvent(char);
      }
    }
  };

  const emitCharacterEvent = (char: string) => {
    window.dispatchEvent(new CustomEvent('character-input', {
      detail: { char }
    }));
  };

  return { handleKeyDown };
} 