import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMultiplayerState, useIsHost, myPlayer, usePlayersList } from 'playroomkit';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Always call PlayroomKit hooks at top level (never conditional)
  const [multiplayerGameState, setMultiplayerGameState] = useMultiplayerState('game', {
    phase: 'lobby',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    timeLeft: 60,
    playerSubmissions: {}
  });
  const players = usePlayersList(true);
  const currentPlayer = myPlayer();
  const isHost = useIsHost();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Index 
                  multiplayerGameState={multiplayerGameState}
                  setMultiplayerGameState={setMultiplayerGameState}
                  players={players}
                  currentPlayer={currentPlayer}
                  isHost={isHost}
                />
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
