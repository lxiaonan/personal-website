import { withBase } from './path';

export function postSlug(id: string) {
  return id.replace(/\.(md|mdx)$/i, '');
}

export function postUrl(id: string) {
  return withBase(`/blog/${postSlug(id)}/`);
}
