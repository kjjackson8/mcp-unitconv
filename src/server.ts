import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { convert, supportedUnits } from './units.ts';

const server = new Server(
  { name: 'mcp-unitconv', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'convert',
      description: 'Convert a value between units of length, mass, time, temperature, area or volume.',
      inputSchema: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Numeric value to convert' },
          from: { type: 'string', description: `Source unit, one of: ${supportedUnits().join(', ')}` },
          to: { type: 'string', description: 'Target unit, same dimension as source' },
        },
        required: ['value', 'from', 'to'],
      },
    },
  ],
}));

interface ConvertArgs {
  value: number;
  from: string;
  to: string;
}

/** Checks the shape of tool arguments before they reach convert(). Throws with a
 * message that names the offending field, since a raw cast would instead surface
 * a confusing NaN or "undefined is not a string" failure deep inside convert(). */
function parseConvertArgs(args: unknown): ConvertArgs {
  if (typeof args !== 'object' || args === null) {
    throw new Error('arguments must be an object with value, from and to');
  }
  const { value, from, to } = args as Record<string, unknown>;
  if (typeof value !== 'number') {
    throw new Error(`value must be a number, got ${typeof value}`);
  }
  if (typeof from !== 'string' || from.length === 0) {
    throw new Error(`from must be a non-empty string, got ${typeof from}`);
  }
  if (typeof to !== 'string' || to.length === 0) {
    throw new Error(`to must be a non-empty string, got ${typeof to}`);
  }
  return { value, from, to };
}

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== 'convert') throw new Error(`Unknown tool: ${req.params.name}`);
  try {
    const { value, from, to } = parseConvertArgs(req.params.arguments);
    const r = convert(value, from, to);
    return { content: [{ type: 'text', text: `${value} ${from} = ${r.value} ${to}` }] };
  } catch (e) {
    return { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true };
  }
});

await server.connect(new StdioServerTransport());
