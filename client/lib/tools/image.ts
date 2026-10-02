// Image tool metadata (Phase 3).
import type { ToolMeta } from '../tools';

const FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

export const IMAGE_TOOLS: ToolMeta[] = [
  {
    id: 'image-convert',
    name: 'Image Converter',
    category: 'image',
    tagline: 'Convert images between JPEG, PNG and WebP.',
    metaDescription:
      'Convert JPG, PNG, WebP, HEIC and SVG images between formats online. Free, no signup, files deleted after 60 minutes.',
    exts: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.svg'],
    requiresFile: true,
    multiple: false,
    phase: 3,
    available: true,
    options: [
      {
        name: 'format',
        label: 'Output format',
        type: 'select',
        default: 'jpeg',
        options: FORMAT_OPTIONS,
      },
      {
        name: 'quality',
        label: 'Quality',
        type: 'number',
        default: 85,
        min: 1,
        max: 100,
        help: 'Higher quality looks better but makes a larger file.',
      },
    ],
    howTo: [
      'Upload your image — JPG, PNG, WebP, HEIC, HEIF or SVG.',
      'Choose the output format: JPEG, PNG or WebP.',
      'Set the quality slider (85 is a good balance for photos).',
      'Click Convert and wait a few seconds.',
      'Download the converted image, or convert another file.',
    ],
    faq: [
      {
        q: 'Will converting change how my image looks?',
        a: 'Converting between lossy formats (JPEG to WebP) re-compresses the pixels, so a tiny quality change is possible. Converting to or from PNG, which is lossless, keeps every pixel identical.',
      },
      {
        q: 'Which format should I choose?',
        a: 'Pick JPEG for photos and anything with gradients — it gives the smallest files. Pick PNG for screenshots, logos and graphics with sharp text. Pick WebP when you want modern compression that works in all current browsers.',
      },
      {
        q: 'Can I convert iPhone HEIC photos here?',
        a: 'Yes. Upload the .heic file and convert it to JPEG or PNG so it opens everywhere — on Windows, Android and older software that cannot read HEIC.',
      },
      {
        q: 'What quality setting should I use?',
        a: 'For photos, 80-90 looks virtually identical to the original at a much smaller size. Below 60 you may start seeing blocky artefacts in smooth areas like skies.',
      },
      {
        q: 'Is my uploaded image kept private?',
        a: 'Yes. Files are processed on the server only to run your conversion and are automatically deleted 60 minutes after upload. Nothing is shared or used for any other purpose.',
      },
    ],
  },
  {
    id: 'image-compress',
    name: 'Image Compressor',
    category: 'image',
    tagline: 'Shrink image file size without visible quality loss.',
    metaDescription:
      'Compress JPG, PNG and WebP images online to shrink file size. Adjustable quality, keep original format, free with no watermark.',
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    requiresFile: true,
    multiple: false,
    phase: 3,
    available: true,
    options: [
      {
        name: 'quality',
        label: 'Quality',
        type: 'number',
        default: 75,
        min: 1,
        max: 100,
        help: 'Lower = smaller file. 70-80 is the sweet spot for photos.',
      },
      {
        name: 'format',
        label: 'Output format',
        type: 'select',
        default: 'keep',
        options: [{ value: 'keep', label: 'Keep original' }, ...FORMAT_OPTIONS],
      },
    ],
    howTo: [
      'Upload a JPG, PNG or WebP image.',
      'Set the quality — lower values give smaller files.',
      'Optionally switch the output format, or keep the original.',
      'Click Convert to compress the image.',
      'Download the smaller file, or compress another image.',
    ],
    faq: [
      {
        q: 'Will compression make my photo look worse?',
        a: 'At quality 70-80, photos typically shrink to 20-40% of their original size with no difference you can see on screen. Only very low settings (below 50) show visible artefacts.',
      },
      {
        q: 'How much smaller will my file get?',
        a: 'It depends on the image. A 5 MB phone photo often drops to 1-1.5 MB at quality 75. PNG screenshots with flat colours can shrink even more; already-optimised files shrink less.',
      },
      {
        q: 'Should I keep the original format or switch?',
        a: 'Keep the original if the image is already in the format you need. Switch to WebP if you want the smallest possible file and your use case supports it — WebP beats JPEG by roughly 25-35% at the same visual quality.',
      },
      {
        q: 'Why does PNG compression behave differently?',
        a: 'PNG is lossless, so it can never discard detail the way JPEG can. The compressor applies maximum PNG optimisation, which shrinks screenshots and graphics well but does little for noisy photographs.',
      },
      {
        q: 'Can I compress images for a website?',
        a: 'Yes — that is the most common use. Smaller images load faster, which improves page speed and SEO. Compress at quality 75-80 and serve WebP where your audience uses modern browsers.',
      },
    ],
  },
  {
    id: 'image-resize',
    name: 'Image Resizer',
    category: 'image',
    tagline: 'Change image dimensions in pixels.',
    metaDescription:
      'Resize images to exact pixel dimensions online. Keep aspect ratio, crop to fill or use exact size — free and instant.',
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    requiresFile: true,
    multiple: false,
    phase: 3,
    available: true,
    options: [
      {
        name: 'width',
        label: 'Width (px)',
        type: 'number',
        min: 0,
        max: 8000,
        help: 'Pixels. Leave empty to scale automatically from the height.',
      },
      {
        name: 'height',
        label: 'Height (px)',
        type: 'number',
        min: 0,
        max: 8000,
        help: 'Pixels. Leave empty to scale automatically from the width.',
      },
      {
        name: 'fit',
        label: 'Resize mode',
        type: 'select',
        default: 'inside',
        options: [
          { value: 'inside', label: 'Keep aspect ratio' },
          { value: 'fill', label: 'Exact dimensions' },
          { value: 'cover', label: 'Crop to fill' },
        ],
      },
    ],
    howTo: [
      'Upload a JPG, PNG or WebP image.',
      'Enter a width, a height, or both in pixels.',
      'Pick a resize mode: keep aspect ratio, exact dimensions, or crop to fill.',
      'Click Convert to resize the image.',
      'Download the resized file, or resize another image.',
    ],
    faq: [
      {
        q: 'What is the difference between the three resize modes?',
        a: '"Keep aspect ratio" scales the image to fit inside your width/height without distortion. "Exact dimensions" forces the size you typed, which can stretch the image. "Crop to fill" scales then trims the edges so the result matches your size exactly with no stretching.',
      },
      {
        q: 'If I only enter a width, what happens to the height?',
        a: 'The height is calculated automatically to preserve the original proportions. Enter only one dimension whenever you want distortion-free scaling.',
      },
      {
        q: 'Will enlarging a small image make it blurry?',
        a: 'Yes — resizing cannot invent detail that was never captured. Upscaling works acceptably for modest increases (up to about 2x), but a 200 px thumbnail will never become a crisp 2000 px poster.',
      },
      {
        q: 'What sizes should I use for social media?',
        a: 'Common targets: 1080 x 1080 for Instagram posts, 1200 x 630 for link previews, 1920 x 1080 for YouTube thumbnails. Resize first, then compress for the fastest uploads.',
      },
      {
        q: 'Does resizing reduce the file size too?',
        a: 'Usually, yes — fewer pixels means less data. A 4000 px photo resized to 1200 px wide is often 70-80% smaller on disk even before compression.',
      },
    ],
  },
  {
    id: 'image-crop',
    name: 'Image Cropper',
    category: 'image',
    tagline: 'Crop images to an aspect ratio or exact region.',
    metaDescription:
      'Crop photos to square, 16:9, 9:16 or any custom region online. Free image cropper with aspect-ratio presets.',
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    requiresFile: true,
    multiple: false,
    phase: 3,
    available: true,
    options: [
      {
        name: 'aspect',
        label: 'Aspect ratio',
        type: 'select',
        default: 'free',
        options: [
          { value: 'free', label: 'Free (manual)' },
          { value: '1:1', label: '1:1 Square' },
          { value: '16:9', label: '16:9 Widescreen' },
          { value: '9:16', label: '9:16 Portrait' },
          { value: '4:3', label: '4:3 Standard' },
        ],
        help: 'A preset crops a centered region automatically. Choose "Free (manual)" and enter X, Y, width and height below to pick the region yourself.',
      },
      {
        name: 'x',
        label: 'X (px)',
        type: 'number',
        default: 0,
        min: 0,
        max: 8000,
        help: 'Distance from the left edge. Only used for a manual crop.',
      },
      {
        name: 'y',
        label: 'Y (px)',
        type: 'number',
        default: 0,
        min: 0,
        max: 8000,
        help: 'Distance from the top edge. Only used for a manual crop.',
      },
      {
        name: 'width',
        label: 'Crop width (px)',
        type: 'number',
        min: 0,
        max: 8000,
        help: 'Required for a manual crop; ignored when an aspect preset is chosen.',
      },
      {
        name: 'height',
        label: 'Crop height (px)',
        type: 'number',
        min: 0,
        max: 8000,
        help: 'Required for a manual crop; ignored when an aspect preset is chosen.',
      },
    ],
    howTo: [
      'Upload a JPG, PNG or WebP image.',
      'Choose an aspect preset for an automatic centered crop, or pick "Free (manual)".',
      'For a manual crop, enter the X and Y position plus the crop width and height in pixels.',
      'Click Convert to crop the image.',
      'Download the cropped result, or crop another image.',
    ],
    faq: [
      {
        q: 'How do the aspect-ratio presets work?',
        a: 'The preset takes the largest possible centered rectangle of that ratio from your image — for example, 1:1 cuts a centered square. Your original file is never modified; you get a new cropped download.',
      },
      {
        q: 'What do X, Y, width and height mean for a manual crop?',
        a: 'X and Y mark the top-left corner of the crop box, measured in pixels from the top-left of the image. Width and height set the size of the box. If the box runs past the image edge, it is trimmed to fit.',
      },
      {
        q: 'Does cropping reduce image quality?',
        a: 'No. Cropping only discards pixels outside the box; the pixels inside are kept exactly as they were, then re-saved in the same format at high quality.',
      },
      {
        q: 'Which preset is best for a profile picture?',
        a: 'Use 1:1 Square. Profile photos display as circles or squares on most platforms, so a centered square crop guarantees nothing important gets cut off.',
      },
      {
        q: 'Can I undo a crop?',
        a: 'Cropping is not reversible on the downloaded file, but your original upload is untouched and is deleted automatically after 60 minutes. Just run the tool again with different settings if you change your mind.',
      },
    ],
  },
  {
    id: 'remove-metadata',
    name: 'Remove Image Metadata',
    category: 'image',
    tagline: 'Strip EXIF data, GPS location and camera info from photos.',
    metaDescription:
      'Remove EXIF data, GPS location and camera info from photos before sharing. Free online metadata remover, no signup.',
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    requiresFile: true,
    multiple: false,
    phase: 3,
    available: true,
    options: [],
    howTo: [
      'Upload a JPG, PNG or WebP photo.',
      'Click Convert — no settings needed.',
      'The tool strips EXIF, GPS and camera data and fixes orientation.',
      'Download the clean image in the same format.',
      'Share the result safely, or clean another photo.',
    ],
    faq: [
      {
        q: 'What exactly gets removed?',
        a: 'All embedded EXIF data: GPS coordinates, camera make and model, lens and exposure settings, timestamps, thumbnails and any editing history. The visible pixels are untouched.',
      },
      {
        q: 'Why should I remove metadata before sharing photos?',
        a: 'Phone photos often contain precise GPS coordinates of where they were taken. Posting them publicly can reveal your home or workplace location to strangers.',
      },
      {
        q: 'Will my photo rotate or change appearance?',
        a: 'No. The tool applies the stored orientation to the pixels first, so a sideways photo comes out upright — and then the orientation tag itself is removed along with everything else.',
      },
      {
        q: 'Does stripping metadata reduce quality?',
        a: 'No. Only the invisible data block is dropped; the image is re-saved in its original format at full quality.',
      },
      {
        q: 'Do social media sites already strip this data?',
        a: 'Most major platforms strip EXIF on upload, but messaging apps, email and forums often do not. Cleaning the file yourself is the only way to be sure before it leaves your hands.',
      },
    ],
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    category: 'image',
    tagline: 'Encode an image as a Base64 data URI for code and CSS.',
    metaDescription:
      'Encode JPG, PNG, WebP or SVG as a Base64 data URI online. Paste images directly into HTML, CSS and code — free.',
    exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
    requiresFile: true,
    multiple: false,
    resultKind: 'text',
    phase: 3,
    available: true,
    options: [],
    howTo: [
      'Upload a JPG, PNG, WebP, GIF or SVG image.',
      'Click Convert to encode it as a data URI.',
      'Download the .txt file containing the full data URI.',
      'Copy the string into your HTML, CSS or code.',
      'Encode another image whenever you need one.',
    ],
    faq: [
      {
        q: 'What is a Base64 data URI?',
        a: 'It is the image expressed as a long text string, like data:image/png;base64,iVBOR... You can paste it directly into an <img> src, a CSS background, or JSON — no separate image file or URL needed.',
      },
      {
        q: 'Does Base64 make the image bigger?',
        a: 'Yes, by about 33%. Base64 is best for small assets like icons and logos. For large photos, hosting the file normally is more efficient.',
      },
      {
        q: 'When should I use a data URI instead of a file?',
        a: 'Use it for tiny graphics in emails (where attachments are unreliable), single-file HTML demos, and CSS sprites. Avoid it for hero images and galleries.',
      },
      {
        q: 'Can I convert the string back to an image?',
        a: 'Yes. Strip the data:image/...;base64, prefix, decode the remaining Base64 text, and save the bytes with the right extension. Every major language has a one-line Base64 decoder.',
      },
      {
        q: 'Does it work with SVG?',
        a: 'Yes. SVG files encode cleanly as data:image/svg+xml;base64,... and work in <img> tags and CSS backgrounds in all modern browsers.',
      },
    ],
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'image',
    tagline: 'Combine up to 20 images into a single PDF document.',
    metaDescription:
      'Turn up to 20 JPG, PNG or WebP images into one PDF online. One image per page, free, no signup or watermark.',
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    requiresFile: true,
    multiple: true,
    phase: 3,
    available: true,
    options: [],
    howTo: [
      'Upload up to 20 JPG, PNG or WebP images.',
      'Files are added to the PDF in the order you select them.',
      'Click Convert to build the PDF — one full-page image per page.',
      'Download the combined PDF document.',
      'Start a new PDF whenever you need one.',
    ],
    faq: [
      {
        q: 'How are the pages ordered?',
        a: 'Pages follow the order in which you select the files. To control the sequence, select them one batch at a time in the order you want, or rename them alphabetically first.',
      },
      {
        q: 'What page size does the PDF use?',
        a: 'Each page is sized to its image, full-bleed with no margins, capped at 1440 px on the long edge. That keeps the file compact while staying sharp on screen and in print.',
      },
      {
        q: 'Will my images lose quality in the PDF?',
        a: 'Images are embedded as high-quality JPEGs (quality 90). For photos and scans the difference from the original is imperceptible.',
      },
      {
        q: 'Can I add a password to the PDF?',
        a: 'Not with this tool — it creates a standard open PDF. If you need protection, generate the PDF here first and then use the Protect PDF tool.',
      },
      {
        q: 'Is this good for scanning documents with my phone?',
        a: 'Yes. Photograph each page, upload the photos in order, and you get a single multi-page PDF that is easy to email or archive.',
      },
    ],
  },
];
