import EmojiConvertor from "emoji-js";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified"; // Use native Unicode emojis

export function emojify(text: string): string {
  return emoji.replace_colons(text);
}
