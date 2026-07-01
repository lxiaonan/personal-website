import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { postUrl } from '../utils/posts';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'Java Backend Developer',
    description: 'Java 后端、系统设计、工程实践和项目笔记。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post.id)
    }))
  });
}
