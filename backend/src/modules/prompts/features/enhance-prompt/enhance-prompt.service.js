import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import {
  PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN,
  ProviderError,
  buildProviderFailureErrorUtil,
} from '#src/utils/index.js';
import { PLATFORM_SETTING_KEY } from '#src/modules/platform-settings/platform-setting.constants.js';
import { findPlatformSettingRepository } from '#src/modules/platform-settings/shared/repositories/index.js';
import { PROMPT_TEXT_MAX_LENGTH } from '#src/modules/prompts/prompt.constants.js';

function keepDescriptorsFoundInPrompt({ enhancedPrompt, addedDescriptors }) {
  const lowerPrompt = enhancedPrompt.toLowerCase();

  return [
    ...new Set(
      addedDescriptors
        .map((descriptor) => descriptor.trim())
        .filter(
          (descriptor) =>
            descriptor && lowerPrompt.includes(descriptor.toLowerCase()),
        ),
    ),
  ];
}

export async function enhancePromptService({ server, log, data }) {
  const model =
    (await findPlatformSettingRepository({
      db: server.db,
      key: PLATFORM_SETTING_KEY.PROMPT_MODEL,
    })) ?? 'gpt-4.1-mini';

  let result;

  try {
    result = await server.promptEnhancer.enhancePrompt({
      model,
      prompt: data.prompt.trim(),
      style: data.style ?? null,
      temperature: data.anotherAngle ? 0.9 : 0.4,
    });
  } catch (error) {
    const category =
      error instanceof ProviderError
        ? error.category
        : PROVIDER_ERROR_CATEGORY.UNKNOWN;
    const logDetails = { err: error, category };

    if (PROVIDER_CATEGORIES_THAT_NEED_AN_ADMIN.includes(category)) {
      log.error(logDetails, 'Prompt enhancement failed');
    } else {
      log.warn(logDetails, 'Prompt enhancement failed');
    }

    throw buildProviderFailureErrorUtil({ category, refundedCredits: 0 });
  }

  const enhancedPrompt = result.enhancedPrompt
    .trim()
    .slice(0, PROMPT_TEXT_MAX_LENGTH);

  return {
    originalPrompt: data.prompt.trim(),
    enhancedPrompt,
    addedDescriptors: keepDescriptorsFoundInPrompt({
      enhancedPrompt,
      addedDescriptors: result.addedDescriptors,
    }),
    model,
  };
}
