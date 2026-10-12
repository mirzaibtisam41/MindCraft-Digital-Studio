import { GENERATION_STYLE_PRESETS } from '#src/modules/generations/generation-style-preset.constants.js';

export function applyStylePresetUtil({ prompt, style }) {
  const preset = GENERATION_STYLE_PRESETS.find(({ id }) => id === style);

  return preset ? `${prompt}, ${preset.promptSuffix}` : prompt;
}
