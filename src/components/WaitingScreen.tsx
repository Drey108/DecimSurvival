const WaitingScreen = () => {
  return (
    <div className="text-center">
      <div className="bg-card border border-border p-6 rounded">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">Analyzing Strategies...</h2>
        <p className="text-muted-foreground mb-4">
          The AI is processing all player strategies and determining outcomes.
        </p>
        <div className="text-muted-foreground">
          This may take a few seconds...
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;