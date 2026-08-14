import JSZip from 'jszip';
import { Book, Chapter, BookFormat } from '../types';

const COVER_COLORS = ['#5856D6', '#FF9F0A', '#FF375F', '#30D158', '#0A84FF', '#BF5AF2', '#64D2FF'];

export interface ParsedFileResult {
  title: string;
  author: string;
  format: BookFormat;
  chapters: Chapter[];
  coverColor: string;
}

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = decodeBase64Polyfill(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const decodeBase64Polyfill = (base64: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  let output = '';

  for (let i = 0; i < str.length; i += 4) {
    const enc1 = chars.indexOf(str.charAt(i));
    const enc2 = chars.indexOf(str.charAt(i + 1));
    const enc3 = chars.indexOf(str.charAt(i + 2));
    const enc4 = chars.indexOf(str.charAt(i + 3));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 !== 64 && enc3 !== -1) {
      output += String.fromCharCode(chr2);
    }
    if (enc4 !== 64 && enc4 !== -1) {
      output += String.fromCharCode(chr3);
    }
  }

  return output;
};

export const parseUploadedFile = async (
  fileName: string,
  fileContent: string | ArrayBuffer
): Promise<ParsedFileResult> => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

  if (extension === 'epub') {
    return await parseEpubFile(baseName, fileContent, randomColor);
  } else if (extension === 'pdf') {
    return await parsePdfFile(baseName, fileContent, randomColor);
  } else if (extension === 'md') {
    return parseTxtOrMdFile(baseName, typeof fileContent === 'string' ? fileContent : new TextDecoder().decode(fileContent), 'MD', randomColor);
  } else {
    // Default TXT
    const textStr = typeof fileContent === 'string' ? fileContent : new TextDecoder().decode(fileContent);
    return parseTxtOrMdFile(baseName, textStr, 'TXT', randomColor);
  }
};

const parseTxtOrMdFile = (
  title: string,
  content: string,
  format: BookFormat,
  coverColor: string
): ParsedFileResult => {
  const cleanContent = content.trim();
  const rawChapters = cleanContent.split(/(?=\n#{1,3}\s|\nCapítulo\s|\nChapter\s|\nPart\s|\nParte\s)/i);

  const chapters: Chapter[] = rawChapters
    .map((chunk, index) => {
      const lines = chunk.trim().split('\n');
      let chapterTitle = `Capítulo ${index + 1}`;
      let bodyText = chunk.trim();

      if (lines[0] && (lines[0].startsWith('#') || lines[0].toLowerCase().includes('capítulo') || lines[0].toLowerCase().includes('chapter'))) {
        chapterTitle = lines[0].replace(/^#{1,3}\s*/, '').trim();
        bodyText = lines.slice(1).join('\n').trim();
      }

      return {
        id: `parsed-ch-${index + 1}`,
        title: chapterTitle || `Parte ${index + 1}`,
        content: bodyText || chunk.trim()
      };
    })
    .filter(ch => ch.content.length > 0);

  if (chapters.length === 0) {
    chapters.push({
      id: 'parsed-ch-1',
      title: title,
      content: cleanContent || 'Conteúdo do arquivo importado.'
    });
  }

  return {
    title: title,
    author: 'Autor Desconhecido',
    format,
    chapters,
    coverColor
  };
};

// Robust PDF Text Extractor - Filters out PDF binary syntax & streams
const parsePdfFile = async (
  title: string,
  fileContent: string | ArrayBuffer,
  coverColor: string
): Promise<ParsedFileResult> => {
  const extractedText = extractTextFromPdfBinary(fileContent);
  return parseTxtOrMdFile(title, extractedText, 'PDF', coverColor);
};

const extractTextFromPdfBinary = (fileContent: string | ArrayBuffer): string => {
  let pdfString = '';
  
  if (typeof fileContent === 'string') {
    pdfString = fileContent;
  } else {
    const bytes = new Uint8Array(fileContent);
    let str = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      str += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    pdfString = str;
  }

  const extractedChunks: string[] = [];

  // Extract PDF text literals: (Text string) Tj or (Text string) TJ
  const textMatches = pdfString.match(/\(([^()]{2,})\)\s*(?:Tj|TJ|'|")/g);
  if (textMatches && textMatches.length > 0) {
    textMatches.forEach(m => {
      const clean = m
        .replace(/^\(/, '')
        .replace(/\)\s*(?:Tj|TJ|'|")$/, '')
        .replace(/\\([()\\])/g, '$1')
        .trim();

      if (
        clean.length > 1 &&
        !clean.startsWith('/') &&
        !clean.startsWith('%') &&
        !clean.includes('Helvetica') &&
        !clean.includes('ReportLab')
      ) {
        extractedChunks.push(clean);
      }
    });
  }

  // Extract text inside stream blocks
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;
  while ((match = streamRegex.exec(pdfString)) !== null) {
    const streamContent = match[1];
    const innerText = streamContent.match(/\(([^()]{2,})\)/g);
    if (innerText) {
      innerText.forEach(t => {
        const clean = t.slice(1, -1).replace(/\\([()\\])/g, '$1').trim();
        if (
          clean.length > 2 &&
          !/^\/[A-Z0-9]/i.test(clean) &&
          !clean.includes('Font') &&
          !clean.includes('MediaBox') &&
          !clean.includes('ReportLab')
        ) {
          extractedChunks.push(clean);
        }
      });
    }
  }

  // Fallback: If no PDF text objects found, clean raw lines filtering PDF syntax noise
  if (extractedChunks.length < 3) {
    const rawLines = pdfString.split(/[\r\n]+/);
    rawLines.forEach(line => {
      if (
        line.startsWith('%') ||
        line.includes('obj') ||
        line.includes('endobj') ||
        line.includes('stream') ||
        line.includes('endstream') ||
        line.includes('/MediaBox') ||
        line.includes('/Resources') ||
        line.includes('/Font') ||
        line.includes('/Type') ||
        line.includes('/Catalog') ||
        line.includes('/ProcSet') ||
        line.includes('/BaseFont') ||
        line.includes('/Encoding') ||
        line.includes('<<') ||
        line.includes('>>') ||
        line.includes('xref') ||
        line.includes('trailer')
      ) {
        return;
      }
      const cleanLine = line
        .replace(/[^a-zA-Z0-9áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ\s.,!?:;\-–—"'()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanLine.length > 15) {
        extractedChunks.push(cleanLine);
      }
    });
  }

  const fullText = extractedChunks.join('\n\n');
  return fullText.trim() || 'Este PDF contém páginas digitalizadas como imagens. Para melhor experiência de leitura, use um PDF com texto pesquisável.';
};

const parseEpubFile = async (
  title: string,
  fileContent: string | ArrayBuffer,
  coverColor: string
): Promise<ParsedFileResult> => {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(fileContent);
    
    let bookTitle = title;
    let bookAuthor = 'Autor EPUB';
    const chapters: Chapter[] = [];

    const htmlFiles = Object.keys(loadedZip.files).filter(
      filename => filename.endsWith('.xhtml') || filename.endsWith('.html') || filename.endsWith('.htm')
    );

    let chapterIndex = 1;
    for (const filename of htmlFiles) {
      const file = loadedZip.files[filename];
      if (!file.dir) {
        const rawHtml = await file.async('string');
        const cleanText = stripHtmlTags(rawHtml);

        if (cleanText.length > 50) {
          const titleMatch = rawHtml.match(/<h[1-2][^>]*>(.*?)<\/h[1-2]>/i) || rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
          const chTitle = titleMatch ? stripHtmlTags(titleMatch[1]).trim() : `Capítulo ${chapterIndex}`;

          chapters.push({
            id: `epub-ch-${chapterIndex}`,
            title: chTitle || `Seção ${chapterIndex}`,
            content: cleanText
          });
          chapterIndex++;
        }
      }
    }

    if (chapters.length === 0) {
      chapters.push({
        id: 'epub-ch-1',
        title: 'Início',
        content: 'Conteúdo lido do arquivo EPUB.'
      });
    }

    return {
      title: bookTitle,
      author: bookAuthor,
      format: 'EPUB',
      chapters,
      coverColor
    };
  } catch (err) {
    console.error('EPUB zip parse fallback:', err);
    const textStr = typeof fileContent === 'string' ? fileContent : new TextDecoder().decode(fileContent);
    return parseTxtOrMdFile(title, textStr, 'EPUB', coverColor);
  }
};

const stripHtmlTags = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};
