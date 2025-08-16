import { zodToJsonSchema } from "zod-to-json-schema";

import {
  GoBackTool,
  GoForwardTool,
  NavigateTool,
  PressKeyTool,
  WaitTool,
} from "@/repo/types/mcp/tool";

import { captureAriaSnapshot } from "@/utils/aria-snapshot";

import type { Tool, ToolFactory } from "./tool";

// normalize JSON Schema "type" fields so they are primitive strings when
// possible (zod-to-json-schema sometimes returns arrays like ["object"]).
// This keeps validators that expect a literal string working.
export function normalizeJsonSchemaTypes(obj: any): any {
  // primitives
  if (obj === null || typeof obj !== "object") return obj;
  // arrays
  if (Array.isArray(obj)) return obj.map(normalizeJsonSchemaTypes);
  // objects
  const out: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (key === "type") {
      // If type is an array with a single entry, unwrap to the string.
      if (Array.isArray(val)) {
        out[key] = val.length === 1 ? val[0] : val.map((v: any) => (typeof v === 'string' ? v : normalizeJsonSchemaTypes(v)));
      } else if (typeof val === 'string') {
        out[key] = val;
      } else {
        out[key] = normalizeJsonSchemaTypes(val);
      }
    } else {
      out[key] = normalizeJsonSchemaTypes(val);
    }
  }
  return out;
}

export const navigate: ToolFactory = (snapshot) => ({
  schema: {
    name: NavigateTool.shape.name.value,
    description: NavigateTool.shape.description.value,
    inputSchema: normalizeJsonSchemaTypes(zodToJsonSchema(NavigateTool.shape.arguments)),
  },
  handle: async (context, params) => {
    // Cast parsed result to the expected shape so TS knows `url` exists.
    const parsed = NavigateTool.shape.arguments.parse(params) as { url: string };
    const { url } = parsed;
    await context.sendSocketMessage("browser_navigate", { url });
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: `Navigated to ${url}`,
        },
      ],
    };
  },
});

export const goBack: ToolFactory = (snapshot) => ({
  schema: {
    name: GoBackTool.shape.name.value,
    description: GoBackTool.shape.description.value,
    inputSchema: normalizeJsonSchemaTypes(zodToJsonSchema(GoBackTool.shape.arguments)),
  },
  handle: async (context) => {
    await context.sendSocketMessage("browser_go_back", {});
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: "Navigated back",
        },
      ],
    };
  },
});

export const goForward: ToolFactory = (snapshot) => ({
  schema: {
    name: GoForwardTool.shape.name.value,
    description: GoForwardTool.shape.description.value,
    inputSchema: normalizeJsonSchemaTypes(zodToJsonSchema(GoForwardTool.shape.arguments)),
  },
  handle: async (context) => {
    await context.sendSocketMessage("browser_go_forward", {});
    if (snapshot) {
      return captureAriaSnapshot(context);
    }
    return {
      content: [
        {
          type: "text",
          text: "Navigated forward",
        },
      ],
    };
  },
});

export const wait: Tool = {
  schema: {
    name: WaitTool.shape.name.value,
    description: WaitTool.shape.description.value,
    inputSchema: normalizeJsonSchemaTypes(zodToJsonSchema(WaitTool.shape.arguments)),
  },
  handle: async (context, params) => {
  const { time } = WaitTool.shape.arguments.parse(params) as { time: number };
    await context.sendSocketMessage("browser_wait", { time });
    return {
      content: [
        {
          type: "text",
          text: `Waited for ${time} seconds`,
        },
      ],
    };
  },
};

export const pressKey: Tool = {
  schema: {
    name: PressKeyTool.shape.name.value,
    description: PressKeyTool.shape.description.value,
    inputSchema: normalizeJsonSchemaTypes(zodToJsonSchema(PressKeyTool.shape.arguments)),
  },
  handle: async (context, params) => {
  const { key } = PressKeyTool.shape.arguments.parse(params) as { key: string };
    await context.sendSocketMessage("browser_press_key", { key });
    return {
      content: [
        {
          type: "text",
          text: `Pressed key ${key}`,
        },
      ],
    };
  },
};
