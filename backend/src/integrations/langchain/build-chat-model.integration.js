import { ChatOpenAI } from '@langchain/openai';

export function buildChatModelIntegration({
  appConfig,
  model,
  temperature = 0.2,
}) {
  return new ChatOpenAI({
    apiKey: appConfig.OPENAI_API_KEY,
    model,
    temperature,
    timeout: 60000,
    maxRetries: 0,
  });
}
