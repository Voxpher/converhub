// Central tool registry. Per-category tool arrays live in ./tools/*.ts so
// phases can be built in parallel; this file only merges and looks them up.

import { OptionField } from './options';
import { PDF_TOOLS } from './tools/pdf';
import { IMAGE_TOOLS } from './tools/image';
import { AUDIO_VIDEO_TOOLS } from './tools/audiovideo';
import { UTILITY_TOOLS } from './tools/utility';

export type ToolCategory = 'pdf' | 'image' | 'audio-video' | 'utility';

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  tagline: string;
  inputMimes: string[];
  inputExts: string[];
  requiresFile: boolean;
  /** Max uploaded files (1 for most tools, more for merge tools). */
  maxFiles: number;
  /** Options the tool accepts — validated by validateOptions(). */
  optionsSchema: OptionField[];
  /** false until the tool's phase ships; API returns 501 while false. */
  enabled: boolean;
  phase: number;
}

export const TOOLS: ToolDefinition[] = [
  ...PDF_TOOLS,
  ...IMAGE_TOOLS,
  ...AUDIO_VIDEO_TOOLS,
  ...UTILITY_TOOLS,
];

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function listTools(): ToolDefinition[] {
  return TOOLS;
}
