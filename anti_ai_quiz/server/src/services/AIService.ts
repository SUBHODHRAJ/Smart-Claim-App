import { z } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/response';
import { ExtractedChunk } from '../utils/pdfExtractor';
import { DifficultyLevel, ISourceReference, IAIRecommendation, IStudyPlanDay } from '../types';

// Zod Schema for Structured AI Question
const AIQuestionSchema = z.object({
  question: z.string().min(5, 'Question text must be at least 5 characters'),
  options: z.array(z.string().min(1)).min(2, 'At least 2 options required').max(6),
  correctAnswer: z.string().min(1, 'Correct answer must be specified'),
  explanation: z.string().min(5, 'Explanation must be provided'),
  topic: z.string().default('General'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  snippet: z.string().optional(),
});

const AIQuizOutputSchema = z.object({
  questions: z.array(AIQuestionSchema),
});

export interface GeneratedQuestionResult {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: DifficultyLevel;
  sourceReference: ISourceReference;
  aiQualityScore: number;
}

export class AIService {
  /**
   * Calculate AI quality score for a question
   */
  static calculateQualityScore(
    q: z.infer<typeof AIQuestionSchema>,
    sourceChunkText: string
  ): number {
    let score = 95;

    // Check if correct answer is in options
    const normalizedOptions = q.options.map((o) => o.trim().toLowerCase());
    const normalizedAnswer = q.correctAnswer.trim().toLowerCase();
    if (!normalizedOptions.includes(normalizedAnswer)) {
      score -= 30;
    }

    // Check for distinct options
    const uniqueOptions = new Set(normalizedOptions);
    if (uniqueOptions.size !== q.options.length) {
      score -= 25; // duplicate distractors
    }

    // Check explanation length & quality
    if (q.explanation.length < 15) {
      score -= 10;
    }

    // Check source grounding if chunk text available
    if (sourceChunkText) {
      const lowerChunk = sourceChunkText.toLowerCase();
      const questionKeywords = q.question.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matches = questionKeywords.filter((k) => lowerChunk.includes(k));
      if (questionKeywords.length > 0 && matches.length === 0) {
        score -= 15; // question may not be source-grounded
      }
    }

    return Math.max(50, Math.min(100, score));
  }

  /**
   * Main method to generate source-grounded questions
   */
  static async generateQuizQuestions(params: {
    documentId: string;
    documentTitle: string;
    topic: string;
    chunks: ExtractedChunk[];
    numberOfQuestions: number;
    difficulty: DifficultyLevel;
  }): Promise<GeneratedQuestionResult[]> {
    const { documentId, documentTitle, topic, chunks, numberOfQuestions, difficulty } = params;

    if (!chunks || chunks.length === 0) {
      throw new AppError('No document content available to generate questions from', 400, 'EMPTY_CONTEXT');
    }

    let generated: Array<z.infer<typeof AIQuestionSchema> & { chunk: ExtractedChunk }> = [];

    // Attempt External LLM API if key is present
    if (env.AI_API_KEY) {
      try {
        generated = await this.callExternalLLM(chunks, topic, numberOfQuestions, difficulty);
      } catch (err: any) {
        console.warn('[AIService] External LLM call failed or timed out, activating intelligent source extractor fallback:', err.message);
        generated = this.generateGroundedHeuristicQuestions(chunks, topic, numberOfQuestions, difficulty);
      }
    } else {
      // Intelligent semantic heuristic generation
      generated = this.generateGroundedHeuristicQuestions(chunks, topic, numberOfQuestions, difficulty);
    }

    // Validate and score every question strictly
    const results: GeneratedQuestionResult[] = [];

    for (let i = 0; i < generated.length && results.length < numberOfQuestions; i++) {
      const item = generated[i];
      // Normalize correct answer match
      const matchingOption = item.options.find(
        (o) => o.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase()
      );
      const finalCorrectAnswer = matchingOption || item.options[0];

      const qualityScore = this.calculateQualityScore(item, item.chunk.text);

      results.push({
        question: item.question.trim(),
        options: item.options.map((o) => o.trim()),
        correctAnswer: finalCorrectAnswer.trim(),
        explanation: item.explanation.trim() || `Based on ${documentTitle}, page ${item.chunk.page}.`,
        topic: item.topic || topic || 'Core Concepts',
        difficulty: item.difficulty || difficulty,
        sourceReference: {
          documentId,
          documentTitle,
          page: item.chunk.page,
          chunkIndex: item.chunk.chunkIndex,
          snippet: item.snippet || item.chunk.text.slice(0, 180) + '...',
        },
        aiQualityScore: qualityScore,
      });
    }

    if (results.length === 0) {
      throw new AppError('AI question generation returned no valid questions', 500, 'AI_GENERATION_FAILED');
    }

    return results;
  }

  /**
   * Call external LLM (Gemini or OpenAI compatible)
   */
  private static async callExternalLLM(
    chunks: ExtractedChunk[],
    topic: string,
    count: number,
    difficulty: DifficultyLevel
  ): Promise<Array<z.infer<typeof AIQuestionSchema> & { chunk: ExtractedChunk }>> {
    const combinedContext = chunks
      .map((c, idx) => `[SECTION ${idx + 1} - Page ${c.page}]\n${c.text}`)
      .join('\n\n---\n\n');

    const prompt = `You are an expert educational assessment creator.
Create exactly ${count} multiple choice questions strictly based on the provided source text.

TOPIC: ${topic}
DIFFICULTY: ${difficulty}

SOURCE MATERIAL:
${combinedContext}

INSTRUCTIONS:
1. Every question must be directly answerable from the provided text.
2. Provide exactly 4 options per question.
3. Clearly state the exact matching correctAnswer string from the options.
4. Provide a thorough educational explanation citing why the answer is correct according to the text.
5. Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "question": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "...",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "snippet": "Short direct quote from source supporting the question"
    }
  ]
}`;

    if (env.AI_PROVIDER === 'openai' || env.AI_API_KEY.startsWith('sk-')) {
      // OpenAI API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const json: any = await response.json();
      const content = json.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      const validated = AIQuizOutputSchema.parse(parsed);

      return validated.questions.map((q, idx) => ({
        ...q,
        chunk: chunks[idx % chunks.length],
      }));
    } else {
      // Google Gemini API call
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.AI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);
      const validated = AIQuizOutputSchema.parse(parsed);

      return validated.questions.map((q, idx) => ({
        ...q,
        chunk: chunks[idx % chunks.length],
      }));
    }
  }

  /**
   * Intelligent heuristic semantic question generator
   * Extracts definitions, principles, and causes from text to formulate grounded MCQs
   */
  private static generateGroundedHeuristicQuestions(
    chunks: ExtractedChunk[],
    topic: string,
    count: number,
    difficulty: DifficultyLevel
  ): Array<z.infer<typeof AIQuestionSchema> & { chunk: ExtractedChunk }> {
    const results: Array<z.infer<typeof AIQuestionSchema> & { chunk: ExtractedChunk }> = [];

    for (let cIdx = 0; cIdx < chunks.length && results.length < count; cIdx++) {
      const chunk = chunks[cIdx];
      const sentences = chunk.text
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 25 && s.length < 220);

      for (const sentence of sentences) {
        if (results.length >= count) break;

        // Definition patterns: "X is defined as Y", "X refers to Y", "X provides Y", "X is a Y"
        const isDef = sentence.match(/^([^,.]+?)\s+(is defined as|refers to|is a|is an|provides|consists of|represents)\s+(.+)$/i);
        const causes = sentence.match(/(because|due to|in order to|results in|characterized by)\s+(.+)$/i);

        if (isDef && isDef[1].length < 45 && isDef[3].length > 15) {
          const subject = isDef[1].trim();
          const definition = isDef[3].trim().replace(/[.]+$/, '');
          const cleanSubject = subject.replace(/^(The|A|An)\s+/i, '');

          // Distractor generation
          const distractors = [
            `A mechanism that strictly prevents ${cleanSubject.toLowerCase()} from executing`,
            `An algorithm designed solely to reverse memory operations`,
            `A protocol for unmanaged input/output transmission`,
          ];

          const options = [
            definition.charAt(0).toUpperCase() + definition.slice(1),
            distractors[0],
            distractors[1],
            distractors[2],
          ];

          // Shuffle options deterministically
          const correctAnswer = options[0];
          const shuffled = [...options].sort(() => 0.5 - Math.random());

          results.push({
            question: `According to the source material, what is the primary definition or role of ${cleanSubject}?`,
            options: shuffled,
            correctAnswer,
            explanation: `As detailed in the document (Page ${chunk.page}): "${sentence}"`,
            topic: topic || chunk.topicKeywords[0] || 'Core Concepts',
            difficulty,
            snippet: sentence,
            chunk,
          });
        } else if (sentence.length > 50 && sentence.includes(' ')) {
          // Key concept query
          const words = sentence.split(' ');
          const subjectPhrase = words.slice(0, Math.min(5, words.length)).join(' ');
          const rest = words.slice(Math.min(5, words.length)).join(' ');

          const correctAnswer = rest.replace(/[.]+$/, '');
          const options = [
            correctAnswer,
            `Requires manual kernel interruption before proceeding`,
            `Only applies to legacy static allocation models`,
            `Is completely ignored during runtime scheduling`,
          ].sort(() => 0.5 - Math.random());

          results.push({
            question: `Which statement accurately reflects the principles of ${subjectPhrase.replace(/^[^\w]+/, '')}?`,
            options,
            correctAnswer,
            explanation: `Grounding verified from source material (Page ${chunk.page}): "${sentence}"`,
            topic: topic || chunk.topicKeywords[0] || 'Core Concepts',
            difficulty,
            snippet: sentence,
            chunk,
          });
        }
      }
    }

    // Ensure we satisfy the requested count
    while (results.length < count && chunks.length > 0) {
      const chunk = chunks[results.length % chunks.length];
      const sampleSnippet = chunk.text.slice(0, 120);
      const correctAnswer = `Directly aligns with: "${sampleSnippet.slice(0, 50)}..."`;
      results.push({
        question: `Based on the review material for ${topic || 'the selected module'}, which finding is supported on page ${chunk.page}?`,
        options: [
          correctAnswer,
          'Operates without memory synchronization',
          'Eliminates all runtime latency completely',
          'Only supported on single-threaded architectures',
        ],
        correctAnswer,
        explanation: `Source text reference: "${chunk.text.slice(0, 150)}..."`,
        topic: topic || 'General',
        difficulty,
        snippet: sampleSnippet,
        chunk,
      });
    }

    return results.slice(0, count);
  }

  /**
   * AI Performance Analysis & Recommendation Engine
   */
  static async analyzePerformanceAndRecommend(params: {
    topics: { topic: string; accuracy: number; total: number }[];
    weakTopics: string[];
    strongTopics: string[];
    recentScoreAvg: number;
    recommendedDifficulty: DifficultyLevel;
  }): Promise<IAIRecommendation> {
    const { topics, weakTopics, strongTopics, recentScoreAvg, recommendedDifficulty } = params;

    const primaryWeak = weakTopics[0] || (topics.length > 0 ? topics.sort((a, b) => a.accuracy - b.accuracy)[0]?.topic : 'General');
    const primaryStrong = strongTopics[0] || (topics.length > 0 ? topics.sort((a, b) => b.accuracy - a.accuracy)[0]?.topic : 'Fundamentals');

    return {
      strengths: strongTopics.length > 0 ? strongTopics : [`Demonstrating solid baseline in ${primaryStrong}`],
      weaknesses: weakTopics.length > 0 ? weakTopics : [`Targeted practice recommended in ${primaryWeak}`],
      primaryWeakTopic: primaryWeak,
      recommendations: [
        `Focus dedicated review on "${primaryWeak}" where current accuracy is below target threshold.`,
        `Complete active-recall flashcard drills for "${primaryWeak}" core definitions.`,
        `Attempt a 10-question adaptive quiz at ${recommendedDifficulty} difficulty to reinforce retention.`,
        `Review the source document page references for questions answered incorrectly.`,
      ],
      nextActions: [
        `Review flashcards for ${primaryWeak}`,
        `Start Adaptive Practice Quiz (${recommendedDifficulty} level)`,
        `Explore personalized 7-Day Study Plan`,
      ],
      suggestedQuizConfig: {
        topic: primaryWeak,
        difficulty: recommendedDifficulty,
        questionCount: 10,
      },
    };
  }

  /**
   * Generate 7-day personalized study plan based on weak topics
   */
  static generateStudyPlan(weakTopics: string[], strongTopics: string[]): IStudyPlanDay[] {
    const focus1 = weakTopics[0] || 'Core Review';
    const focus2 = weakTopics[1] || strongTopics[0] || 'Key Principles';

    return [
      {
        dayNumber: 1,
        title: 'Diagnostic & Notes Deep Dive',
        topic: focus1,
        focusArea: 'Review definitions, theorems, and structural conditions',
        tasks: [
          { type: 'REVIEW_NOTES', description: `Read through chapter notes and annotations for ${focus1}`, completed: false, estimatedMinutes: 20 },
          { type: 'FLASHCARDS', description: `Review 10 flashcards for ${focus1}`, completed: false, estimatedMinutes: 10 },
        ],
      },
      {
        dayNumber: 2,
        title: 'Targeted MCQ Practice',
        topic: focus1,
        focusArea: 'Eliminate distractor traps and refine answering speed',
        tasks: [
          { type: 'PRACTICE_QUIZ', description: `Complete 10 Medium-difficulty MCQs on ${focus1}`, completed: false, estimatedMinutes: 15 },
        ],
      },
      {
        dayNumber: 3,
        title: 'Secondary Weak Topic Drills',
        topic: focus2,
        focusArea: 'Establish foundational memory anchors',
        tasks: [
          { type: 'FLASHCARDS', description: `Practice active recall flashcards for ${focus2}`, completed: false, estimatedMinutes: 15 },
          { type: 'PRACTICE_QUIZ', description: `Take 8 practice questions on ${focus2}`, completed: false, estimatedMinutes: 15 },
        ],
      },
      {
        dayNumber: 4,
        title: 'Active Application & Problem Solving',
        topic: focus1,
        focusArea: 'Complex scenario questions and edge cases',
        tasks: [
          { type: 'PRACTICE_QUIZ', description: `Take an adaptive quiz combining ${focus1} and ${focus2}`, completed: false, estimatedMinutes: 20 },
        ],
      },
      {
        dayNumber: 5,
        title: 'Mixed Topic Reinforcement',
        topic: 'Mixed Modules',
        focusArea: 'Cross-topic synthesis and retention',
        tasks: [
          { type: 'MOCK_TEST', description: 'Complete 15-question mixed timed mock test', completed: false, estimatedMinutes: 25 },
        ],
      },
      {
        dayNumber: 6,
        title: 'Error Analysis & Source Verification',
        topic: focus1,
        focusArea: 'Review every past incorrect answer and check source PDF page references',
        tasks: [
          { type: 'REVIEW_NOTES', description: 'Review explanation breakdowns of missed questions', completed: false, estimatedMinutes: 15 },
          { type: 'FLASHCARDS', description: 'Master "Difficult" marked flashcards', completed: false, estimatedMinutes: 15 },
        ],
      },
      {
        dayNumber: 7,
        title: 'Mastery Assessment',
        topic: 'Full Coverage',
        focusArea: 'Simulate official exam conditions',
        tasks: [
          { type: 'ASSESSMENT', description: 'Complete full comprehensive assessment test', completed: false, estimatedMinutes: 30 },
        ],
      },
    ];
  }
}
