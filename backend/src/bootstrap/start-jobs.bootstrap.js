import { refundStuckGenerationsService } from '#src/modules/generations/shared/services/index.js';
import { refundStuckImageAnalysesService } from '#src/modules/image-analyses/shared/services/index.js';

export function startJobs({ fastify }) {
  let isRunning = false;

  async function refundStuckGenerations() {
    if (isRunning) return;

    isRunning = true;

    try {
      const refundedCount =
        (await refundStuckGenerationsService({ db: fastify.db })) +
        (await refundStuckImageAnalysesService({ db: fastify.db }));

      if (refundedCount > 0) {
        fastify.log.warn(
          { refundedCount },
          'Refunded generations and analyses that were stuck in processing',
        );
      }
    } catch (error) {
      fastify.log.error({ err: error }, 'Stuck generation refund job failed');
    } finally {
      isRunning = false;
    }
  }

  refundStuckGenerations();
  setInterval(refundStuckGenerations, 5 * 60 * 1000).unref();
}
