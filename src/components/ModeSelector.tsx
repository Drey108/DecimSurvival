import { Button } from '@/components/ui/button';

interface ModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
}

const ModeSelector = ({ onSelectMode }: ModeSelectorProps) => {
  return (
    <div className="text-center">
      <div className="bg-card border border-border p-6 rounded mb-4">
        <h2 className="text-xl font-bold mb-6 text-card-foreground">Choose Game Mode</h2>
        <div className="space-y-4">
          <Button
            onClick={() => onSelectMode('single')}
            className="w-full"
            variant="default"
          >
            Single Player
          </Button>
          <Button
            onClick={() => onSelectMode('multiplayer')}
            className="w-full"
            variant="outline"
          >
            Multiplayer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;