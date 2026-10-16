function objectSchema(properties) {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

const text = { type: 'string' };
const textList = { type: 'array', items: { type: 'string' } };

export const VISION_TASKS = {
  describe: {
    instruction:
      'Describe this image. Give a one or two sentence summary, a fuller description of the subject, setting, lighting and style, and up to eight short tags.',
    schema: objectSchema({ summary: text, details: text, tags: textList }),
  },
  question: {
    instruction:
      'Answer the question about this image. If the image does not show the answer, say so plainly.',
    schema: objectSchema({ answer: text }),
  },
  ocr: {
    instruction:
      'Extract all readable text in this image, keeping line breaks. If there is no readable text, set hasText to false and text to an empty string.',
    schema: objectSchema({ hasText: { type: 'boolean' }, text }),
  },
  objects: {
    instruction:
      'List the distinct objects you can see, each with a short name and where it is in the image, for example "top left". Do not give confidence scores or counts you are unsure about.',
    schema: objectSchema({
      objects: {
        type: 'array',
        items: objectSchema({ name: text, location: text }),
      },
    }),
  },
  design: {
    instruction:
      'Analyze the design of this image for a creative team: layout and composition, visual style, mood, typography if any, and up to four practical suggestions.',
    schema: objectSchema({
      layout: text,
      style: text,
      mood: text,
      typography: text,
      suggestions: textList,
    }),
  },
  caption: {
    instruction:
      'Write three different short captions for this image that could be used on social media.',
    schema: objectSchema({ captions: textList }),
  },
};

export const VISION_SYSTEM_PROMPT =
  'You analyze images for a creative studio. Only describe what is visible in the image. Never invent text that is not readable, numbers you cannot see or confidence scores.';
