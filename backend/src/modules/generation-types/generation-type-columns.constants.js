import { generationTypes } from '#src/modules/generation-types/generation-type.table.js';

export const GENERATION_TYPE_COLUMNS = {
  id: generationTypes.id,
  code: generationTypes.code,
  name: generationTypes.name,
  description: generationTypes.description,
  isActive: generationTypes.isActive,
  createdAt: generationTypes.createdAt,
  updatedAt: generationTypes.updatedAt,
};
