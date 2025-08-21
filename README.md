# DECIM - Survival Game

A multiplayer survival strategy game where players face extreme scenarios and must devise strategies to survive. The AI analyzes each strategy and determines whether you live or die.

## 🎮 Game Features

- **Single Player Mode**: Face 3 random survival scenarios with AI-powered analysis
- **Multiplayer Mode**: Real-time multiplayer rooms where players compete simultaneously
- **AI Strategy Analysis**: Powered by Groq API for realistic survival outcome evaluation
- **Immersive Scenarios**: Zombie outbreaks, plane crashes, nuclear war, and more

## 🚀 Quick Start (Online)

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5ed0768c-332e-4f98-9c83-51eebb427199) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

## 💻 Local Development Setup

### Prerequisites

- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn package manager

### Installation Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install
# or
yarn install

# Step 4: Start the development server
npm run dev
# or
yarn dev
```

### Required Dependencies (package.json)

The project includes these main dependencies:

**Core React & Build Tools:**
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `vite` (dev dependency)
- `typescript` (dev dependency)

**UI Framework:**
- `@radix-ui/*` components (accordion, dialog, button, etc.)
- `tailwindcss` with `tailwindcss-animate`
- `lucide-react` for icons
- `class-variance-authority` for component variants

**State Management & Routing:**
- `@tanstack/react-query` ^5.83.0
- `react-router-dom` ^6.30.1

**Multiplayer Functionality:**
- `playroomkit` ^0.0.91 (critical for multiplayer features)

**Form Handling:**
- `react-hook-form` ^7.61.1
- `@hookform/resolvers` ^3.10.0
- `zod` ^3.25.76

**Utilities:**
- `clsx` ^2.1.1
- `tailwind-merge` ^2.6.0

### Environment Setup

You'll need to configure API access:

1. Get a Groq API key from [Groq Console](https://console.groq.com/)
2. The app will prompt you to enter your API key when starting a game
3. For multiplayer, only the host needs to provide the API key

## 🌐 Multiplayer Architecture

### Core Logic Overview

The multiplayer system is built on **PlayroomKit**, which provides real-time synchronization across players without requiring a backend server.

### Key Components

#### 1. Room Management (`playroomkit` Integration)

```typescript
// Room Creation
await insertCoin({
  roomCode: newRoomCode,
  skipLobby: true
});

// Player State Management
const me = myPlayer();
me.setState('profile', { name: playerName });
```

#### 2. Game State Synchronization

The game uses a shared state object synchronized across all players:

```typescript
const [multiplayerState, setMultiplayerState] = useMultiplayerState('game', {
  phase: 'lobby' | 'game' | 'results',
  currentRound: number,
  scenario: string,
  hostApiKey: string
});
```

#### 3. Host-Based Game Control

- **Host Privileges**: Only the room host can start games and control progression
- **API Key Management**: Host provides the Groq API key for all players
- **Scenario Distribution**: Host generates scenarios that sync to all players

#### 4. Real-time State Flow

1. **Room Creation**:
   - Host creates room with unique code
   - Sets player profile with name
   - Initializes lobby state

2. **Player Joining**:
   - Players join using room code
   - Automatic state synchronization
   - Real-time lobby updates

3. **Game Start**:
   - Host provides API key
   - Random scenario selected and synced
   - All players transition to game state simultaneously

4. **Strategy Submission**:
   - Each player submits independently
   - Individual AI analysis per player
   - Personal results without affecting others

#### 5. Error Handling & Fallbacks

```typescript
try {
  [multiplayerState, setMultiplayerState] = useMultiplayerState('game', defaultState);
  isHost = useIsHost();
} catch (e) {
  // Graceful fallback to single-player mode
  multiplayerState = defaultState;
  setMultiplayerState = () => {};
  isHost = false;
}
```

### Multiplayer Features

- **Real-time Lobby**: See players join/leave instantly
- **Host Controls**: Start games, manage progression
- **Independent Gameplay**: Each player's strategy is analyzed separately
- **Synchronized Scenarios**: Everyone faces the same survival situation
- **Room Codes**: Simple 4-character codes for easy joining

### Technical Benefits

- **No Backend Required**: PlayroomKit handles all networking
- **Real-time Sync**: Instant state updates across all clients
- **Scalable**: Supports multiple concurrent rooms
- **Cross-Platform**: Works on any device with a web browser

## 🎯 Game Flow

### Single Player
1. Enter API key
2. Face 3 random scenarios
3. Submit survival strategies
4. Get AI analysis and results
5. Final score based on survivals

### Multiplayer
1. Create or join room with player name
2. Host starts game with API key
3. All players get same scenario
4. Submit strategies independently
5. Individual AI analysis for each player
6. Compare results in real-time

## 🛠 Technologies Used

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query + React Router
- **Multiplayer**: PlayroomKit (real-time synchronization)
- **AI Analysis**: Groq API (LLaMA models)
- **Forms**: React Hook Form + Zod validation

## 🚀 Deployment

### Via Lovable (Recommended)
Simply open [Lovable](https://lovable.dev/projects/5ed0768c-332e-4f98-9c83-51eebb427199) and click on Share → Publish.

### Manual Deployment
```sh
npm run build
# Deploy the dist/ folder to your hosting provider
```

## 🌐 Custom Domain

Connect your own domain:
1. Navigate to Project > Settings > Domains in Lovable
2. Click "Connect Domain"
3. Follow the DNS configuration steps

[Read more about custom domains](https://docs.lovable.dev/tips-tricks/custom-domain)

## 🔧 Development Tips

- Use the Visual Edits feature in Lovable for quick UI changes
- The app gracefully handles multiplayer failures by falling back to single-player
- All styling uses semantic tokens from the design system
- Components are built with accessibility in mind using Radix UI primitives

## 🎮 Try the Game

Visit the live demo: [Lovable Project](https://lovable.dev/projects/5ed0768c-332e-4f98-9c83-51eebb427199)

---

Built with ❤️ using [Lovable](https://lovable.dev)