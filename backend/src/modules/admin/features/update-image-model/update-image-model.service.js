import { ConflictError, NotFoundError } from '#src/utils/index.js';
import {
  DEFAULT_MODEL_MUST_BE_ENABLED_MESSAGE,
  DISABLE_DEFAULT_MODEL_MESSAGE,
  LAST_ENABLED_MODEL_MESSAGE,
  UNSET_DEFAULT_MODEL_MESSAGE,
} from '#src/modules/admin/admin.constants.js';
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
  'description',
  'badge',
  'enabled',
  'isDefault',
  'sortOrder',
  'tools',
  'capabilities',
  'creditsPerImage',
  'providerCostPerImage',
];

function buildNextState({ current, input }) {
  return {
    label: input.label?.trim() ?? current.label,
    description: input.description?.trim() ?? current.description,
    badge: input.badge === undefined ? current.badge : input.badge,
    enabled: input.enabled ?? current.enabled,
    isDefault: input.isDefault ?? current.isDefault,
    sortOrder: input.sortOrder ?? current.sortOrder,
    tools: input.tools ?? current.tools,
    capabilities: mergeCapabilitiesUtil({
      current: current.capabilities,
      changes: input.capabilities,
    }),
    creditsPerImage: { ...current.creditsPerImage, ...input.creditsPerImage },
    providerCostPerImage: {
      ...current.providerCostPerImage,
      ...input.providerCostPerImage,
    },
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

function assertDefaultRules({ current, next }) {
  if (current.isDefault && !next.isDefault) {
    throw new ConflictError(UNSET_DEFAULT_MODEL_MESSAGE);
  }

  if (current.isDefault && !next.enabled) {
    throw new ConflictError(DISABLE_DEFAULT_MODEL_MESSAGE);
  }

  if (next.isDefault && !next.enabled) {
    throw new ConflictError(DEFAULT_MODEL_MUST_BE_ENABLED_MESSAGE);
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
    assertDefaultRules({ current, next });

    if (current.enabled && !next.enabled) {
      await assertAnotherModelStaysEnabled({ db: tx, id });
    }

    const changes = diffFields({ current, next });

    if (Object.keys(changes).length === 0) {
      return current;
    }

    if (next.isDefault && !current.isDefault) {
      await imageModelRepositories.clearDefaultImageModelRepository({
        db: tx,
        exceptId: id,
      });
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
