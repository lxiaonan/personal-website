import type { CollectionEntry } from 'astro:content';
import { withBase } from './path';

export function projectSlug(id: string) {
  return id.replace(/\.(md|mdx)$/i, '');
}

export function projectUrl(id: string) {
  return withBase(`/projects/${projectSlug(id)}/`);
}

export function projectCard(project: CollectionEntry<'projects'>) {
  return {
    name: project.data.title,
    status: project.data.status,
    description: project.data.summary,
    stack: project.data.stack,
    href: projectUrl(project.id),
    metrics: project.data.metrics
  };
}
