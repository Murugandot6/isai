import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MusicProvider } from "@/context/MusicContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Radio from "./pages/Radio";
import Library from "./pages/Library";
import Songs from "./pages/Songs";
import Artists from "./pages/Artists";
import Favourites from "./pages/Favourites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MusicProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/radio" element={<Route path="/radio" element={<Radio />} />} />
            <Route path="/library" element={<Library />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </MusicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;