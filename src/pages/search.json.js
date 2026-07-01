import { getCollection } from 'astro:content';
import { postUrl } from '../utils/posts';

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return new Response(
    JSON.stringify(
      posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        tags: post.data.tags,
        url: postUrl(post.id)
      }))
    ),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8'
      }
    }
  );
}
