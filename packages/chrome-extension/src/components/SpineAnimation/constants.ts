import { Character } from './types';
import { CHARACTER_SETS } from './characterSets';

// 动画相关配置
export const ANIMATIONS = {
  IDLE: "Idle",
  WALK: "walk",
  JUMP: "Jump",
  STUN: "Stuned",
  ROLL: "Roll"
} as const;

// 通用动画参数配置
export const ANIMATION_CONFIG = {
  CHARACTER_SPACING: 24,
  OFFSCREEN_OFFSET: 50,
  ANIMATION_DURATION: 1000,
} as const;

// 标点符号映射
export const punctuationMap: Record<string, string> = {
  '！': '!',
  '？': '?',
  '。': '.',
  '．': '.',
  '｡': '.',
};

// 音频类型映射
export const SOUNDS = {
  HEY: 'hey',
  HUH: 'huh',
  PLUH: 'pluh'
} as const;

// characters 数组现在需要根据选择的角色组来动态生成
export const getCharacters = (characterSetKey: string): Character[] => {
  const characterSet = CHARACTER_SETS[characterSetKey];
  
  return [
    { 
      skin: 'Character01', 
      direction: -1, 
      keys: [' ', '?', '!', '.'], 
      sound: SOUNDS.HUH,
      soundAsset: characterSet.sounds.HUH,
      animation: ANIMATIONS.STUN 
    },
    { 
      skin: 'Character02', 
      direction: 1, 
      keys: ['q', 'w', 'e', 'r'], 
      sound: SOUNDS.HEY,
      soundAsset: characterSet.sounds.HEY,
      animation: ANIMATIONS.JUMP 
    },
    { skin: 'Character03', direction: 1, keys: ['t', 'y', 'u', 'i'], sound: SOUNDS.HEY, soundAsset: characterSet.sounds.HEY, animation: ANIMATIONS.JUMP },
    { skin: 'Character04', direction: -1, keys: ['a', 's', 'd', 'f'], sound: SOUNDS.HEY, soundAsset: characterSet.sounds.HEY, animation: ANIMATIONS.JUMP },
    { skin: 'Character05', direction: 1, keys: ['g', 'h', 'j', 'k'], sound: SOUNDS.HEY, soundAsset: characterSet.sounds.HEY, animation: ANIMATIONS.JUMP },
    { skin: 'Character06', direction: -1, keys: ['z', 'x', 'c', 'v'], sound: SOUNDS.HEY, soundAsset: characterSet.sounds.HEY, animation: ANIMATIONS.JUMP },
    { skin: 'Character07', direction: -1, keys: ['b', 'n', 'm'], sound: SOUNDS.HEY, soundAsset: characterSet.sounds.HEY, animation: ANIMATIONS.JUMP },
    { skin: 'Character08', direction: 1, keys: ['o', 'p', 'l'], sound: SOUNDS.HEY, soundAsset: characterSet.sounds.HEY, animation: ANIMATIONS.JUMP },
    { 
      skin: 'Character09', 
      direction: 1, 
      keys: ['enter'], 
      sound: SOUNDS.PLUH, 
      soundAsset: characterSet.sounds.PLUH, 
      animation: ANIMATIONS.ROLL 
    },
  ];
};

export const SUPPORTED_KEYS = {
  PUNCTUATION: ['.', '!', '?', ' '] as string[],
  ENTER: 'enter',
} as const;