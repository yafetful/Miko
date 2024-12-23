import { CSSProperties, SyntheticEvent } from 'react';

export type SoundType = 'hey' | 'huh' | 'pluh';

export interface AudioAsset {
  src: string | string[];
  volume: number;
  preload: boolean;
}

export interface Character {
  skin: string;
  direction: number;
  keys: string[];
  sound: string;
  soundAsset: AudioAsset;
  animation: string;
}

export interface SpineAnimationProps {
  onKeyDown?: (event: KeyboardEvent) => void;
  onClick?: (event: SyntheticEvent) => void;
  className?: string;
  style?: CSSProperties;
  backgroundColor?: string | number;
}

export interface SpineAssets {
  data: {
    alias: string;
    src: string;
  };
  atlas: {
    alias: string;
    src: string;
  };
}

export interface CharacterSetConfig {
  scale: number;
  yOffset: number;
  defaultMix: number;
  walkSpeed: number;
  animationSpeed: number;
}

export interface CharacterSet {
  name: string;
  assets: SpineAssets;
  config: CharacterSetConfig;
  sounds: Record<string, AudioAsset>;
} 