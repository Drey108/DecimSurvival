import { useState } from 'react';

interface APIKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void;
  isVisible: boolean;
}

const APIKeyModal = ({ onApiKeySubmit, isVisible }: APIKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    
    if (apiKey.length < 10) {
      setError('API key seems too short');
      return;
    }
    
    setError('');
    onApiKeySubmit(apiKey.trim());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded border border-border max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">Enter Groq API Key</h2>
        <p className="text-muted-foreground mb-4">
          You need a Groq API key to play Decim. Get one at console.groq.com
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full p-2 border border-border rounded bg-input text-foreground mb-2"
            autoFocus
          />
          
          {error && (
            <p className="text-destructive text-sm mb-2">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground p-2 rounded hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default APIKeyModal;