import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { MusicProvider } from "@/context/MusicContext";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Music from "./pages/Music";
import Movies from "./pages/Movies";
import Stremio from "./pages/Stremio";
import Search from "./pages/Search";
import Radio from "./pages/Radio";
import Featured from "./pages/Featured";
import Artists from "./pages/Artists";
import AlbumDetails from "./pages/AlbumDetails";
import PlaylistDetails from "./pages/PlaylistDetails";
import Library from "./pages/Library";
import Favourites from "./pages/Favourites";
import Songs from "./pages/Songs";
import Profile from "./pages/Profile";
import Watch from "./pages/Watch";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/music" element={<Music />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/stremio" element={<Stremio />} />
            <Route path="/search" element={<Search />} />
            <Route path="/radio" element={<Radio />} />
            <Route path="/featured" element={<Featured />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/playlist/:id" element={<PlaylistDetails />} />
            <Route path="/library" element={<Library />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;