// Merges every phase's processor map into one dispatch table.
import type { ProcessorFn } from './types';
import { PDF_PROCESSORS } from './pdf';
import { IMAGE_PROCESSORS } from './image';
import { MEDIA_PROCESSORS } from './media';
import { UTILITY_PROCESSORS } from './utility';

const PROCESSORS: Record<string, ProcessorFn> = {
  ...PDF_PROCESSORS,
  ...IMAGE_PROCESSORS,
  ...MEDIA_PROCESSORS,
  ...UTILITY_PROCESSORS,
};

export function getProcessor(toolId: string): ProcessorFn | undefined {
  return PROCESSORS[toolId];
}
