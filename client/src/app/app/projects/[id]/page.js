import { ProjectDetailView } from '@/features/projects/ProjectDetailView';

export const metadata = { title: 'Project' };

export default async function ProjectPage({ params }) {
  const { id } = await params;

  return <ProjectDetailView projectId={id} />;
}
