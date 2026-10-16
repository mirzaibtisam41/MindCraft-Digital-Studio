import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { mapOpenAiErrorIntegration } from '#src/integrations/openai/map-openai-error.integration.js';

export function mapLangChainErrorIntegration({ error }) {
  if (error?.name === 'TimeoutError') return PROVIDER_ERROR_CATEGORY.TIMEOUT;

  return mapOpenAiErrorIntegration({ error });
}
