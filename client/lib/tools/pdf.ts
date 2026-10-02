// PDF tool metadata (Phase 2). SEO copy, option schemas, how-tos and FAQs.
// Option schemas mirror server/src/services/tools/pdf.ts exactly — the server
// re-validates every option, so keep both sides in sync.
import type { ToolMeta } from '../tools';

export const PDF_TOOLS: ToolMeta[] = [
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    category: 'pdf',
    tagline: 'Turn every PDF page into a JPG or PNG image.',
    metaDescription:
      'Convert PDF pages to JPG or PNG images free. Pick 150 or 300 DPI. Single page downloads instantly; multi-page PDFs arrive as a ZIP.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'format',
        label: 'Image format',
        type: 'select',
        default: 'jpg',
        options: [
          { value: 'jpg', label: 'JPG' },
          { value: 'png', label: 'PNG' },
        ],
      },
      {
        name: 'dpi',
        label: 'Resolution (DPI)',
        type: 'select',
        default: '150',
        options: [
          { value: '150', label: '150 DPI' },
          { value: '300', label: '300 DPI' },
        ],
        help: 'Higher DPI gives sharper images but larger files.',
      },
    ],
    howTo: [
      'Upload your PDF file using the drop zone or file picker.',
      'Choose JPG for photos and smaller files, or PNG for crisp text and graphics.',
      'Pick 150 DPI for screen use or 300 DPI for printing.',
      'Click Convert and wait while each page is rendered.',
      'Download your image — or a ZIP of images if the PDF has several pages.',
    ],
    faq: [
      {
        q: 'Should I choose JPG or PNG?',
        a: 'Pick JPG for scanned documents and photos — the files stay small. Pick PNG when the PDF holds sharp text, line art or flat graphics, because PNG keeps edges crisp without compression smudges.',
      },
      {
        q: 'What does DPI change?',
        a: 'DPI sets how many pixels each page renders to. 150 DPI is plenty for screens and slides; 300 DPI roughly quadruples the pixel count and is the better pick if you plan to print the images.',
      },
      {
        q: 'Why did I get a ZIP file instead of an image?',
        a: 'A one-page PDF downloads as a single image. When your PDF has two or more pages, every page becomes its own numbered image and they are bundled into one ZIP so nothing gets lost.',
      },
      {
        q: 'Will the images keep the original layout?',
        a: 'Yes. Each page is rendered exactly as it looks in a PDF reader — fonts, tables and pictures included — at the resolution you selected.',
      },
      {
        q: 'Is my PDF kept on your servers?',
        a: 'No. Your upload and the converted images are deleted automatically 60 minutes after conversion, and the connection is encrypted in transit.',
      },
    ],
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'pdf',
    tagline: 'Extract PDF text into an editable Word document.',
    metaDescription:
      'Convert PDF to editable Word (.docx) free. Text flows page by page into a document you can edit. No signup; files auto-delete after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload the PDF you want to edit.',
      'Click Convert — the text of every page is extracted in order.',
      'Download the .docx file when the job finishes.',
      'Open it in Word, Google Docs or LibreOffice and edit freely.',
    ],
    faq: [
      {
        q: 'Will the Word file look exactly like the PDF?',
        a: 'The text, paragraphs and page breaks carry over, but complex layouts — multi-column pages, floating tables, fancy headers — are simplified. Treat the result as editable text, not a pixel-perfect clone.',
      },
      {
        q: 'My PDF is a scan and the Word file came out empty. Why?',
        a: 'Scanned PDFs are pictures of text, not real text, so there is nothing to extract. Run the file through the OCR PDF tool first to make it searchable, then convert it to Word.',
      },
      {
        q: 'Does it handle password-protected PDFs?',
        a: 'No. Unlock the PDF first with the Unlock PDF tool (you need the password), then convert the unlocked file.',
      },
      {
        q: 'Which programs open the resulting file?',
        a: 'The output is a standard .docx file, so Microsoft Word, Google Docs, Apple Pages and LibreOffice all open it.',
      },
      {
        q: 'How private is this conversion?',
        a: 'Files travel over an encrypted connection, are processed on the server, and are wiped automatically 60 minutes later. Nothing is kept or shared.',
      },
    ],
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'pdf',
    tagline: 'Convert DOC and DOCX files to PDF.',
    metaDescription:
      'Convert Word documents (DOC, DOCX) to PDF free online. Keeps fonts and layout. No signup, no watermark, files deleted after 60 minutes.',
    exts: ['.doc', '.docx'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload your .doc or .docx file.',
      'Click Convert — the document is rendered to PDF.',
      'Download the finished PDF when the job completes.',
      'Open it to confirm fonts, tables and images look right.',
    ],
    faq: [
      {
        q: 'Do I need Microsoft Word installed?',
        a: 'No. Conversion runs on the server, so it works from any device — phone, tablet or computer — with nothing to install.',
      },
      {
        q: 'Will my formatting survive the conversion?',
        a: 'Yes for standard formatting: fonts, sizes, bold/italic, tables, lists, images and page breaks all carry over. Very unusual fonts may be substituted if the document relies on fonts not available on the server.',
      },
      {
        q: 'Is there a watermark or page limit?',
        a: 'No watermarks and no page limits within the normal upload size. The output is a clean PDF of your document.',
      },
      {
        q: 'Can I convert a password-protected Word file?',
        a: 'Password-protected documents cannot be opened for conversion. Remove the password in Word first, then upload.',
      },
    ],
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    category: 'pdf',
    tagline: 'Pull PDF text into a spreadsheet, page by page.',
    metaDescription:
      'Convert PDF to Excel (.xlsx) free. Extracts text into Page and Line columns for easy sorting. No signup; files auto-delete after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload the PDF containing the text or data you need.',
      'Click Convert — each line of text is extracted with its page number.',
      'Download the .xlsx file.',
      'Open it in Excel, Google Sheets or LibreOffice and sort or filter as needed.',
    ],
    faq: [
      {
        q: 'How is the spreadsheet organised?',
        a: 'Two columns: Page (the PDF page number) and Line (one line of extracted text). That makes it easy to filter, search and reference where each line came from.',
      },
      {
        q: 'Will PDF tables become real Excel tables?',
        a: 'Not exactly. Text is extracted line by line rather than reconstructed into table cells, so you may need to tidy columns afterwards. For clean tabular data it still beats retyping.',
      },
      {
        q: 'My PDF is scanned — will this work?',
        a: 'Scanned pages contain no selectable text, so the sheet would come out empty. Use the OCR PDF tool first to add a searchable text layer, then convert.',
      },
      {
        q: 'Is there a limit on PDF size?',
        a: 'Large PDFs with thousands of lines convert fine, but extremely long documents produce very tall spreadsheets. The normal upload size limit applies.',
      },
    ],
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'pdf',
    tagline: 'Convert XLS and XLSX spreadsheets to PDF.',
    metaDescription:
      'Convert Excel spreadsheets (XLS, XLSX) to PDF free online. Clean printable output with no watermark. Files deleted after 60 minutes.',
    exts: ['.xls', '.xlsx'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload your .xls or .xlsx spreadsheet.',
      'Click Convert — the sheet is rendered to PDF.',
      'Download the finished PDF when ready.',
      'Check wide tables fit the page before sharing.',
    ],
    faq: [
      {
        q: 'Which sheet gets converted?',
        a: 'The conversion renders the workbook as the spreadsheet app would print it, starting from the active sheet. For multi-sheet workbooks, arrange the sheet you want first or split it out beforehand.',
      },
      {
        q: 'Will formulas show values or formulas?',
        a: 'Calculated values are shown, exactly as the spreadsheet displays them — the PDF is a snapshot of results, not the formulas behind them.',
      },
      {
        q: 'My wide sheet gets cut off. What can I do?',
        a: 'Set the print area and fit-to-page options in Excel before uploading, since the converter follows the workbook’s own print settings.',
      },
      {
        q: 'Does it work with old .xls files?',
        a: 'Yes, both the classic .xls format and modern .xlsx files are accepted.',
      },
    ],
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    category: 'pdf',
    tagline: 'Turn each PDF page into a presentation slide.',
    metaDescription:
      'Convert PDF to PowerPoint (.pptx) free. Every page becomes a full-slide image you can present or edit. No signup; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload the PDF you want to present.',
      'Click Convert — each page is rendered as a slide image.',
      'Download the .pptx file.',
      'Open it in PowerPoint, Google Slides or Keynote and present.',
    ],
    faq: [
      {
        q: 'Can I edit the text on the slides?',
        a: 'Each slide is a full-page image of the original PDF page, so the text itself is not editable. You can still add new text boxes, shapes and annotations on top of any slide.',
      },
      {
        q: 'What slide size is used?',
        a: 'Slides use the standard 10 by 7.5 inch widescreen-friendly layout with the page image filling the whole slide edge to edge.',
      },
      {
        q: 'Will it work for a scanned PDF?',
        a: 'Yes — because pages are rendered as images, scanned PDFs convert just as well as text-based ones.',
      },
      {
        q: 'Which apps open the result?',
        a: 'The output is a standard .pptx file, compatible with Microsoft PowerPoint, Google Slides, Apple Keynote and LibreOffice Impress.',
      },
    ],
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    category: 'pdf',
    tagline: 'Convert PPT and PPTX presentations to PDF.',
    metaDescription:
      'Convert PowerPoint presentations (PPT, PPTX) to PDF free online. One page per slide, layout preserved. No signup; files deleted after 60 minutes.',
    exts: ['.ppt', '.pptx'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload your .ppt or .pptx presentation.',
      'Click Convert — every slide becomes a PDF page.',
      'Download the finished PDF when the job completes.',
      'Share or print it — it opens on any device.',
    ],
    faq: [
      {
        q: 'Do animations and transitions carry over?',
        a: 'No. A PDF is a static document, so each slide is captured in its final state — animations, transitions and embedded videos become still images of the slide.',
      },
      {
        q: 'Will my fonts look the same?',
        a: 'Standard fonts render faithfully. If the presentation uses a rare custom font, the server may substitute a close match.',
      },
      {
        q: 'Can I convert a password-protected presentation?',
        a: 'No — remove the password in PowerPoint first, then upload the unlocked file.',
      },
      {
        q: 'What is the PDF good for?',
        a: 'Sharing decks that anyone can open, printing handouts, and archiving a fixed version of the presentation that cannot be accidentally edited.',
      },
    ],
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    category: 'pdf',
    tagline: 'Combine up to 20 PDFs into one file, in order.',
    metaDescription:
      'Merge up to 20 PDFs into one file free. Pages join in the order you upload. No signup, no watermark; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: true,
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload two or more PDF files.',
      'Check the file order — pages are merged in upload order.',
      'Click Convert to combine them.',
      'Download the single merged PDF.',
    ],
    faq: [
      {
        q: 'How many PDFs can I merge at once?',
        a: 'Up to 20 files per job. For larger batches, merge in groups and then merge the results together.',
      },
      {
        q: 'How do I control the page order?',
        a: 'Pages follow the order your files were attached. If the order looks wrong, re-upload the files in the sequence you want.',
      },
      {
        q: 'Will bookmarks or forms survive merging?',
        a: 'Page content merges cleanly, but interactive extras like form fields, bookmarks and annotations may be simplified or dropped. Flatten forms before merging if the filled values matter.',
      },
      {
        q: 'Can I merge a password-protected PDF?',
        a: 'No. Unlock it first with the Unlock PDF tool, then include the unlocked file in your merge.',
      },
      {
        q: 'Does merging reduce quality?',
        a: 'No. Pages are copied without re-rendering, so text and images keep their original quality.',
      },
    ],
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    category: 'pdf',
    tagline: 'Extract page ranges into separate PDF files.',
    metaDescription:
      'Split PDF pages free online. Extract ranges like 1-3, 5 into separate PDFs. One range downloads directly; several arrive as a ZIP.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'ranges',
        label: 'Page ranges',
        type: 'text',
        required: true,
        placeholder: '1-3, 5',
        help: 'Page ranges to extract, e.g. 1-3, 5, 8-10. Each range becomes its own PDF.',
        maxLength: 200,
      },
    ],
    howTo: [
      'Upload the PDF you want to split.',
      'Type the page ranges to extract, e.g. "1-3, 5" — each range becomes its own PDF.',
      'Click Convert.',
      'Download the single PDF, or the ZIP if you extracted several ranges.',
      'Check each part opens correctly before deleting the original.',
    ],
    faq: [
      {
        q: 'How do I write the page ranges?',
        a: 'Use numbers and dashes separated by commas: "1-3" grabs pages 1 to 3, "5" grabs just page 5, and "1-3, 5, 8-10" extracts three separate PDFs. Page numbers that do not exist are rejected with a clear message.',
      },
      {
        q: 'When do I get one PDF vs a ZIP?',
        a: 'A single range (like "2-4") downloads as one PDF. Two or more ranges are packed into a ZIP with numbered part files so you can tell them apart.',
      },
      {
        q: 'Can I split out non-adjacent pages into one file?',
        a: 'Each range becomes its own file. To combine scattered pages into one PDF, split them first and then merge the parts with the Merge PDF tool.',
      },
      {
        q: 'Does splitting lower the quality?',
        a: 'No. Pages are copied directly from the original, so text and images are identical to the source.',
      },
      {
        q: 'What if my range includes a page that does not exist?',
        a: 'The conversion stops with a message telling you the valid page range (1 to the last page), so you can fix the input and retry.',
      },
    ],
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    category: 'pdf',
    tagline: 'Shrink PDF file size with three quality levels.',
    metaDescription:
      'Compress PDF file size free. Choose Smaller, Balanced or High quality. Great for email attachments and uploads. Files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'quality',
        label: 'Quality',
        type: 'select',
        default: 'ebook',
        options: [
          { value: 'screen', label: 'Smaller size' },
          { value: 'ebook', label: 'Balanced' },
          { value: 'printer', label: 'High quality' },
        ],
        help: 'Smaller size compresses more aggressively; High quality keeps print-ready detail.',
      },
    ],
    howTo: [
      'Upload the PDF you want to shrink.',
      'Choose a quality level: Smaller size, Balanced or High quality.',
      'Click Convert and let the file be re-compressed.',
      'Download the smaller PDF and check it meets your needs.',
    ],
    faq: [
      {
        q: 'How much smaller will my PDF get?',
        a: 'It depends on the content. Image-heavy PDFs often shrink 40–70% on Balanced; text-only PDFs were already small and may barely change. Try Balanced first, then Smaller size if you need more.',
      },
      {
        q: 'Which quality should I pick?',
        a: 'Smaller size for screen viewing and email; Balanced for everyday sharing; High quality when the PDF must still print well.',
      },
      {
        q: 'Will compression blur my images?',
        a: 'Some softening is the trade-off for a smaller file, and it is most visible on Smaller size. Text stays sharp at every level.',
      },
      {
        q: 'My file barely shrank. Why?',
        a: 'Text-based PDFs and already-optimised files have little to squeeze out. Compression helps most with large photos and scanned pages.',
      },
      {
        q: 'Is the compressed PDF still a normal PDF?',
        a: 'Yes — a standard PDF that opens everywhere, just with downsampled images inside.',
      },
    ],
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    category: 'pdf',
    tagline: 'Rotate pages by 90, 180 or 270 degrees.',
    metaDescription:
      'Rotate PDF pages free online. Turn all pages or just selected ones by 90, 180 or 270 degrees. No signup; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'angle',
        label: 'Rotation angle',
        type: 'select',
        default: '90',
        options: [
          { value: '90', label: '90° clockwise' },
          { value: '180', label: '180°' },
          { value: '270', label: '270° clockwise' },
        ],
      },
      {
        name: 'pages',
        label: 'Pages',
        type: 'text',
        default: 'all',
        placeholder: 'all',
        help: 'Type "all", or specific pages e.g. 1, 3-5.',
        maxLength: 200,
      },
    ],
    howTo: [
      'Upload the PDF with sideways or upside-down pages.',
      'Pick the rotation angle: 90°, 180° or 270°.',
      'Leave Pages as "all", or type specific pages like 1, 3-5.',
      'Click Convert, then download the corrected PDF.',
    ],
    faq: [
      {
        q: 'Can I rotate only some pages?',
        a: 'Yes. Type the pages you want, e.g. "2" or "1, 3-5", instead of "all". Everything else stays exactly as it was.',
      },
      {
        q: 'Does rotating reduce quality?',
        a: 'No. Rotation only changes the page orientation flag — the content itself is untouched, so nothing is re-rendered or degraded.',
      },
      {
        q: 'Why do my scanned pages still look sideways in some viewers?',
        a: 'A few old viewers ignore the rotation flag on scanned images. If that happens, the PDF itself is still correctly rotated in all modern readers.',
      },
      {
        q: 'What if different pages need different angles?',
        a: 'Run the tool once per angle: rotate the first set of pages, download, then upload the result and rotate the next set.',
      },
    ],
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    category: 'pdf',
    tagline: 'Lock a PDF with a password (128-bit encryption).',
    metaDescription:
      'Password-protect a PDF free with 128-bit encryption. Set one password to lock opening. No signup; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        maxLength: 64,
        help: 'Anyone opening the PDF will need this password.',
      },
    ],
    howTo: [
      'Upload the PDF you want to lock.',
      'Type a strong password (use a mix of letters, numbers and symbols).',
      'Click Convert to apply 128-bit encryption.',
      'Download the protected PDF and store the password safely.',
    ],
    faq: [
      {
        q: 'How strong is the protection?',
        a: 'The PDF is encrypted with 128-bit encryption, which stops casual opening and is supported by every major PDF reader. Use a long, unique password for sensitive documents.',
      },
      {
        q: 'What happens if I forget the password?',
        a: 'There is no recovery — the encryption cannot be undone without the password, and we do not keep a copy. Save it in a password manager before you close the page.',
      },
      {
        q: 'Do you store my password?',
        a: 'No. The password is used once during conversion and never written to logs or disk. Both files are deleted automatically after 60 minutes.',
      },
      {
        q: 'Can I set different passwords for opening and editing?',
        a: 'This tool sets a single password that is required to open the file, which is the protection most people need.',
      },
      {
        q: 'Will the protected PDF open on phones?',
        a: 'Yes. Any modern PDF reader on phone, tablet or desktop will prompt for the password and then open the file normally.',
      },
    ],
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'pdf',
    tagline: 'Remove the password from a PDF you own.',
    metaDescription:
      'Remove PDF passwords free online. Unlock a PDF you own with its current password. No signup; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'password',
        label: 'Current password (if any)',
        type: 'text',
        maxLength: 64,
        help: 'Leave blank if the PDF opens without a password.',
      },
    ],
    howTo: [
      'Upload the password-protected PDF.',
      'Enter its current password (leave blank if it opens freely but restricts editing).',
      'Click Convert to strip the encryption.',
      'Download the unlocked PDF.',
    ],
    faq: [
      {
        q: 'Can this remove a password I do not know?',
        a: 'No. You must supply the correct current password — the tool cannot crack or bypass unknown passwords. Only unlock files you own or have rights to.',
      },
      {
        q: 'The password field is optional — when do I leave it blank?',
        a: 'Some PDFs open without a password but block printing or editing (an owner password). Leave the field blank and the tool will still try to remove those restrictions.',
      },
      {
        q: 'Why did unlocking fail with the right password?',
        a: 'Double-check for typos, caps lock and extra spaces. A few PDFs use unusual encryption schemes that this tool does not support.',
      },
      {
        q: 'Is the unlocked file identical to the original?',
        a: 'The pages and content are preserved; only the encryption wrapper is removed.',
      },
    ],
  },
  {
    id: 'watermark-pdf',
    name: 'Watermark PDF',
    category: 'pdf',
    tagline: 'Stamp diagonal text across every page.',
    metaDescription:
      'Add a watermark to PDF free. Stamp diagonal text like CONFIDENTIAL on every page with adjustable opacity. Files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'text',
        label: 'Watermark text',
        type: 'text',
        required: true,
        default: 'CONFIDENTIAL',
        maxLength: 60,
      },
      {
        name: 'opacity',
        label: 'Opacity',
        type: 'number',
        min: 10,
        max: 60,
        default: 25,
        help: 'Percent — 10 is faint, 60 is bold.',
      },
    ],
    howTo: [
      'Upload the PDF you want to stamp.',
      'Type your watermark text, e.g. DRAFT or CONFIDENTIAL.',
      'Set the opacity — lower is subtler, higher is bolder.',
      'Click Convert, then download the watermarked PDF.',
    ],
    faq: [
      {
        q: 'Where does the watermark appear?',
        a: 'Diagonally across the centre of every page at a 45-degree angle, in grey. It sits over the content but stays translucent so the text beneath remains readable.',
      },
      {
        q: 'What opacity should I use?',
        a: '25% (the default) suits most drafts. Drop to 10–15% for a faint background stamp, or raise toward 60% when the mark must be unmissable.',
      },
      {
        q: 'Can the watermark be removed later?',
        a: 'It becomes part of the page content, so it cannot be toggled off like a Word watermark. Keep an unstamped copy if you might need the clean original.',
      },
      {
        q: 'Does it work on scanned PDFs?',
        a: 'Yes — the stamp is drawn over each page regardless of whether the page holds text or scanned images.',
      },
      {
        q: 'Can I watermark only certain pages?',
        a: 'This tool stamps every page. To limit it, split out the pages first, watermark them, then merge everything back together.',
      },
    ],
  },
  {
    id: 'page-numbers-pdf',
    name: 'Add Page Numbers',
    category: 'pdf',
    tagline: 'Stamp page numbers onto every page.',
    metaDescription:
      'Add page numbers to PDF free. Choose bottom or top placement and a starting number. No signup; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'position',
        label: 'Position',
        type: 'select',
        default: 'bottom-center',
        options: [
          { value: 'bottom-center', label: 'Bottom center' },
          { value: 'bottom-right', label: 'Bottom right' },
          { value: 'top-center', label: 'Top center' },
        ],
      },
      {
        name: 'startAt',
        label: 'Start numbering at',
        type: 'number',
        min: 1,
        max: 100000,
        default: 1,
      },
    ],
    howTo: [
      'Upload the PDF that needs page numbers.',
      'Choose where the numbers sit: bottom center, bottom right or top center.',
      'Set the starting number (use 1, or a higher number to continue an existing sequence).',
      'Click Convert and download the numbered PDF.',
    ],
    faq: [
      {
        q: 'When would I start numbering above 1?',
        a: 'When the PDF is one chapter of a longer document — set the start to continue the sequence, e.g. start at 41 if the previous chapter ended on page 40.',
      },
      {
        q: 'Will the numbers cover my footer text?',
        a: 'They sit in the margin area (24pt from the bottom edge). If your footer already uses that space, pick a different position.',
      },
      {
        q: 'Can I use Roman numerals or "Page X of Y"?',
        a: 'The tool stamps plain numbers only. For fancy formats, number the PDF here and adjust the style in a PDF editor afterwards.',
      },
      {
        q: 'Are the numbers selectable text?',
        a: 'Yes — they are drawn as real text on each page, not images, so they stay sharp at any zoom.',
      },
    ],
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    category: 'pdf',
    tagline: 'Make scanned PDFs searchable with text recognition.',
    metaDescription:
      'OCR scanned PDFs free online. Adds a searchable text layer so you can select and search scanned pages. Files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'language',
        label: 'Document language',
        type: 'select',
        default: 'eng',
        options: [{ value: 'eng', label: 'English' }],
      },
    ],
    howTo: [
      'Upload your scanned PDF.',
      'Confirm the document language.',
      'Click Convert — every page is rendered at 300 DPI and recognised.',
      'Download the searchable PDF and try selecting text in it.',
    ],
    faq: [
      {
        q: 'What does OCR actually do to my PDF?',
        a: 'Each page is rendered as a high-resolution image, the text in it is recognised, and an invisible searchable text layer is added behind the original page image. The pages look identical but you can now search and copy text.',
      },
      {
        q: 'How accurate is the recognition?',
        a: 'Clean, straight scans of printed English text come out very accurately. Faded prints, handwriting, skewed photos of pages and tiny fonts will have more errors — good scans in, good text out.',
      },
      {
        q: 'Why does it take longer than other tools?',
        a: 'Every page is rendered at 300 DPI and analysed individually, which is CPU-heavy. A 50-page scan can take a few minutes; progress is shown while you wait.',
      },
      {
        q: 'Which languages are supported?',
        a: 'English right now. More language packs are planned — the language list will grow as they are added.',
      },
      {
        q: 'Will OCR fix a sideways scan?',
        a: 'No. Recognition works best on upright pages, so rotate sideways scans with the Rotate PDF tool before running OCR.',
      },
    ],
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'pdf',
    tagline: 'Extract all text from a PDF into a plain .txt file.',
    metaDescription:
      'Extract text from PDF to TXT free. Clean plain-text output with page markers. No signup; files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    resultKind: 'text',
    phase: 2,
    available: true,
    options: [],
    howTo: [
      'Upload the PDF you want the text from.',
      'Click Convert — the text of every page is extracted.',
      'Download the .txt file and open it in any text editor.',
      'Use the page markers to find where each passage came from.',
    ],
    faq: [
      {
        q: 'How is the text organised?',
        a: 'Pages stay in order with a "--- Page N ---" marker before each one, so you can always tell where a passage came from.',
      },
      {
        q: 'Will formatting like bold and tables survive?',
        a: 'No — the output is plain text only. Styles, columns and table gridlines are dropped; what remains is the readable content in reading order.',
      },
      {
        q: 'The text file is empty. What went wrong?',
        a: 'The PDF is probably scanned images rather than real text. Run it through the OCR PDF tool first, then extract the text.',
      },
      {
        q: 'Can I extract text from a password-protected PDF?',
        a: 'Unlock it first with the Unlock PDF tool, then extract the text from the unlocked file.',
      },
    ],
  },
  {
    id: 'reorder-pdf',
    name: 'Reorder PDF Pages',
    category: 'pdf',
    tagline: 'Rearrange pages into any order you choose.',
    metaDescription:
      'Reorder PDF pages free online. Type the new page order like 3, 1, 2 and download the rearranged PDF. Files deleted after 60 minutes.',
    exts: ['.pdf'],
    requiresFile: true,
    multiple: false,
    phase: 2,
    available: true,
    options: [
      {
        name: 'order',
        label: 'New page order',
        type: 'text',
        required: true,
        placeholder: '3, 1, 2',
        help: 'Comma-separated page numbers in the order you want them. List every page once.',
        maxLength: 2000,
      },
    ],
    howTo: [
      'Upload the PDF whose pages are out of order.',
      'Type the new order as page numbers, e.g. "3, 1, 2" — list every page exactly once.',
      'Click Convert to rebuild the PDF in your order.',
      'Download the rearranged PDF.',
    ],
    faq: [
      {
        q: 'Do I have to list every page?',
        a: 'Yes. List all pages exactly once — for a 5-page PDF something like "5, 4, 3, 2, 1". The tool tells you if a page is missing or repeated.',
      },
      {
        q: 'Can I drop pages while reordering?',
        a: 'No — reordering keeps every page. To remove pages, use Split PDF with only the ranges you want to keep.',
      },
      {
        q: 'Can I duplicate a page in the new order?',
        a: 'No, each page number may appear only once. To duplicate pages, merge the PDF with itself and then reorder.',
      },
      {
        q: 'Does reordering affect quality?',
        a: 'No. Pages are copied as-is into the new sequence, so text and images are untouched.',
      },
    ],
  },
];
