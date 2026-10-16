import { imageAnalyses } from '#src/modules/image-analyses/image-analysis.table.js';
import { IMAGE_ANALYSIS_COLUMNS } from '#src/modules/image-analyses/image-analysis-columns.constants.js';

export async function createImageAnalysisRepository({ db, data }) {
  const [analysis] = await db
    .insert(imageAnalyses)
    .values(data)
    .returning(IMAGE_ANALYSIS_COLUMNS);

  return analysis;
}
