import JSZip from 'jszip';
import { Platform } from 'react-native';
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

const decodeBase64Polyfill = (input: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';
  for (
    let bc = 0, bs = 0, buffer: number, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
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
    return parsePdfOrTxtFile(baseName, fileContent, 'PDF', randomColor);
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

const parsePdfOrTxtFile = (
  title: string,
  fileContent: string | ArrayBuffer,
  format: BookFormat,
  coverColor: string
): ParsedFileResult => {
  let textStr = '';
  if (typeof fileContent === 'string') {
    textStr = fileContent;
  } else {
    try {
      textStr = new TextDecoder('utf-8').decode(fileContent);
    } catch {
      textStr = 'Conteúdo extraído do PDF.';
    }
  }

  return parseTxtOrMdFile(title, textStr, format, coverColor);
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

    // Search HTML/XHTML content files inside the EPUB zip
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
          // Extract chapter title from h1, h2, title or first line
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
