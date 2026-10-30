import { getCollection } from 'astro:content';
import { skillCategories } from '../data/skills';
import { postUrl } from './posts';
import { projectUrl } from './projects';
import { withBase } from './path';

export const searchCategories = {
  article: '技术文章',
  pitfall: '踩过的小坑',
  'ai-development': 'AI 开发总结',
  projects: '项目案例',
  'ai-skills': 'AI Skills'
};

// Keep the page and JSON endpoint consistent, including draft exclusion.
export async function getSearchEntries() {
  const [posts, projects, skills] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('projects'),
    getCollection('skills')
  ]);
  return [
    ...posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()).map((post) => ({
      title: post.data.title, description: post.data.description,
      tags: post.data.tags, category: post.data.category, url: postUrl(post.id)
    })),
    ...projects.sort((a, b) => a.data.order - b.data.order).map((project) => ({
      title: project.data.title, description: project.data.summary,
      tags: project.data.stack, category: 'projects' as const, url: projectUrl(project.id)
    })),
    ...skills.sort((a, b) => a.data.order - b.data.order).map((skill) => ({
      title: skill.data.title, description: skill.data.description,
      tags: ['AI Skills', skillCategories[skill.data.category], skill.data.name],
      category: 'ai-skills' as const, url: withBase(`/ai-skills/${skill.id}/`)
    }))
  ];
}
