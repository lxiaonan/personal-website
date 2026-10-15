import { glob } from 'astro/loaders';
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
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

export const collections = { blog, projects };
