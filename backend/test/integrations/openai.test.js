import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import OpenAI, { APIConnectionError, APIConnectionTimeoutError } from 'openai';
import {
  generateOpenAiImagesIntegration,
  mapOpenAiErrorIntegration,
} from '#src/integrations/index.js';
import { ProviderError } from '#src/utils/index.js';

function apiError(status, code) {
  return OpenAI.APIError.generate(
    status,
    { error: { code, message: 'provider message', type: 'test' } },
    'provider message',
    new Headers(),
  );
}

function fakeClient(generate) {
  return { images: { generate } };
}

describe('OpenAI integration', () => {
  describe('mapOpenAiErrorIntegration', () => {
    const cases = [
      ['safety block', apiError(400, 'moderation_blocked'), 'safety_rejected'],
      [
        'content policy',
        apiError(400, 'content_policy_violation'),
        'safety_rejected',
      ],
      ['other bad request', apiError(400, 'invalid_size'), 'invalid_request'],
      [
        'wrong api key',
        apiError(401, 'invalid_api_key'),
        'provider_auth_failed',
      ],
      ['no access', apiError(403, null), 'provider_auth_failed'],
      ['rate limit', apiError(429, 'rate_limit_exceeded'), 'rate_limited'],
      ['no quota', apiError(429, 'insufficient_quota'), 'quota_exceeded'],
      ['server error', apiError(500, null), 'provider_unavailable'],
      ['timeout', new APIConnectionTimeoutError(), 'timeout'],
      [
        'connection error',
        new APIConnectionError({ message: 'down' }),
        'provider_unavailable',
      ],
      ['unknown error', new Error('boom'), 'unknown'],
    ];

    for (const [name, error, category] of cases) {
      it(`maps ${name} to ${category}`, () => {
        assert.equal(mapOpenAiErrorIntegration({ error }), category);
      });
    }
  });

  describe('generateOpenAiImagesIntegration', () => {
    it('sends the options and returns image buffers', async () => {
      let sentRequest;
      const client = fakeClient(async (request) => {
        sentRequest = request;

        return {
          data: [
            { b64_json: Buffer.from('first').toString('base64') },
            { b64_json: Buffer.from('second').toString('base64') },
          ],
          usage: { total_tokens: 10 },
        };
      });

      const result = await generateOpenAiImagesIntegration({
        client,
        model: 'gpt-image-1',
        prompt: 'a red fox',
        size: '1024x1024',
        quality: 'low',
        outputFormat: 'webp',
        n: 2,
      });

      assert.deepEqual(sentRequest, {
        model: 'gpt-image-1',
        prompt: 'a red fox',
        size: '1024x1024',
        quality: 'low',
        output_format: 'webp',
        n: 2,
      });
      assert.deepEqual(
        result.imageBuffers.map((buffer) => buffer.toString()),
        ['first', 'second'],
      );
      assert.deepEqual(result.usage, { total_tokens: 10 });
    });

    it('turns a provider error into a ProviderError with a category', async () => {
      const providerError = apiError(400, 'moderation_blocked');
      const client = fakeClient(async () => {
        throw providerError;
      });

      await assert.rejects(
        generateOpenAiImagesIntegration({ client, prompt: 'x', n: 1 }),
        (error) => {
          assert.ok(error instanceof ProviderError);
          assert.equal(error.category, 'safety_rejected');
          assert.equal(error.cause, providerError);
          assert.equal(error.message.includes('provider message'), false);

          return true;
        },
      );
    });

    it('fails with unknown when the provider returns no image', async () => {
      const client = fakeClient(async () => ({ data: [{}] }));

      await assert.rejects(
        generateOpenAiImagesIntegration({ client, prompt: 'x', n: 1 }),
        (error) =>
          error instanceof ProviderError && error.category === 'unknown',
      );
    });
  });
});
