// Utility processors (Phase 5).
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import type { ProcessorContext, ProcessorFn } from './types';
import { outputName, completeJob } from './helpers';
import { optNum, optStr } from '../options';

// qrcode ships no bundled TypeScript types; declared locally so the
// rest of the file stays fully typed under strict mode.
declare const require: (id: string) => unknown;
const QRCode = require('qrcode') as {
  toFile(
    outPath: string,
    text: string,
    options?: { width?: number; margin?: number },
  ): Promise<void>;
};

/** qr-generator: encode text/link into a PNG QR code. No file input. */
async function qrGenerator(ctx: ProcessorContext) {
  const text = optStr(ctx.options, 'text', '').trim();
  if (!text) {
    throw new Error('Please enter some text or a link first.');
  }
  const size = Math.max(
    64,
    Math.min(2048, parseInt(optStr(ctx.options, 'size', '512'), 10) || 512),
  );

  await ctx.onProgress(30);
  const storedName = 'qrcode.png';
  const outPath = path.join(ctx.outputDir, storedName);
  await QRCode.toFile(outPath, text, { width: size, margin: 2 });
  await ctx.onProgress(90);
  return completeJob(ctx, storedName, 'qrcode.png', 'image/png');
}

/** word-counter: compute text statistics and write a .txt report. */
async function wordCounter(ctx: ProcessorContext) {
  const text = optStr(ctx.options, 'text', '');
  if (!text.trim()) {
    throw new Error('Please paste some text first.');
  }

  const words = (text.match(/\S+/g) ?? []).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = (text.match(/[^.!?]+[.!?]+/g) ?? []).length;
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;
  const readMinutes = Math.max(1, Math.round(words / 200));

  const lines = [
    'Word Count Report — ConvertHub',
    '================================',
    `Words: ${words}`,
    `Characters (with spaces): ${chars}`,
    `Characters (no spaces): ${charsNoSpaces}`,
    `Sentences: ${sentences}`,
    `Paragraphs: ${paragraphs}`,
    `Estimated reading time: ${readMinutes} min (at 200 wpm)`,
  ];

  await ctx.onProgress(50);
  const storedName = outputName(ctx, '-wordcount', 'txt');
  fs.writeFileSync(path.join(ctx.outputDir, storedName), lines.join('\n') + '\n', 'utf8');
  await ctx.onProgress(90);
  return completeJob(ctx, storedName, storedName, 'text/plain');
}

/** Curated platform tag banks — hand-picked sets, never AI-claimed. */
const PLATFORM_BANKS: Record<string, string[]> = {
  instagram: [
    'instagood', 'photooftheday', 'love', 'instadaily', 'follow', 'likeforlikes',
    'picoftheday', 'beautiful', 'happy', 'fashion', 'art', 'photography',
    'reels', 'explorepage', 'instalike', 'followme', 'style', 'photo',
    'smile', 'fun',
  ],
  youtube: [
    'youtuber', 'subscribe', 'newvideo', 'youtubechannel', 'vlog',
    'videooftheday', 'contentcreator', 'watchnow', 'smallyoutuber',
    'youtubelife', 'trending', 'mustwatch', 'likeandsubscribe',
    'videography', 'creator',
  ],
  tiktok: [
    'fyp', 'foryou', 'viral', 'tiktok', 'trending', 'foryoupage', 'duet',
    'tiktokmademebuyit', 'comedy', 'dance', 'relatable', 'funny',
    'explore', 'tiktokers', 'viralvideo',
  ],
  x: [
    'trending', 'breakingnews', 'update', 'discussion', 'opinion',
    'thread', 'viral', 'community', 'now', 'hot',
  ],
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
};

/** hashtag-generator: topic tags first, then curated platform tags. */
async function hashtagGenerator(ctx: ProcessorContext) {
  const topic = optStr(ctx.options, 'topic', '').trim();
  if (!topic) {
    throw new Error('Please enter a topic first.');
  }
  const platform = optStr(ctx.options, 'platform', 'instagram');
  const bank = PLATFORM_BANKS[platform] ?? PLATFORM_BANKS.instagram;
  const count = Math.max(5, Math.min(30, optNum(ctx.options, 'count', 15)));

  // Topic-derived tags: clean alphanumeric words, the joined phrase,
  // and platform combos (e.g. homemadepizza + homemadepizzainstagram).
  const words = topic
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
  const topicTags: string[] = [];
  for (const w of words) topicTags.push(w);
  const joined = words.join('');
  if (words.length > 1 && joined.length >= 3) topicTags.push(joined);
  if (words.length > 0) {
    topicTags.push(`${joined}${platform}`);
    for (const w of words.slice(0, 3)) topicTags.push(`${w}${platform}`);
  }

  const seen = new Set<string>();
  const picked: string[] = [];
  for (const tag of [...topicTags, ...bank]) {
    if (!seen.has(tag)) {
      seen.add(tag);
      picked.push(`#${tag}`);
    }
    if (picked.length >= count) break;
  }

  const platformLabel = PLATFORM_LABELS[platform] ?? 'Instagram';
  const report = [
    `Hashtags for "${topic}" — ${platformLabel}`,
    'Curated hashtag sets by ConvertHub',
    '=====================================',
    ...picked,
    '',
    'Copy-paste line:',
    picked.join(' '),
    '',
    'Tip: mix broad tags with the topic-specific ones above for the best reach.',
  ];

  await ctx.onProgress(50);
  const storedName = outputName(ctx, '-hashtags', 'txt');
  fs.writeFileSync(path.join(ctx.outputDir, storedName), report.join('\n') + '\n', 'utf8');
  await ctx.onProgress(90);
  return completeJob(ctx, storedName, storedName, 'text/plain');
}

/** social-resizer: cover-crop to exact platform dimensions, JPEG output. */
const SOCIAL_PRESETS: Record<string, { w: number; h: number }> = {
  'instagram-post': { w: 1080, h: 1080 },
  'instagram-story': { w: 1080, h: 1920 },
  'youtube-thumbnail': { w: 1280, h: 720 },
  'facebook-post': { w: 1200, h: 630 },
  'x-post': { w: 1200, h: 675 },
};

async function socialResizer(ctx: ProcessorContext) {
  const input = ctx.files[0];
  if (!input) {
    throw new Error('Please upload an image first.');
  }
  const preset = optStr(ctx.options, 'preset', 'instagram-post');
  const dims = SOCIAL_PRESETS[preset] ?? SOCIAL_PRESETS['instagram-post'];

  await ctx.onProgress(30);
  const storedName = outputName(ctx, '-resized', 'jpg');
  const outPath = path.join(ctx.outputDir, storedName);
  await sharp(input.path)
    .resize(dims.w, dims.h, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(outPath);
  await ctx.onProgress(90);
  return completeJob(ctx, storedName, storedName, 'image/jpeg');
}

export const UTILITY_PROCESSORS: Record<string, ProcessorFn> = {
  'qr-generator': qrGenerator,
  'word-counter': wordCounter,
  'hashtag-generator': hashtagGenerator,
  'social-resizer': socialResizer,
};
