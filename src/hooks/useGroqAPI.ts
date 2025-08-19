import { useState } from 'react';

interface GroqResponse {
  narrative: string;
  survived: boolean;
}

export const useGroqAPI = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeStrategy = async (scenario: string, strategy: string): Promise<GroqResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are analyzing survival strategies. Respond with a dramatic 2-3 sentence narrative about what happens, then end with either "SURVIVES" or "DIES" on a new line. Be realistic about survival chances.'
            },
            {
              role: 'user',
              content: `Scenario: ${scenario}\n\nStrategy: ${strategy}\n\nAnalyze this survival strategy and determine the outcome.`
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Parse the response to extract narrative and survival outcome
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1].toUpperCase();
      const survived = lastLine.includes('SURVIVES');
      
      // Remove the SURVIVES/DIES line from narrative
      const narrative = lines.slice(0, -1).join('\n').trim() || content;

      return {
        narrative,
        survived
      };
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