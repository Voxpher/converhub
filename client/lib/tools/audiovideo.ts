// Audio/video tool metadata (Phase 4).
import type { ToolMeta } from '../tools';

const AUDIO_QUALITY_OPTIONS = [
  { value: '128k', label: '128 kbps — small file, good for speech' },
  { value: '192k', label: '192 kbps — balanced quality and size' },
  { value: '320k', label: '320 kbps — best quality, larger file' },
];

export const AUDIO_VIDEO_TOOLS: ToolMeta[] = [
  {
    id: 'video-to-mp3',
    name: 'Video to MP3',
    category: 'audio-video',
    tagline: 'Extract the audio track from any video as an MP3 file.',
    metaDescription:
      'Extract audio from MP4, MOV, AVI, WebM or MKV video and save it as an MP3. Free, fast and private.',
    exts: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    requiresFile: true,
    multiple: false,
    phase: 4,
    available: true,
    options: [
      {
        name: 'bitrate',
        label: 'Audio quality',
        type: 'select',
        default: '192k',
        options: AUDIO_QUALITY_OPTIONS,
        help: 'Higher bitrates sound better but produce larger MP3 files.',
      },
    ],
    howTo: [
      'Upload your video file (MP4, MOV, AVI, WebM or MKV).',
      'Pick an audio quality — 192 kbps is a good all-round choice.',
      'Click Convert and wait for the audio extraction to finish.',
      'Download your MP3 and use the "Convert another file" button for the next one.',
    ],
    faq: [
      {
        q: 'Which bitrate should I choose?',
        a: 'Use 128 kbps for speech like lectures or podcasts where file size matters, 192 kbps for music in everyday listening, and 320 kbps when you want the closest match to the original audio and do not mind a bigger file.',
      },
      {
        q: 'Does the video quality affect the MP3?',
        a: 'No. Only the audio track inside the video is used, so a low-resolution video can still produce a great-sounding MP3 as long as its original audio was good.',
      },
      {
        q: 'How long does extraction take?',
        a: 'Usually well under a minute. Extracting audio skips video re-encoding entirely, so it is one of the fastest conversions on the site — a two-hour video typically finishes in seconds.',
      },
      {
        q: 'Is my video kept private?',
        a: 'Yes. Your file is processed on our server only for the conversion and is automatically deleted after 60 minutes. Nothing is shared or used for any other purpose.',
      },
      {
        q: 'Why did my conversion fail?',
        a: 'The most common cause is a corrupt or partially downloaded video file. Try playing it in your media player first — if it does not play there, re-download or re-export it and try again.',
      },
    ],
  },
  {
    id: 'mp4-to-gif',
    name: 'MP4 to GIF',
    category: 'audio-video',
    tagline: 'Turn a short video clip into an animated GIF.',
    metaDescription:
      'Convert MP4, MOV or WebM clips into animated GIFs. Control frame rate, width and clip length. Free online.',
    exts: ['.mp4', '.mov', '.webm'],
    requiresFile: true,
    multiple: false,
    phase: 4,
    available: true,
    options: [
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
    howTo: [
      'Upload a short video clip (MP4, MOV or WebM).',
      'Set the frame rate, width and how many seconds to convert.',
      'Click Convert — the first seconds of your clip become a GIF.',
      'Download the GIF. Trim your video first if the moment you want is not at the start.',
      'Lower the frame rate or width if the GIF file is bigger than you need.',
    ],
    faq: [
      {
        q: 'Why is my GIF file so large?',
        a: 'GIFs store every frame as an image, so size grows fast. Drop the frame rate to 8–10 fps, reduce the width to 320–480 px, or shorten the clip length — each of these can cut the file size dramatically.',
      },
      {
        q: 'Can I convert a moment in the middle of a video?',
        a: 'This tool converts from the start of the video, up to the clip length you set. To capture a moment later in the video, trim or cut the video to start at that moment first, then convert it here.',
      },
      {
        q: 'Why does the GIF have no sound?',
        a: 'The GIF format does not support audio at all, so sound is always removed. If you need sound, convert to a short MP4 or WebM video instead.',
      },
      {
        q: 'What frame rate looks best?',
        a: '10 fps is the sweet spot for most clips shared on chat and social media. Go up to 15–20 fps for fast action, or down to 5–8 fps for simple animations and the smallest files.',
      },
      {
        q: 'Is there a length limit?',
        a: 'Yes — up to 15 seconds per conversion. GIFs are meant for short loops; longer clips are better kept as video files, which stay far smaller.',
      },
    ],
  },
  {
    id: 'video-convert',
    name: 'Video Converter',
    category: 'audio-video',
    tagline: 'Convert video between MP4, WebM and MOV formats.',
    metaDescription:
      'Convert video files between MP4, WebM and MOV formats online. Free, no watermarks, files auto-deleted.',
    exts: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    requiresFile: true,
    multiple: false,
    phase: 4,
    available: true,
    options: [
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
    howTo: [
      'Upload your video file.',
      'Choose the output format: MP4, WebM or MOV.',
      'Click Convert and wait for the progress bar to reach 100%.',
      'Download the converted video file.',
    ],
    faq: [
      {
        q: 'Which format should I pick?',
        a: 'Choose MP4 for maximum compatibility — it plays on phones, TVs, browsers and social apps. Choose WebM for websites, where it gives smaller files at the same quality. Choose MOV if you are editing on a Mac or need Apple workflows.',
      },
      {
        q: 'Will converting reduce the video quality?',
        a: 'Converting always re-encodes the video, so there can be a tiny quality loss, but at these settings it is invisible in normal viewing. Avoid converting the same file back and forth many times.',
      },
      {
        q: 'How long does conversion take?',
        a: 'It depends on the length and resolution — a short clip takes under a minute, while long HD videos take several minutes. The progress bar keeps you updated, and jobs time out only after 10 minutes.',
      },
      {
        q: 'Does it keep the audio?',
        a: 'Yes. The audio track is converted along with the video using a matching audio codec (AAC for MP4/MOV, Opus for WebM), so sound stays in sync.',
      },
      {
        q: 'My converted video will not play — what went wrong?',
        a: 'First check the download completed fully. Then try the MP4 format, which has the widest support. If the original file was corrupt, the conversion cannot fix it — verify the source video plays first.',
      },
    ],
  },
  {
    id: 'compress-video',
    name: 'Compress Video',
    category: 'audio-video',
    tagline: 'Shrink video file size while keeping watchable quality.',
    metaDescription:
      'Reduce video file size with adjustable quality and speed presets. Free online video compressor, no watermark.',
    exts: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    requiresFile: true,
    multiple: false,
    phase: 4,
    available: true,
    options: [
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
    howTo: [
      'Upload the video you want to shrink.',
      'Pick a quality level — start with the default 26.',
      'Choose a speed preset (faster is fine for most uses).',
      'Click Convert, then compare the result and download it.',
      'If the quality is not good enough, convert again with a lower CRF number.',
    ],
    faq: [
      {
        q: 'What CRF value should I use?',
        a: 'CRF 26 (the default) roughly halves most phone videos with quality that still looks great. Use 23 or lower for important footage you want near-original quality, and 28–32 when you only need a small file for messaging apps.',
      },
      {
        q: 'How much smaller will my video get?',
        a: 'It varies with the content — phone footage often shrinks 40–70% at the default setting. Videos that are already heavily compressed will shrink less, since there is less waste to remove.',
      },
      {
        q: 'What does the speed preset change?',
        a: 'Slower presets spend more time analysing the video, which produces a smaller file at the same quality. "Very fast" is best when you are in a hurry; "slow" is worth it for videos you will keep or publish.',
      },
      {
        q: 'Will compression remove the audio?',
        a: 'No. Audio is re-encoded at good quality alongside the video, so your compressed file keeps its full soundtrack.',
      },
      {
        q: 'Why did the output barely shrink?',
        a: 'If the video was already efficiently compressed (for example a WhatsApp video), there is little left to squeeze out. Try a higher CRF number, or accept that this file is already near its minimum size.',
      },
    ],
  },
  {
    id: 'trim-audio',
    name: 'Trim Audio',
    category: 'audio-video',
    tagline: 'Cut a section out of an MP3, WAV, OGG or M4A file.',
    metaDescription:
      'Trim MP3, WAV, OGG or M4A audio to the exact section you need. Free online audio cutter, no quality loss.',
    exts: ['.mp3', '.wav', '.ogg', '.m4a'],
    requiresFile: true,
    multiple: false,
    phase: 4,
    available: true,
    options: [
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
    howTo: [
      'Upload your audio file (MP3, WAV, OGG or M4A).',
      'Enter the start time where your clip should begin.',
      'Enter the end time, or leave it empty to keep everything after the start.',
      'Click Convert and download your trimmed audio.',
    ],
    faq: [
      {
        q: 'How do I write the times?',
        a: 'Use minutes and seconds like 1:30 for one minute thirty seconds, or plain seconds like 90. The end time must be later than the start time, and leaving the end empty keeps the rest of the file.',
      },
      {
        q: 'Does trimming reduce audio quality?',
        a: 'No. Trimming copies the audio stream without re-encoding, so the kept section is bit-for-bit identical to the original.',
      },
      {
        q: 'What format will the output be?',
        a: 'The output keeps your original format — an MP3 stays an MP3, a WAV stays a WAV — so it will play everywhere the original did.',
      },
      {
        q: 'Can I trim the middle out and join the two ends?',
        a: 'Not in one step. Trim the first part and the second part separately, then use the Merge Audio tool to join them back together.',
      },
      {
        q: 'It says my end time is invalid — why?',
        a: 'Check the format (mm:ss, e.g. 2:05) and make sure the end is after the start and within the length of the audio. Extra spaces or a missing colon are the usual culprits.',
      },
    ],
  },
  {
    id: 'merge-audio',
    name: 'Merge Audio',
    category: 'audio-video',
    tagline: 'Join multiple audio files into one MP3, in upload order.',
    metaDescription:
      'Combine multiple MP3, WAV, OGG or M4A files into a single MP3. Free online audio joiner, up to 20 files.',
    exts: ['.mp3', '.wav', '.ogg', '.m4a'],
    requiresFile: true,
    multiple: true,
    phase: 4,
    available: true,
    options: [],
    howTo: [
      'Upload two or more audio files (up to 20) in the order you want them joined.',
      'Double-check the order — the first uploaded file plays first.',
      'Click Convert to stitch everything into one MP3.',
      'Download the merged file.',
    ],
    faq: [
      {
        q: 'What order will the files be joined in?',
        a: 'The order you upload them. If the order looks wrong, remove the files and upload them again one by one in the sequence you want.',
      },
      {
        q: 'Can I mix MP3, WAV and M4A files together?',
        a: 'Yes. Every file is re-encoded to a common format before joining, so mixed formats, sample rates and channel layouts merge cleanly into one MP3.',
      },
      {
        q: 'What quality is the merged MP3?',
        a: 'The merged file is encoded at 192 kbps, which sounds great for music and speech while keeping the file size reasonable.',
      },
      {
        q: 'Is there a limit on the number of files?',
        a: 'You can merge up to 20 files in one go. For larger projects, merge in batches and then merge the results.',
      },
      {
        q: 'Will there be gaps between the tracks?',
        a: 'No silence is added — each file starts exactly where the previous one ends. If you want a pause, add a short silent audio clip between them before merging.',
      },
    ],
  },
];
