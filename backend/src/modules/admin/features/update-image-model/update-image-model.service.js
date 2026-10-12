import { ConflictError, NotFoundError } from '#src/utils/index.js';
import { LAST_ENABLED_MODEL_MESSAGE } from '#src/modules/admin/admin.constants.js';
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

const TOP_LEVEL_FIELDS = [
  'label',
  'enabled',
  'sortOrder',
  'capabilities',
  'creditsPerImage',
];

function buildNextState({ current, input }) {
  return {
    label: input.label ?? current.label,
    enabled: input.enabled ?? current.enabled,
    sortOrder: input.sortOrder ?? current.sortOrder,
    capabilities: mergeCapabilitiesUtil({
      current: current.capabilities,
      changes: input.capabilities,
    }),
    creditsPerImage: { ...current.creditsPerImage, ...input.creditsPerImage },
  };
}

async function assertAnotherModelStaysEnabled({ db, id }) {
  const imageModels = await imageModelRepositories.findAllImageModelsRepository(
    { db },
  );
  const otherEnabled = imageModels.some(
    (imageModel) => imageModel.id !== id && imageModel.enabled,
  );

  if (!otherEnabled) {
    throw new ConflictError(LAST_ENABLED_MODEL_MESSAGE);
  }
}

function diffFields({ current, next }) {
  const changes = {};

  for (const field of TOP_LEVEL_FIELDS) {
    if (JSON.stringify(current[field]) !== JSON.stringify(next[field])) {
      changes[field] = { from: current[field], to: next[field] };
    }
  }

  return changes;
}

export async function updateImageModelService({ db, actorId, id, input }) {
  return db.transaction(async (tx) => {
    const current = await imageModelRepositories.findImageModelByIdRepository({
      db: tx,
      id,
    });

    if (!current) {
      throw new NotFoundError('Image model not found');
    }

    const next = buildNextState({ current, input });

    assertImageModelConsistentUtil(next);

    if (current.enabled && !next.enabled) {
      await assertAnotherModelStaysEnabled({ db: tx, id });
    }

    const changes = diffFields({ current, next });

    if (Object.keys(changes).length === 0) {
      return current;
    }

    const updated = await imageModelRepositories.updateImageModelRepository({
      db: tx,
      id,
      data: next,
    });

    await recordAuditLogService({
      db: tx,
      actorId,
      action: AUDIT_ACTION.IMAGE_MODEL_UPDATED,
      targetType: AUDIT_TARGET_TYPE.IMAGE_MODEL,
      targetId: id,
      changes,
    });

    return updated;
  });
}
