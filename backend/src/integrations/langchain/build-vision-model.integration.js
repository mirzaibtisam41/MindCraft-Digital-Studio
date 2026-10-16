import { ChatOpenAI } from '@langchain/openai';

export function buildVisionModelIntegration({ appConfig, model }) {
  return new ChatOpenAI({
    apiKey: appConfig.OPENAI_API_KEY,
    model,
    temperature: 0.2,
    timeout: 60000,
    maxRetries: 0,
  });
}
