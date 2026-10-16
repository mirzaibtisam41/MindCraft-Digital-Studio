import {
  IMAGE_ANALYSIS_QUESTION_MAX_LENGTH,
  IMAGE_ANALYSIS_TASKS,
} from '#src/modules/image-analyses/image-analysis.constants.js';

export const createImageAnalysisBodySchema = {
  type: 'object',
  required: ['imageId', 'task'],
  properties: {
    imageId: { type: 'string', format: 'uuid' },
    task: { type: 'string', enum: IMAGE_ANALYSIS_TASKS },
    question: {
      type: 'string',
      minLength: 1,
      maxLength: IMAGE_ANALYSIS_QUESTION_MAX_LENGTH,
      pattern: '\\S',
    },
  },
  additionalProperties: false,
};
