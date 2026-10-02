// Audio/video tool definitions (Phase 4).
import type { ToolDefinition } from '../toolRegistry';

const MP4 = 'video/mp4';
const MOV = 'video/quicktime';
const AVI = 'video/x-msvideo';
const WEBM_VIDEO = 'video/webm';
const MKV = 'video/x-matroska';

const MP3 = 'audio/mpeg';
const WAV = 'audio/wav';
const OGG = 'audio/ogg';
const M4A = 'audio/x-m4a';

const VIDEO_MIMES = [MP4, MOV, AVI, WEBM_VIDEO, MKV];
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
const AUDIO_MIMES = [MP3, WAV, OGG, M4A];
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'm4a'];

export const AUDIO_VIDEO_TOOLS: ToolDefinition[] = [
  {
    id: 'video-to-mp3',
    name: 'Video to MP3',
    category: 'audio-video',
    tagline: 'Extract the audio track from any video as an MP3 file.',
    inputMimes: VIDEO_MIMES,
    inputExts: VIDEO_EXTS,
    requiresFile: true,
    maxFiles: 1,
    optionsSchema: [
      {
        name: 'bitrate',
        label: 'Audio quality',
        type: 'select',
        default: '192k',
        options: [
          { value: '128k', label: '128 kbps — small file, good for speech' },
          { value: '192k', label: '192 kbps — balanced quality and size' },
          { value: '320k', label: '320 kbps — best quality, larger file' },
        ],
        help: 'Higher bitrates sound better but produce larger MP3 files.',
      },
    ],
    enabled: true,
    phase: 4,
  },
  {
    id: 'mp4-to-gif',
    name: 'MP4 to GIF',
    category: 'audio-video',
    tagline: 'Turn a short video clip into an animated GIF.',
    inputMimes: [MP4, MOV, WEBM_VIDEO],
    inputExts: ['mp4', 'mov', 'webm'],
    requiresFile: true,
    maxFiles: 1,
    optionsSchema: [
      {
        name: 'fps',
        label: 'Frames per second',
        type: 'number',
        default: 10,
        min: 5,
        max: 20,
        step: 1,
        help: 'More frames look smoother but make the GIF much larger.',
      },
      {
        name: 'width',
        label: 'Width (pixels)',
        type: 'number',
        default: 480,
        min: 160,
        max: 800,
        step: 10,
        help: 'Height is scaled automatically to keep the aspect ratio.',
      },
      {
        name: 'duration',
        label: 'Clip length (seconds)',
        type: 'number',
        default: 6,
        min: 1,
        max: 15,
        step: 1,
        help: 'Only the first N seconds are converted.',
      },
    ],
    enabled: true,
    phase: 4,
  },
  {
    id: 'video-convert',
    name: 'Video Converter',
    category: 'audio-video',
    tagline: 'Convert video between MP4, WebM and MOV formats.',
    inputMimes: VIDEO_MIMES,
    inputExts: VIDEO_EXTS,
    requiresFile: true,
    maxFiles: 1,
    optionsSchema: [
      {
        name: 'format',
        label: 'Output format',
        type: 'select',
        default: 'mp4',
        options: [
          { value: 'mp4', label: 'MP4 — plays everywhere' },
          { value: 'webm', label: 'WebM — best for the web' },
          { value: 'mov', label: 'MOV — Apple devices and editing' },
        ],
        help: 'MP4 works on almost every device; WebM gives smaller web-ready files.',
      },
    ],
    enabled: true,
    phase: 4,
  },
  {
    id: 'compress-video',
    name: 'Compress Video',
    category: 'audio-video',
    tagline: 'Shrink video file size while keeping watchable quality.',
    inputMimes: VIDEO_MIMES,
    inputExts: VIDEO_EXTS,
    requiresFile: true,
    maxFiles: 1,
    optionsSchema: [
      {
        name: 'crf',
        label: 'Quality (CRF)',
        type: 'number',
        default: 26,
        min: 18,
        max: 35,
        step: 1,
        help: 'Lower = better quality, larger file. 23–28 is the sweet spot.',
      },
      {
        name: 'preset',
        label: 'Speed preset',
        type: 'select',
        default: 'veryfast',
        options: [
          { value: 'veryfast', label: 'Very fast — quicker, slightly larger file' },
          { value: 'medium', label: 'Medium — balanced speed and compression' },
          { value: 'slow', label: 'Slow — best compression, takes longer' },
        ],
        help: 'Slower presets squeeze the file smaller but take longer to process.',
      },
    ],
    enabled: true,
    phase: 4,
  },
  {
    id: 'trim-audio',
    name: 'Trim Audio',
    category: 'audio-video',
    tagline: 'Cut a section out of an MP3, WAV, OGG or M4A file.',
    inputMimes: AUDIO_MIMES,
    inputExts: AUDIO_EXTS,
    requiresFile: true,
    maxFiles: 1,
    optionsSchema: [
      {
        name: 'start',
        label: 'Start time',
        type: 'text',
        default: '0:00',
        maxLength: 12,
        help: 'Start time as mm:ss (e.g. 1:30) or seconds.',
      },
      {
        name: 'end',
        label: 'End time',
        type: 'text',
        placeholder: '0:30',
        maxLength: 12,
        help: 'End time as mm:ss — empty keeps the rest of the audio.',
      },
    ],
    enabled: true,
    phase: 4,
  },
  {
    id: 'merge-audio',
    name: 'Merge Audio',
    category: 'audio-video',
    tagline: 'Join multiple audio files into one MP3, in upload order.',
    inputMimes: AUDIO_MIMES,
    inputExts: AUDIO_EXTS,
    requiresFile: true,
    maxFiles: 20,
    optionsSchema: [],
    enabled: true,
    phase: 4,
  },
];
