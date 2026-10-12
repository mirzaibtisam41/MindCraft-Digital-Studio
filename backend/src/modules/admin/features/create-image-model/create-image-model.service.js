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

    assertImageModelConsistentUtil({
      capabilities,
      creditsPerImage: input.creditsPerImage,
    });

    const data = {
      id: input.id,
      provider: input.provider,
      label: input.label.trim(),
      enabled: input.enabled ?? true,
      sortOrder: input.sortOrder ?? nextSortOrder(imageModels),
      capabilities,
      creditsPerImage: input.creditsPerImage,
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
        creditsPerImage: data.creditsPerImage,
      },
    });

    return created;
  });
}
