export interface GameState {
  phase: 'lobby' | 'playing' | 'waiting' | 'results' | 'leaderboard' | 'finished';
  currentRound: number;
  scenario: string;
  timeLeft: number;
  currentResultIndex: number;
  hostApiKey: string;
}

export interface PlayerStrategy {
  playerId: string;
  playerName: string;
  strategy: string;
}

export interface PlayerResult {
  playerId: string;
  playerName: string;
  strategy: string;
  narrative: string;
  survived: boolean;
}

export interface PlayerScore {
  name: string;
  score: number;
}