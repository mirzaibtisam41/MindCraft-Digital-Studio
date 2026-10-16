import OpenAI from 'openai';

export function buildOpenAiClientIntegration({ appConfig }) {
  return new OpenAI({
    apiKey: appConfig.OPENAI_API_KEY,
    timeout: 120000,
    maxRetries: 0,
  });
}
