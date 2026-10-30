// /llms.txt (llmstxt.org): what LoadTable is and where each docs page is, for agents and LLM tools.
// Built from the docs pages, so it lists exactly what the site serves.
import { docs } from '../content/docs';

const site = 'https://loadtable.osvauld.com';

export function GET() {
  const pages = docs.map(d => `- [${d.title}](${site}/docs${d.slug ? '/' + d.slug : ''}): ${d.description}`).join('\n');
  const body = `# LoadTable

> One build queue for coding agents across your own machines. Agents submit heavy commands (cargo, gradle, xcodebuild) with \`loadtable run\` or the MCP tools; each machine admits them by memory, CPU and disk pressure, \`--anywhere\` places them on whichever paired machine can start soonest, and every job is recorded.

Rules for an agent using LoadTable:

- Run every build and test through it: \`loadtable run --who YOUR_AGENT --anywhere -- <command>\`. \`--peer NAME\` picks a machine, \`--pin\` keeps the job here.
- Check \`loadtable list --active\` before starting. If a call times out, query the printed job id with \`loadtable get ID\` or \`loadtable wait ID\`; never submit the same command again.
- Name test targets: \`cargo test -p X --lib FILTER\` or \`--test NAME\`. A refusal says what to run instead.
- Install with \`curl -fsSL ${site}/install.sh | sh\` (Linux x86-64/arm64, macOS).

## Docs

${pages}

## Optional

- [All docs in one file](${site}/llms-full.txt): every page above as Markdown
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
