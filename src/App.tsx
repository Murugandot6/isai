import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MusicProvider } from "@/context/MusicContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Radio from "./pages/Radio";
import Library from "./pages/Library";
import Songs from "./pages/Songs";
import Artists from "./pages/Artists";
import Favourites from "./pages/Favourites";
import AlbumDetails from "./pages/AlbumDetails";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MusicProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/radio" element={<Radio />} />
              <Route path="/library" element={<Library />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/album/:id" element={<AlbumDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </MusicProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;