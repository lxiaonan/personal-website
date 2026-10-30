import { withBase } from './path';

export function postSlug(id: string) {
  return id.replace(/\.(md|mdx)$/i, '');
}

export function postUrl(id: string) {
  return withBase(`/blog/${postSlug(id)}/`);
}

export function readingMinutes(body = '') {
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const characters = text.match(/[\p{Script=Han}]/gu)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*/g)?.length ?? 0;
  return Math.max(1, Math.ceil((characters + words) / 300));
}

export function articleKind(kind: 'case-study' | 'design-note') {
  return kind === 'case-study' ? '项目复盘' : '方案推演';
}
