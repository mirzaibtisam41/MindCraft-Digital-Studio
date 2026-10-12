import { GATED_GENERATION_PARAM_NAMES } from '#src/modules/generations/generation-params.constants.js';

export const gatedGenerationParamsSchemaProperties = Object.fromEntries(
  GATED_GENERATION_PARAM_NAMES.map((name) => [name, {}]),
);
