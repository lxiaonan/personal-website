import { getSearchEntries } from '../utils/search';

export async function GET() {
  return new Response(JSON.stringify(await getSearchEntries()), {
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
