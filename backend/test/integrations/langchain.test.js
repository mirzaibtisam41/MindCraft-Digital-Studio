import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import OpenAI from 'openai';
import {
  VISION_TASKS,
  analyzeImageIntegration,
  enhancePromptIntegration,
  mapLangChainErrorIntegration,
} from '#src/integrations/index.js';
import { ProviderError } from '#src/utils/index.js';

function fakeChatModel(onInvoke) {
  const seen = {};

  return {
    seen,
    withStructuredOutput(schema, options) {
      seen.schema = schema;
      seen.options = options;

      return {
        invoke: async (messages) => {
          seen.messages = messages;

          return onInvoke(messages);
        },
      };
    },
  };
}

const IMAGE = { buffer: Buffer.from('png-bytes'), contentType: 'image/png' };

describe('LangChain vision integration', () => {
  it('asks for the task schema and sends the image as a data URL', async () => {
    const chatModel = fakeChatModel(() => ({
      summary: 'A lighthouse',
      details: 'A lighthouse at sunset',
      tags: ['lighthouse'],
    }));

    const result = await analyzeImageIntegration({
      chatModel,
      task: 'describe',
      image: IMAGE,
    });

    assert.equal(result.summary, 'A lighthouse');
    assert.equal(chatModel.seen.schema, VISION_TASKS.describe.schema);
    assert.equal(chatModel.seen.options.method, 'jsonSchema');
    const lastMessage = chatModel.seen.messages.at(-1);
    const imagePart = lastMessage.content.find(
      (part) => part.type === 'image_url',
    );
    assert.equal(
      imagePart.image_url.url,
      `data:image/png;base64,${IMAGE.buffer.toString('base64')}`,
    );
  });

  it('adds the question and earlier turns for follow-up questions', async () => {
    const chatModel = fakeChatModel(() => ({ answer: 'Red' }));

    await analyzeImageIntegration({
      chatModel,
      task: 'question',
      question: 'What color is the roof?',
      history: [{ question: 'What is this?', answer: 'A lighthouse.' }],
      image: IMAGE,
    });

    const messages = chatModel.seen.messages;
    assert.equal(messages.length, 4);
    assert.equal(messages[1].content, 'What is this?');
    assert.equal(messages[2].content, 'A lighthouse.');
    const instruction = messages[3].content.find(
      (part) => part.type === 'text',
    );
    assert.match(instruction.text, /Question: What color is the roof\?/);
  });

  it('turns model errors into provider error categories', async () => {
    const timeout = new Error('Request timed out');
    timeout.name = 'TimeoutError';
    const rateLimit = OpenAI.APIError.generate(
      429,
      { error: { code: 'rate_limit_exceeded', message: 'slow down' } },
      'slow down',
      new Headers(),
    );

    assert.equal(mapLangChainErrorIntegration({ error: timeout }), 'timeout');
    assert.equal(
      mapLangChainErrorIntegration({ error: rateLimit }),
      'rate_limited',
    );

    await assert.rejects(
      analyzeImageIntegration({
        chatModel: fakeChatModel(() => {
          throw rateLimit;
        }),
        task: 'ocr',
        image: IMAGE,
      }),
      (error) =>
        error instanceof ProviderError &&
        error.category === 'rate_limited' &&
        error.cause === rateLimit,
    );
  });

  it('has a strict schema for every task', () => {
    for (const [task, definition] of Object.entries(VISION_TASKS)) {
      assert.equal(definition.schema.additionalProperties, false, task);
      assert.deepEqual(
        definition.schema.required,
        Object.keys(definition.schema.properties),
        task,
      );
    }
  });

  it('enhances a prompt with the style and returns the added phrases', async () => {
    const chatModel = fakeChatModel(() => ({
      enhancedPrompt: 'a red fox in snow, golden hour light',
      addedDescriptors: ['golden hour light'],
    }));

    const result = await enhancePromptIntegration({
      chatModel,
      prompt: 'a red fox in snow',
      style: 'Cinematic',
    });

    assert.deepEqual(result.addedDescriptors, ['golden hour light']);
    assert.equal(chatModel.seen.options.name, 'enhanced_prompt');
    assert.match(
      chatModel.seen.messages[0].content,
      /never add a new main subject/,
    );
    assert.equal(
      chatModel.seen.messages[1].content,
      'Prompt: a red fox in snow\nStyle: Cinematic',
    );
  });
});
