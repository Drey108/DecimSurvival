import { useState } from 'react';

interface GroqResponse {
  narrative: string;
  survived: boolean;
}

const fallbackNarrative = 'The strategy could not be turned into a complete survival report.';

const parseGroqResponse = (content: string): GroqResponse => {
  const trimmedContent = content.trim();

  try {
    const parsed = JSON.parse(trimmedContent) as { narrative?: unknown; survived?: unknown };
    if (typeof parsed.narrative === 'string' && parsed.narrative.trim()) {
      return {
        narrative: parsed.narrative.trim(),
        survived: parsed.survived === true
      };
    }
  } catch {
    // Fall back to parsing the plain-text format from older responses.
  }

  const lines = trimmedContent.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const verdictIndex = lines.findIndex(line => /\b(?:SURVIVES?|DIES)\b[.!]?$/i.test(line));
  const verdictLine = verdictIndex >= 0 ? lines[verdictIndex] : lines[lines.length - 1] || '';
  const survived = /\bSURVIVES?\b/i.test(verdictLine);
  const narrativeLines = verdictIndex >= 0 ? lines.filter((_, index) => index !== verdictIndex) : lines;
  const narrative = narrativeLines.join(' ').replace(/\s+/g, ' ').trim();

  return {
    narrative: narrative || fallbackNarrative,
    survived
  };
};

export const useGroqAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeStrategy = async (scenario: string, strategy: string): Promise<GroqResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error('VITE_GROQ_API_KEY is not configured. Add it to a .env.local file and restart the dev server.');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: 'You analyze survival strategies. Return only valid JSON with exactly two fields: "narrative" and "survived". The narrative must be 2-3 complete, dramatic sentences with no bullet points. The survived field must be a boolean. Be realistic about survival chances.'
            },
            {
              role: 'user',
              content: `Scenario: ${scenario}\n\nStrategy: ${strategy}\n\nAnalyze this survival strategy and determine the outcome.`
            }
          ],
          temperature: 0.4,
          max_completion_tokens: 600
        }),
      });

      if (!response.ok) {
        let apiMessage = response.statusText;
        try {
          const errorData = await response.json();
          apiMessage = errorData.error?.message || apiMessage;
        } catch {
          // Keep the HTTP status when the API does not return JSON.
        }
        throw new Error(`API Error: ${response.status} ${apiMessage}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return parseGroqResponse(content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeStrategy,
    isLoading,
    error
  };
};