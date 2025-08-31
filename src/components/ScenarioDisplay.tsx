interface ScenarioDisplayProps {
  scenario: string;
  roundNumber: number;
  timerComponent?: React.ReactNode;
}

const ScenarioDisplay = ({ scenario, roundNumber, timerComponent }: ScenarioDisplayProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-foreground">
          Round {roundNumber} of 3
        </h2>
        {timerComponent}
      </div>
      <div className="bg-card border border-border p-4 rounded">
        <h3 className="font-semibold mb-2 text-card-foreground">Survival Scenario:</h3>
        <p className="text-card-foreground">{scenario}</p>
      </div>
    </div>
  );
};

export default ScenarioDisplay;