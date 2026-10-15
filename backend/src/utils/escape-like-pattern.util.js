export function escapeLikePatternUtil({ text }) {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}
