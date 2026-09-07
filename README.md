# Decim Survival

## Local development

Decim Survival is a multiplayer survival-strategy game. Players are given dangerous scenarios, write a plan under pressure, and let an AI judge whether that plan would keep them alive.

Run the app with:

```bash
npm run dev
```

## How It Works

- Create a mission room or join one with a four-character room code.
- The host launches the mission and each player gets 60 seconds to submit a strategy.
- Groq AI writes a short survival report and decides whether each player survives.
- Surviving earns 100 points, with extra points for submitting quickly.
- The game runs for three scenarios, then shows the final leaderboard.

## Tech Stack

- React and TypeScript
- Vite
- Tailwind CSS with shadcn/ui and Radix UI
- PlayroomKit for multiplayer rooms and synchronized game state
- Groq API for AI survival verdicts

## Run Locally

```bash
npm install
```

Create `.env.local` in the project root:

```env
VITE_GROQ_API_KEY=your_groq_api_key
```

Start the development server:

```bash
npm run dev
```

Restart the server whenever `.env.local` changes.

## Build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy

The app can be deployed to Vercel, Netlify, or any static host that supports Vite.

1. Push the project to GitHub.
2. Import the repository into your hosting provider.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Add `VITE_GROQ_API_KEY` in the provider's environment variables.
6. Deploy and open the generated URL.

For production, move the Groq request to a server-side endpoint. Vite variables beginning with `VITE_` are included in the browser bundle, so the current setup exposes the API key to users.
