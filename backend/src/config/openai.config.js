export function buildOpenaiConfig({ appConfig }) {
  return {
    apiKey: appConfig.OPENAI_API_KEY,
    timeout: appConfig.OPENAI_TIMEOUT_MS,
    maxRetries: appConfig.OPENAI_MAX_RETRIES,
  };
}

export function buildOpenaiChatModelConfig({ appConfig }) {
  return {
    ...buildOpenaiConfig({ appConfig }),
    model: appConfig.OPENAI_TEXT_MODEL,
  };
}
