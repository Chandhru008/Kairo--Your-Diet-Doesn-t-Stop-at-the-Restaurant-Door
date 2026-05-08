// Groq API — Image-based menu parsing using Llama-4-Scout (vision model)
import { ParsedDish } from '../types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function parseMenuImage(imageBase64: string): Promise<ParsedDish[]> {
  const payload = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a menu parser. Look at this restaurant menu image and extract every dish name and its description. Ignore prices, section headers, and non-food text. Return ONLY a valid JSON array with no markdown formatting, no code fences: [{"name": "dish name", "description": "brief description"}]. If you cannot read the menu clearly, do your best to extract what you can.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    temperature: 0.1,
  };

  // Retry up to 3 times with delay for rate limits
  let lastError = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await delay(4000 * attempt);
      }

      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        lastError = 'Rate limit reached. Retrying...';
        console.log(`Groq rate limited, retry ${attempt + 1}/3...`);
        continue;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${response.status}`;
        lastError = errMsg;
        console.error('Groq API error:', errMsg);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '[]';

      // Clean markdown code fences if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsed: ParsedDish[] = JSON.parse(cleaned);
      return parsed.filter((d: any) => d.name && typeof d.name === 'string');
    } catch (error: any) {
      lastError = error.message || 'Unknown error';
      console.error(`Attempt ${attempt + 1} failed:`, lastError);
    }
  }

  throw new Error(`Menu scan failed after 3 attempts: ${lastError}`);
}
