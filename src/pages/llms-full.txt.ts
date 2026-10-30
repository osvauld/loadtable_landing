// /llms-full.txt: every docs page as Markdown in one file, in the docs' own order.
import { docs } from '../content/docs';

export function GET() {
  const body = docs
    .map(d => `<!-- https://loadtable.osvauld.com/docs${d.slug ? '/' + d.slug : ''} -->\n${d.raw.trim()}\n`)
    .join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
