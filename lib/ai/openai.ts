import { OpenAI } from 'openai';

// Initialize OpenAI client (lazy initialization)
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

export interface AIHint {
  hint: string;
  concepts: string[];
  relatedTopics: string[];
}

/**
 * Generate AI hint for a question
 */
export async function generateHint(
  question: string,
  subject: string,
  gradeLevel: string
): Promise<AIHint> {
  try {
    const openai = getOpenAI();

    const prompt = `당신은 학생들을 돕는 AI 튜터입니다.

과목: ${subject}
학년: ${gradeLevel}
질문: ${question}

학생이 이 질문에 대해 스스로 생각해볼 수 있도록 직접적인 답변이 아닌 힌트를 제공해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "hint": "학생이 문제를 해결할 수 있도록 돕는 힌트 (한글)",
  "concepts": ["이 문제와 관련된 핵심 개념들"],
  "relatedTopics": ["공부하면 도움될 관련 주제들"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 학생들의 학습을 돕는 친절한 AI 튜터입니다. 직접 답을 주지 않고 생각할 수 있도록 힌트를 제공합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return result as AIHint;
  } catch (error) {
    console.error('Error generating AI hint:', error);
    throw error;
  }
}

/**
 * Evaluate answer quality
 */
export async function evaluateAnswer(
  question: string,
  answer: string,
  subject: string
): Promise<{ score: number; feedback: string }> {
  try {
    const openai = getOpenAI();

    const prompt = `당신은 답변 품질을 평가하는 AI입니다.

과목: ${subject}
질문: ${question}
답변: ${answer}

이 답변의 품질을 평가하고 피드백을 제공해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "score": 0-100 사이의 점수,
  "feedback": "답변에 대한 건설적인 피드백 (한글)"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 교육 전문가로서 답변의 정확성, 명확성, 도움이 되는 정도를 평가합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return result as { score: number; feedback: string };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
}

/**
 * Generate question embeddings for similarity search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const openai = getOpenAI();

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Find similar questions based on embeddings
 * Note: This requires storing embeddings in the database
 */
export async function findSimilarQuestions(
  questionText: string,
  limit: number = 5
): Promise<string[]> {
  try {
    // Generate embedding for the input question
    const embedding = await generateEmbedding(questionText);

    // In a real implementation, you would:
    // 1. Store embeddings in a vector database (e.g., pgvector)
    // 2. Query for similar vectors using cosine similarity
    // For now, return empty array as placeholder

    // TODO: Implement vector similarity search in database
    return [];
  } catch (error) {
    console.error('Error finding similar questions:', error);
    return [];
  }
}
