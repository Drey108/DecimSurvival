interface ResultDisplayProps {
  narrative: string;
  survived: boolean;
  onContinue: () => void;
  roundNumber: number;
}

const ResultDisplay = ({ narrative, survived, onContinue, roundNumber }: ResultDisplayProps) => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        Round {roundNumber} Result
      </h2>
      
      <div className="bg-card border border-border p-6 rounded mb-4">
        <p className="text-card-foreground mb-4">{narrative}</p>
        
        <div className={`text-2xl font-bold ${survived ? 'text-success' : 'text-destructive'}`}>
          {survived ? 'YOU SURVIVED!' : 'YOU DIED!'}
        </div>
      </div>
      
      <button
        onClick={onContinue}
        className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90"
      >
        {roundNumber === 3 ? 'View Final Score' : 'Next Round'}
      </button>
    </div>
  );
};

export default ResultDisplay;