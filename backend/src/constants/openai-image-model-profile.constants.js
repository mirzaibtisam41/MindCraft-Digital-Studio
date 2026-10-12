import { OPENAI_IMAGE_MODEL } from './openai-image-model.constants.js';

export const OPENAI_IMAGE_MODEL_PROFILES = {
  [OPENAI_IMAGE_MODEL.GPT_IMAGE_1_MINI]: {
    label: 'GPT Image 1 Mini',
    inputFidelities: ['low'],
  },
  [OPENAI_IMAGE_MODEL.GPT_IMAGE_1]: {
    label: 'GPT Image 1',
    inputFidelities: ['low', 'high'],
  },
};
