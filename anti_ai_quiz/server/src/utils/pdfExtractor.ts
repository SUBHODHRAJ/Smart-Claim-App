import pdfParse from 'pdf-parse';

export interface ExtractedChunk {
  chunkIndex: number;
  text: string;
  page: number;
  wordCount: number;
  topicKeywords: string[];
}

export interface ExtractedDocumentData {
  text: string;
  totalPages: number;
  chunks: ExtractedChunk[];
  topics: string[];
}

/**
 * Clean raw text from PDF/TXT
 */
export const cleanText = (raw: string): string => {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Extract topic keywords and headings
 */
export const detectTopics = (text: string): string[] => {
  const commonStopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were',
    'which', 'their', 'about', 'would', 'there', 'these', 'could', 'other'
  ]);

  // Find headings, capital words, bullet lines
  const lines = text.split('\n');
  const candidateTopics = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    // Headings often short (3-40 chars), start with capital or number
    if (trimmed.length >= 3 && trimmed.length <= 40 && /^[A-Z0-9#]/.test(trimmed)) {
      const cleanHeading = trimmed.replace(/^[\d.#\s-]+/, '').trim();
      if (cleanHeading.length >= 3 && !/^(page|chapter|section|figure|table)\s*\d+$/i.test(cleanHeading)) {
        candidateTopics.add(cleanHeading);
      }
    }
  }

  // If few headings detected, fallback to high frequency key phrases
  if (candidateTopics.size < 3) {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const counts: Record<string, number> = {};
    for (const w of words) {
      if (!commonStopWords.has(w)) {
        counts[w] = (counts[w] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    sorted.forEach((t) => candidateTopics.add(t));
  }

  return Array.from(candidateTopics).slice(0, 15);
};

/**
 * Split text into semantic chunks with page estimations
 */
export const splitIntoChunks = (
  fullText: string,
  totalPages = 1,
  chunkSize = 1200,
  overlap = 200
): ExtractedChunk[] => {
  const chunks: ExtractedChunk[] = [];
  const words = fullText.split(/\s+/);
  const totalWords = words.length;

  if (totalWords === 0) return [];

  const wordsPerChunk = Math.floor(chunkSize / 6); // roughly 200 words
  const wordsOverlap = Math.floor(overlap / 6);

  let chunkIndex = 0;
  let cursor = 0;

  while (cursor < totalWords) {
    const chunkWords = words.slice(cursor, cursor + wordsPerChunk);
    const chunkText = chunkWords.join(' ');

    // Estimate page based on word progress
    const progressRatio = (cursor + chunkWords.length / 2) / Math.max(1, totalWords);
    const estimatedPage = Math.min(totalPages, Math.max(1, Math.ceil(progressRatio * totalPages)));

    const keywords = detectTopics(chunkText).slice(0, 5);

    chunks.push({
      chunkIndex,
      text: chunkText,
      page: estimatedPage,
      wordCount: chunkWords.length,
      topicKeywords: keywords,
    });

    chunkIndex++;
    cursor += wordsPerChunk - wordsOverlap;
    if (cursor + wordsOverlap >= totalWords) break;
  }

  return chunks;
};

/**
 * Parse PDF Buffer or Plain Text
 */
export const extractDocumentText = async (
  buffer: Buffer,
  mimeType: string,
  originalFilename: string
): Promise<ExtractedDocumentData> => {
  let rawText = '';
  let totalPages = 1;

  if (mimeType === 'application/pdf' || originalFilename.toLowerCase().endsWith('.pdf')) {
    const pdfData = await pdfParse(buffer);
    rawText = pdfData.text;
    totalPages = pdfData.numpages || 1;
  } else {
    // Plain text or UTF-8 content
    rawText = buffer.toString('utf-8');
  }

  const cleaned = cleanText(rawText);
  if (!cleaned || cleaned.length < 20) {
    throw new Error('Extracted text is empty or too short. Please upload a valid readable document.');
  }

  const topics = detectTopics(cleaned);
  const chunks = splitIntoChunks(cleaned, totalPages);

  return {
    text: cleaned,
    totalPages,
    chunks,
    topics,
  };
};
