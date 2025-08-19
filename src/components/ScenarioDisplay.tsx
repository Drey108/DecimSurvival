interface ScenarioDisplayProps {
  scenario: string;
  roundNumber: number;
}

const ScenarioDisplay = ({ scenario, roundNumber }: ScenarioDisplayProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-foreground">
        Round {roundNumber} of 3
      </h2>
      <div className="bg-card border border-border p-4 rounded">
        <h3 className="font-semibold mb-2 text-card-foreground">Survival Scenario:</h3>
        <p className="text-card-foreground">{scenario}</p>
      </div>
    </div>
  );
};

export default ScenarioDisplay;