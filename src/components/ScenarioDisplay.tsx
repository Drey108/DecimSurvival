interface ScenarioDisplayProps {
  scenario: string;
  roundNumber: number;
  timerComponent?: React.ReactNode;
}

const ScenarioDisplay = ({ scenario, roundNumber, timerComponent }: ScenarioDisplayProps) => {
  const getScenarioEmoji = (scenario: string) => {
    if (scenario.includes('zombie')) return '🧟‍♂️';
    if (scenario.includes('island') || scenario.includes('plane')) return '🏝️';
    if (scenario.includes('nuclear') || scenario.includes('fallout')) return '☢️';
    if (scenario.includes('blizzard') || scenario.includes('car')) return '❄️';
    if (scenario.includes('fire') || scenario.includes('building')) return '🔥';
    return '⚠️';
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="glass-card px-4 py-2 rounded-xl">
            <span className="font-orbitron font-bold text-primary">
              Round {roundNumber} of 3
            </span>
          </div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
        {timerComponent}
      </div>
      
      <div className="glass-card p-8 rounded-3xl border border-destructive/20 bg-destructive/5">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <span className="text-4xl">{getScenarioEmoji(scenario)}</span>
          </div>
          <h3 className="text-2xl font-orbitron font-bold text-destructive mb-2">
            SURVIVAL SCENARIO
          </h3>
          <div className="w-16 h-1 bg-destructive rounded-full mx-auto"></div>
        </div>
        
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
          <p className="text-lg text-foreground leading-relaxed font-medium">
            {scenario}
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ⚡ <span className="font-semibold">Quick thinking</span> and 
            <span className="font-semibold"> smart decisions</span> will determine your fate
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScenarioDisplay;