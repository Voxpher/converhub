// Client-side tool catalogue. Mirrors the server registry (ids must match).
// Per-category entries (with SEO copy, FAQs and option schemas) live in
// ./tools/*.ts; this file only merges and looks them up.

import type { OptionField } from './options';
import { PDF_TOOLS } from './tools/pdf';
import { IMAGE_TOOLS } from './tools/image';
import { AUDIO_VIDEO_TOOLS } from './tools/audiovideo';
import { UTILITY_TOOLS } from './tools/utility';

export type ToolCategory = 'pdf' | 'image' | 'audio-video' | 'utility';

export interface ToolCategoryMeta {
  id: ToolCategory;
  name: string;
  description: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolMeta {
  id: string;
  name: string;
  category: ToolCategory;
  tagline: string;
  /** Short SEO meta description (~150 chars). */
  metaDescription: string;
  exts: string[];
  requiresFile: boolean;
  /** True when the tool accepts several files (merge tools). */
  multiple: boolean;
  /** 'text' renders the result inline with a copy button; default 'file'. */
  resultKind?: 'text' | 'file';
  phase: number;
  available: boolean;
  /** Option controls rendered above the convert button. */
  options: OptionField[];
  howTo: string[];
  faq: ToolFaq[];
}

export const CATEGORIES: ToolCategoryMeta[] = [
  { id: 'pdf', name: 'PDF Tools', description: 'Merge, split, compress, convert and edit PDF files.' },
  { id: 'image', name: 'Image Tools', description: 'Convert, compress, resize and clean up images.' },
  { id: 'audio-video', name: 'Audio & Video', description: 'Extract audio, convert video formats and trim clips.' },
  { id: 'utility', name: 'Utilities', description: 'QR codes, counters, resizers and caption helpers.' },
];

export const TOOLS: ToolMeta[] = [
  ...PDF_TOOLS,
  ...IMAGE_TOOLS,
  ...AUDIO_VIDEO_TOOLS,
  ...UTILITY_TOOLS,
];

export function getTool(id: string): ToolMeta | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function toolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function categoryName(id: ToolCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}
