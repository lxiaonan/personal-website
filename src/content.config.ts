import { glob } from 'astro/loaders';
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(['case-study', 'design-note']).default('design-note'),
    star: z.object({
      situation: z.string().min(1),
      task: z.string().min(1),
      action: z.string().min(1),
      result: z.string().min(1)
    }).optional(),
    takeaways: z.array(z.string().min(1)).max(3).default([]),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    category: z.enum(['article', 'pitfall', 'ai-development']).default('article'),
    project: reference('projects').optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    status: z.string(),
    summary: z.string(),
    period: z.string(),
    role: z.string(),
    stack: z.array(z.string()).default([]),
    metrics: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    order: z.number().default(99)
  })
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skills' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(['discovery', 'planning', 'engineering', 'video']),
    repo: z.string(),
    sourcePath: z.string(),
    install: z.string(),
    benefit: z.string(),
    output: z.string(),
    order: z.number(),
    related: z.array(z.string()).default([])
  })
});

export const collections = { blog, projects, skills };
