// Utility tool metadata (Phase 5).
import type { ToolMeta } from '../tools';

export const UTILITY_TOOLS: ToolMeta[] = [
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'utility',
    tagline: 'Turn any link or text into a scannable QR code image.',
    metaDescription:
      'Free QR code generator. Turn any link or text into a crisp PNG QR code in seconds. No signup, no watermark.',
    exts: [],
    requiresFile: false,
    multiple: false,
    phase: 5,
    available: true,
    options: [
      {
        name: 'text',
        label: 'Link or text',
        type: 'textarea',
        required: true,
        maxLength: 2000,
        placeholder: 'https://example.com',
        help: 'The content encoded into the QR code.',
      },
      {
        name: 'size',
        label: 'Image size (px)',
        type: 'select',
        default: '512',
        options: [
          { value: '256', label: '256 px' },
          { value: '512', label: '512 px' },
          { value: '1024', label: '1024 px' },
        ],
      },
    ],
    howTo: [
      'Type or paste the link or text you want to encode into the box above.',
      'Pick an image size — 512 px works for screens, 1024 px for printing.',
      'Press Generate and download your PNG QR code.',
      'Test-scan it with your phone camera before printing or publishing.',
    ],
    faq: [
      {
        q: 'Is this QR code generator really free?',
        a: 'Yes. You can generate unlimited QR codes with no signup, no watermark and no expiry. The PNG image is yours to use anywhere.',
      },
      {
        q: 'What can I encode in a QR code?',
        a: 'Any website link, plain text, a Wi-Fi login, contact details or a short message — up to 2,000 characters. Longer content makes a denser code that is harder to scan from far away.',
      },
      {
        q: 'What size should I choose?',
        a: 'Use 256 px for on-screen use, 512 px for general use, and 1024 px when you plan to print the code on flyers, packaging or business cards.',
      },
      {
        q: 'Do my QR codes expire or track me?',
        a: 'No. The code encodes your text directly — there is no redirect server, no tracking and nothing to expire. Nothing you type is stored after the download.',
      },
      {
        q: 'Will the QR code scan on iPhone and Android?',
        a: 'Yes. The codes follow the standard QR format, so the built-in camera app on both iPhone and Android reads them without any extra app.',
      },
    ],
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    category: 'utility',
    tagline: 'Count words, characters, sentences and paragraphs instantly.',
    metaDescription:
      'Free online word counter. Count words, characters, sentences and paragraphs, plus estimated reading time. No signup needed.',
    exts: [],
    requiresFile: false,
    multiple: false,
    resultKind: 'text',
    phase: 5,
    available: true,
    options: [
      {
        name: 'text',
        label: 'Paste your text',
        type: 'textarea',
        required: true,
        maxLength: 20000,
        placeholder: 'Paste or type your text here…',
        help: 'Up to 20,000 characters.',
      },
    ],
    howTo: [
      'Paste or type your text into the box above.',
      'Press Count to analyse it instantly.',
      'Download the report with word, character, sentence and paragraph counts.',
      'Check the estimated reading time at the bottom of the report.',
    ],
    faq: [
      {
        q: 'How are words counted?',
        a: 'Any run of non-whitespace characters counts as one word, the same way most editors count. Hyphenated words and numbers each count as one word.',
      },
      {
        q: 'What is the character limit?',
        a: 'You can analyse up to 20,000 characters at once — roughly 3,000–4,000 words, enough for essays, articles and reports.',
      },
      {
        q: 'How is reading time estimated?',
        a: 'We divide your word count by 200 words per minute, the widely used average adult reading speed, and round up to at least one minute.',
      },
      {
        q: 'Is my text stored anywhere?',
        a: 'No. Your text is analysed in memory and the report file is auto-deleted from our servers 60 minutes after creation.',
      },
      {
        q: 'Can I use this for school or work assignments?',
        a: 'Yes — it is handy for essays, SEO meta limits, social media character limits and manuscript word counts.',
      },
    ],
  },
  {
    id: 'hashtag-generator',
    name: 'Hashtag Generator',
    category: 'utility',
    tagline: 'Get a curated set of hashtags for your topic and platform.',
    metaDescription:
      'Free hashtag generator for Instagram, YouTube, TikTok and X. Curated hashtag sets for any topic, ready to copy-paste. No signup.',
    exts: [],
    requiresFile: false,
    multiple: false,
    resultKind: 'text',
    phase: 5,
    available: true,
    options: [
      {
        name: 'topic',
        label: 'Topic',
        type: 'text',
        required: true,
        maxLength: 80,
        placeholder: 'e.g. homemade pizza',
        help: 'A few words describing your post.',
      },
      {
        name: 'platform',
        label: 'Platform',
        type: 'select',
        default: 'instagram',
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'x', label: 'X' },
        ],
      },
      {
        name: 'count',
        label: 'Number of hashtags',
        type: 'number',
        default: 15,
        min: 5,
        max: 30,
        step: 1,
      },
    ],
    howTo: [
      'Enter a short topic for your post, e.g. “homemade pizza”.',
      'Choose the platform you are posting to.',
      'Pick how many hashtags you want (5–30).',
      'Press Generate, then copy the ready-to-paste line into your post.',
    ],
    faq: [
      {
        q: 'How are the hashtags chosen?',
        a: 'We combine tags built from your own topic words with curated platform-specific sets that are popular on Instagram, YouTube, TikTok or X. Topic tags come first because they are the most relevant to your post.',
      },
      {
        q: 'How many hashtags should I use?',
        a: 'It depends on the platform: Instagram posts do well with 10–20, TikTok with 3–5 focused ones, YouTube with a few in the description, and X with 1–2 per post. The tool lets you pick 5–30.',
      },
      {
        q: 'Will these hashtags guarantee more reach?',
        a: 'No tool can guarantee reach. Hashtags help the right audience discover your post, but good content and consistency matter far more.',
      },
      {
        q: 'Do you use AI to generate these?',
        a: 'No — these are curated hashtag sets assembled from your topic plus popular platform tags. Nothing is sent to any AI service.',
      },
      {
        q: 'Is my topic stored?',
        a: 'No. Your topic is used once to build the list and is never stored or shared.',
      },
    ],
  },
  {
    id: 'social-resizer',
    name: 'Social Media Image Resizer',
    category: 'utility',
    tagline: 'Resize any photo to the perfect size for each social platform.',
    metaDescription:
      'Free social media image resizer. Resize photos to exact Instagram, YouTube, Facebook and X dimensions. Fast, private, no signup.',
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    requiresFile: true,
    multiple: false,
    phase: 5,
    available: true,
    options: [
      {
        name: 'preset',
        label: 'Platform preset',
        type: 'select',
        default: 'instagram-post',
        options: [
          { value: 'instagram-post', label: 'Instagram Post — 1080×1080' },
          { value: 'instagram-story', label: 'Instagram Story — 1080×1920' },
          { value: 'youtube-thumbnail', label: 'YouTube Thumbnail — 1280×720' },
          { value: 'facebook-post', label: 'Facebook Post — 1200×630' },
          { value: 'x-post', label: 'X Post — 1200×675' },
        ],
        help: 'The image is cropped to fill the exact dimensions.',
      },
    ],
    howTo: [
      'Upload your photo (JPG, PNG or WebP).',
      'Choose the platform preset you need.',
      'Press Resize and download the perfectly-sized JPG.',
      'Upload it straight to the social platform — no further editing needed.',
    ],
    faq: [
      {
        q: 'What sizes do you support?',
        a: 'Instagram Post 1080×1080, Instagram Story 1080×1920, YouTube Thumbnail 1280×720, Facebook Post 1200×630 and X Post 1200×675.',
      },
      {
        q: 'Will my image be stretched?',
        a: 'No. The image is centre-cropped to fill the exact dimensions, so nothing is stretched or squashed. For full control over the crop, crop first in your photo editor.',
      },
      {
        q: 'What quality is the output?',
        a: 'The output is a high-quality JPEG (quality 90), which keeps file sizes reasonable while looking sharp on every platform.',
      },
      {
        q: 'Can I resize without cropping?',
        a: 'This tool fills the exact platform dimensions with a centre crop. A fit-without-crop mode may be added later — for now, pad your image beforehand if you need the whole photo visible.',
      },
      {
        q: 'Is my photo kept on your servers?',
        a: 'No. Your photo is processed securely and permanently deleted 60 minutes after upload.',
      },
    ],
  },
];
