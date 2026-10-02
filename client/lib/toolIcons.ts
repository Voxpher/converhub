import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Combine,
  Crop,
  Eraser,
  FileArchive,
  FileBarChart,
  FileDigit,
  FileImage,
  FileSpreadsheet,
  FileStack,
  FileText,
  FileType2,
  FileUp,
  Film,
  Hash,
  Image as ImageIcon,
  ImageDown,
  ListOrdered,
  Lock,
  LockOpen,
  Maximize2,
  Minimize2,
  Music,
  Music4,
  Presentation,
  QrCode,
  RefreshCcw,
  RotateCw,
  ScanText,
  Scissors,
  Shrink,
  Sparkles,
  Stamp,
  Table2,
  Type,
} from 'lucide-react';
import type { ToolCategory } from './tools';

/** One icon per tool, used in cards, menus and tool pages. */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  // PDF
  'pdf-to-image': FileImage,
  'pdf-to-word': FileType2,
  'word-to-pdf': FileUp,
  'pdf-to-excel': FileSpreadsheet,
  'excel-to-pdf': Table2,
  'pdf-to-powerpoint': Presentation,
  'powerpoint-to-pdf': FileStack,
  'merge-pdf': Combine,
  'split-pdf': Scissors,
  'compress-pdf': Minimize2,
  'rotate-pdf': RotateCw,
  'protect-pdf': Lock,
  'unlock-pdf': LockOpen,
  'watermark-pdf': Stamp,
  'page-numbers-pdf': ListOrdered,
  'ocr-pdf': ScanText,
  'pdf-to-text': FileText,
  'reorder-pdf': ArrowLeftRight,
  // Image
  'image-convert': RefreshCcw,
  'image-compress': Shrink,
  'image-resize': Maximize2,
  'image-crop': Crop,
  'remove-metadata': Eraser,
  'image-to-base64': FileDigit,
  'image-to-pdf': FileArchive,
  // Audio & video
  'video-to-mp3': Music,
  'mp4-to-gif': Film,
  'video-convert': FileBarChart,
  'compress-video': Minimize2,
  'trim-audio': Scissors,
  'merge-audio': Music4,
  // Utility
  'qr-generator': QrCode,
  'word-counter': Type,
  'hashtag-generator': Hash,
  'social-resizer': ImageDown,
};

/** Category icons for menus, tabs and section headers. */
export const CATEGORY_ICONS: Record<ToolCategory, LucideIcon> = {
  pdf: FileText,
  image: ImageIcon,
  'audio-video': Film,
  utility: Sparkles,
};

/** Fallback icon for any tool id missing from the map. */
export const DEFAULT_TOOL_ICON: LucideIcon = FileText;

export function toolIcon(id: string): LucideIcon {
  return TOOL_ICONS[id] ?? DEFAULT_TOOL_ICON;
}

// Re-exported so components can import the type from one place.
export type { LucideIcon };
