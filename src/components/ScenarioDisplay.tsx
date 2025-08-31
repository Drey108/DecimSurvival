interface ScenarioDisplayProps {
  scenario: string;
  roundNumber: number;
  timerComponent?: React.ReactNode;
}

const ScenarioDisplay = ({ scenario, roundNumber, timerComponent }: ScenarioDisplayProps) => {
  return (
    <div className="scenario-section mb-8">
      <div className="scenario-header flex justify-between items-center mb-4">
        <h2 className="round-title text-2xl font-bold text-primary">
          Round {roundNumber} of 3
        </h2>
        {timerComponent}
      </div>
      <div className="scenario-card bg-card border border-border p-6 rounded-lg">
        <h3 className="scenario-title font-semibold mb-3 text-primary">Survival Scenario</h3>
        <p className="scenario-text text-card-foreground text-lg leading-relaxed">{scenario}</p>
      </div>
    </div>
  );
};

export default ScenarioDisplay;