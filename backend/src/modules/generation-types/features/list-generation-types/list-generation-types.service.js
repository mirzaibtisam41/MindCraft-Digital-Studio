import { listGenerationTypesRepository } from '#src/modules/generation-types/shared/repositories/index.js';

export function listGenerationTypesService({ db }) {
  return listGenerationTypesRepository({ db });
}
