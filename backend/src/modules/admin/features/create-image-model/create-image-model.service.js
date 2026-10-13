import { ConflictError } from '#src/utils/index.js';
import {
  MODEL_ALREADY_EXISTS_MESSAGE,
  NEW_IMAGE_MODEL_BASELINE,
} from '#src/modules/admin/new-image-model-baseline.constants.js';
import {
  assertImageModelConsistentUtil,
  mergeCapabilitiesUtil,
} from '#src/modules/admin/shared/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { IMAGE_MODEL_DEFAULT_TOOLS } from '#src/modules/image-models/image-model.constants.js';
import * as imageModelRepositories from '#src/modules/image-models/shared/repositories/index.js';

function nextSortOrder(imageModels) {
  return (
    imageModels.reduce(
      (highest, imageModel) => Math.max(highest, imageModel.sortOrder),
      -1,
    ) + 1
  );
}

export async function createImageModelService({ db, actorId, input }) {
  return db.transaction(async (tx) => {
    const imageModels =
      await imageModelRepositories.findAllImageModelsRepository({ db: tx });

    if (imageModels.some((imageModel) => imageModel.id === input.id)) {
      throw new ConflictError(MODEL_ALREADY_EXISTS_MESSAGE);
    }

    const capabilities = mergeCapabilitiesUtil({
      current: NEW_IMAGE_MODEL_BASELINE,
      changes: input.capabilities,
    });
    const enabled = input.enabled ?? true;
    const tools = input.tools ?? IMAGE_MODEL_DEFAULT_TOOLS;

    assertImageModelConsistentUtil({
      capabilities,
      creditsPerImage: input.creditsPerImage,
      tools,
    });

    const data = {
      id: input.id,
      provider: input.provider,
      label: input.label.trim(),
      description: input.description?.trim() ?? '',
      badge: input.badge ?? null,
      enabled,
      isDefault:
        enabled && !imageModels.some((imageModel) => imageModel.isDefault),
      sortOrder: input.sortOrder ?? nextSortOrder(imageModels),
      tools,
      capabilities,
      creditsPerImage: input.creditsPerImage,
      providerCostPerImage: input.providerCostPerImage ?? {},
    };

    const created = await imageModelRepositories.insertImageModelRepository({
      db: tx,
      data,
    });

    await recordAuditLogService({
      db: tx,
      actorId,
      action: AUDIT_ACTION.IMAGE_MODEL_CREATED,
      targetType: AUDIT_TARGET_TYPE.IMAGE_MODEL,
      targetId: created.id,
      changes: {
        label: data.label,
        provider: data.provider,
        enabled: data.enabled,
        isDefault: data.isDefault,
        creditsPerImage: data.creditsPerImage,
      },
    });

    return created;
  });
}
