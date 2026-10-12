export const GENERATION_STYLE_PRESETS = [
  {
    id: 'photorealistic',
    label: 'Photorealistic',
    promptSuffix:
      'photorealistic, natural lighting, sharp focus, realistic textures',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    promptSuffix:
      'cinematic still, dramatic lighting, shallow depth of field, film grain',
  },
  {
    id: 'anime',
    label: 'Anime',
    promptSuffix: 'anime style, clean line art, vibrant colors, cel shading',
  },
  {
    id: 'digital-art',
    label: 'Digital art',
    promptSuffix: 'digital illustration, detailed, rich colors, concept art',
  },
  {
    id: 'oil-painting',
    label: 'Oil painting',
    promptSuffix: 'oil painting, visible brush strokes, rich canvas texture',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    promptSuffix: 'watercolor painting, soft washes, paper texture',
  },
  {
    id: '3d-render',
    label: '3D render',
    promptSuffix: '3D render, soft studio lighting, smooth materials',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    promptSuffix: 'minimalist, simple shapes, plenty of negative space',
  },
  {
    id: 'pixel-art',
    label: 'Pixel art',
    promptSuffix: 'pixel art, limited palette, crisp pixels',
  },
];

export const GENERATION_STYLE_PRESET_IDS = GENERATION_STYLE_PRESETS.map(
  (preset) => preset.id,
);

export const GENERATION_STYLE_MAX_LENGTH = 40;
