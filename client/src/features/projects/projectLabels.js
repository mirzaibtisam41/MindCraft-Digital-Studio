import { formatTimeAgo } from '@/lib/timeAgo';

export function describeProjectCounts(project) {
  const images = `${project.imageCount} ${project.imageCount === 1 ? 'image' : 'images'}`;
  const collections = `${project.collectionCount} ${project.collectionCount === 1 ? 'collection' : 'collections'}`;

  return `${images} · ${collections} · updated ${formatTimeAgo(project.updatedAt)}`;
}
