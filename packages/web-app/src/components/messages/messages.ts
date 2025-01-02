import { VRMExpression, VRMExpressionPresetName } from "@pixiv/three-vrm";
import { KoeiroParam } from "./koeiroParam";

// ChatGPT API message format
export type Message = {
  role: "assistant" | "system" | "user";
  content: string;
};

// Available talk styles for character expressions
const talkStyles = [
  "talk",    // normal talking
  "happy",   // happy expression
  "sad",     // sad expression
  "angry",   // angry expression
  "fear",    // fearful expression
  "surprised", // surprised expression
] as const;
export type TalkStyle = (typeof talkStyles)[number];

/**
 * Basic talk configuration for character speech
 */
export type Talk = {
  style: TalkStyle;          // Expression style during speech
  speakerX: number;         // Horizontal position of speaker (0 = center)
  speakerY: number;         // Vertical position of speaker (0 = center)
  message: string;          // Text content to be spoken
};

// Available emotion types that match VRM expression presets
const emotions = ["neutral", "happy", "angry", "sad", "relaxed"] as const;
type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName;

/**
 * Complete screenplay configuration for character performance
 * Combines both expression and speech
 */
export type Screenplay = {
  expression: EmotionType;   // VRM model expression to display
  talk: Talk;               // Speech configuration
  voice_id: string;
  timestamp: number;        // Add timestamp field
};

/**
 * Split text into sentences for sequential processing
 * @param text - Input text to be split
 * @returns Array of sentence strings
 */
export const splitSentence = (text: string): string[] => {
  const splitMessages = text.split(/(?<=[。．！？\n])/g);
  return splitMessages.filter((msg) => msg !== "");
};

/**
 * Convert text array into screenplay configurations
 * @param texts - Array of text messages
 * @param koeiroParam - Voice parameters
 * @returns Array of screenplay configurations
 */
export const textsToScreenplay = (
  texts: string[],
  koeiroParam: KoeiroParam
): Screenplay[] => {
  const screenplays: Screenplay[] = [];
  let prevExpression = "neutral";

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    // Check for emotion tags in square brackets [emotion]
    const match = text.match(/\[(.*?)\]/);
    const tag = (match && match[1]) || prevExpression;
    
    // Remove emotion tags from the message
    const message = text.replace(/\[(.*?)\]/g, "");

    let expression = prevExpression;
    if (emotions.includes(tag as any)) {
      expression = tag;
      prevExpression = tag;
    }

    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        style: emotionToTalkStyle(expression as EmotionType),
        speakerX: koeiroParam.speakerX,
        speakerY: koeiroParam.speakerY,
        message: message,
      },
      voice_id: "",
      timestamp: 0,
    });
  }

  return screenplays;
};

/**
 * Convert emotion type to corresponding talk style
 * @param emotion - VRM emotion type
 * @returns Appropriate talk style for the emotion
 */
const emotionToTalkStyle = (emotion: EmotionType): TalkStyle => {
  switch (emotion) {
    case "angry":
      return "angry";
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    default:
      return "talk";
  }
};

// 添加 LocalScreenplay 类型定义
export type LocalScreenplay = {
  expression: EmotionType;
  talk: Talk;
};
