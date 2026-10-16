import { listProjectPreviewImagesRepository } from '#src/modules/projects/shared/repositories/index.js';

function pickPreviewImages({ project, rows }) {
  const projectRows = rows.filter((row) => row.projectId === project.id);
  const cover = projectRows.find((row) => row.id === project.coverImageId);
  const others = projectRows.filter((row) => row.id !== project.coverImageId);

  return [cover, ...others].filter(Boolean).slice(0, 4);
}

export async function presentProjectsService({ db, storage, projects }) {
  if (projects.length === 0) return [];

  const rows = await listProjectPreviewImagesRepository({
    db,
    projectIds: projects.map((project) => project.id),
  });

  return Promise.all(
    projects.map(async (project) => {
      const previewImages = await Promise.all(
        pickPreviewImages({ project, rows }).map(async (row) => ({
          id: row.id,
          thumbnailUrl: await storage.createSignedUrl({
            key: row.thumbnailKey ?? row.storageKey,
          }),
        })),
      );

      return { ...project, previewImages };
    }),
  );
}
