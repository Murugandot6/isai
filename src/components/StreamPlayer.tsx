` with full code. Need no markdown code block. Need maybe no `<dyad-file>`. Good.

Need think about "Always use shadcn/ui". Already uses. Good.
Need maybe no dependencies. Good.

Need maybe "Before sending final answer, review every import statement you output". Imports from existing files. All described. Good.

Need maybe "Only use one dyad-write per file". We'll do one.

Need maybe maybe create a separate source registry file? User asked add sources. Could create `src/lib/stream-sources.ts` and update StreamPlayer. But to minimize, rewrite StreamPlayer. However, file is long. Good.

Need maybe "do not overengineer". But user provided full code. We can implement.

Need maybe "No markdown code blocks". We must not use triple backticks. Need final answer concise.

Need maybe "If requested feature already implemented" - not already implemented. We'll implement.

Need maybe not mention "verified from GitHub..." because false. We can include comments but maybe not.

Need maybe use `useEffect` to reset WebTorrent status when movie changes. Need ensure no infinite loop. Let's craft robust code.

Potential issue: `isMagnet` derived from `effectiveStreamUrl` and used in effect dependencies. In component, if `effectiveStreamUrl` changes due to `manualMagnetUrl`, isMagnet changes. Good.
- `hasDirectStream = !!effectiveStreamUrl` maybe rename `hasStreamUrl`.
- `isMagnet = effectiveStreamUrl?.startsWith('magnet:') || effectiveStreamUrl?.endsWith('.torrent');`
- Default embed server:
const defaultEmbedServer = effectiveStreamUrl && !isMagnet ? 'direct' : isImdb ? 'vidsrc_xyz' : 'vidlink';
useState(defaultEmbedServer)
- useEffect reset:
useEffect(() => {
const nextDefault = effectiveStreamUrl && !isMagnet ? 'direct' : isImdb ? 'vidsrc_xyz' : 'vidlink';
setEmbedServer(nextDefault);
setWtStatus('initializing'); setWtPeers(0); setWtSpeed(''); setWtProgress(0); setWtErrorMsg(''); setWtCountdown(0);
}, [effectiveStreamUrl, isImdb, isMagnet]);
But if user has set embedServer to 'embed_su', and `movie.streamUrl` exists direct, this effect runs only on mount and movie changes, not when user changes. Good. On mount it sets default. But if manual magnet set, effect runs and sets direct. Good.
Potential issue: `effectiveStreamUrl` is a const derived each render. If `movie.streamUrl` is undefined, manual null => undefined. Good.
- If user clicks Direct/P2P when `hasStreamUrl && !isMagnet` direct video. If magnet, direct shows WebTorrent. Good.
- If manual magnet entered, `hasStreamUrl` true, `isMagnet` true, `direct` button? Should show Direct/P2P? The "hasDirectStream" button condition currently `hasDirectStream &&` true for manual. But if no movie streamUrl and manual magnet, yes. Good. If no streamUrl, no direct. Good.
- But if manual magnet entered, `handleMagnetPlay` sets manual and embedServer direct. Good.
- If movie has magnet streamUrl, direct button visible. Good.

Need maybe "tmdbId" not used. Remove.

Need maybe `getEmbedUrl` for `dbgdrive` movie fallback:
case 'dbgdrive':
return isTv ? `https://databasegdriveplayer.co/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}` : `https://databasegdriveplayer.co/player.php?type=movie&tmdb=${id}`;
Need maybe `nxsha` only movie. If isTv and embedServer nxsha? It supportsTv false so not compatible for TV. Fine.
- `gomo` no TV, not compatible for TV. Good.
- `vidcloud` no TV, not compatible. Good.
- `vidzee` no TV, not compatible.
- `superembed` logic maybe uses multiembed for TV. Fine.
- `multiembed` tv: tmdb param should be `0` for imdb, `1` for tmdb. Good.
- `embedmaster` series for movies? It uses series for movies? Actually for movie, embedmaster.com/embed/movie/... good.
- `apimdb` TV uses tmdb path for both imdb and tmdb, but supports imdb. Fine.
- `curtstream` TV uses series/tmdb, movies/imdb. Fine.
- `fsapi` TV uses tv-imdb for all, supports tmdb true. Maybe okay.
- `gomo` movie only.
- `vidsrc_vip` maybe URL? okay.
- `vidsrc_to` maybe URL. okay.
- `vidsrc_fyi` maybe. okay.
- `vidlink` supports imdb false; if isImdb, not compatible. Good.
- `videasy`, `vidfast`, `vidking`, `rivestream`, etc supportsImdb false; if isImdb, not compatible. But many providers might accept imdb but user says skip duplicates. We'll follow.
- `compatibleServers` if isTv false and supportsTv false okay. Good.
- Need `TIER_COLORS` type `Record<number, string>`. Good.
- Need maybe activeServer note undefined, display blank. Good.

Need maybe ensure `setEmbedServer('vidlink')` fallback if no compatible? For non-IMDb, vidlink compatible. For IMDb, vidsrc_xyz. Good.
- If user manually clicks direct when effectiveStreamUrl exists but isMagnet false, video. If effectiveStreamUrl is magnet, WebTorrent. Good.
- `handleOpenExternal`: if direct and effectiveStreamUrl, open. But if direct and no effective? direct button not. If embedServer direct and no streamUrl? possible if manual? no.
- `getEmbedUrl` uses `movie.id`. If manual magnet with movie id, okay.
- Need maybe `magnetInput` local. Good.

Need maybe "CSP" issues? If app hosted, iframes maybe. Not relevant.

Need maybe "No try/catch" for destroy. We can use `wtClientRef.current?.destroy();` but destroy may throw? not likely. Good.

Need maybe "setWtCountdown(12)" then interval. When status ready, wtCountdown maybe stops at 0. Good.
- In WebTorrent effect, when `client.add` callback receives torrent, we clear timeout. But if `client.add` throws synchronously? We don't catch. Could bubble? The guideline says don't catch. Good.
- `file.renderTo('#webtorrent-video',...)`: If React StrictMode remounts, maybe element exists. Good.
- Need maybe `document.body.appendChild(script)` can duplicate script if effect reruns due to `isMagnet` or `embedServer`. If embedServer direct remains, effect dependencies not change after setWtLoaded? `isMagnet` and embedServer stable. It won't run. Good. If `wtLoaded` set true, effect not rerun because not dependency. Good.
- If script already loaded global but state false? script effect sees global and sets. Good.

Need maybe "type EmbedServerType" includes `direct` but ALL_SERVERS doesn't include direct. Good.

Need maybe "activeServer" undefined if embedServer direct. Good.

Need maybe "movie.genre?.toLowerCase().includes('tv')" if genre undefined. Good.

Need maybe "movie.id.startsWith" if id undefined? Movie interface string. Fine.

Need maybe "const hasStreamUrl = !!effectiveStreamUrl;" direct button. Good.

Need maybe "isMagnet" if effectiveStreamUrl undefined: false. Good.

Need maybe "defaultEmbedServer" if no stream and isImdb false -> vidlink. Good.

Need maybe "TIER_COLORS[1] + ' shadow-lg'" if TIER_COLORS[1] undefined? no.

Need maybe "supportsTmdb" for isImdb? Good.

Need maybe "manual magnet input" and "effectiveStreamUrl" resets when movie changes. Good.

Need maybe "if already added skip" maybe we shouldn't duplicate `ALL_SERVERS` with old ones. We'll replace. Good.

Need maybe maybe no "BlackHatWorld" comment. Good.

Need maybe "source list with 50" maybe not exact. Fine.

Need maybe "do not catch errors with try/catch" but code has no try/catch. Good.

Need maybe "Only edit files directly requested". We edit StreamPlayer. Good.

Need maybe "After all code changes, provide concise summary." We'll mention.

Need maybe "If you need a project file that does not yet exist, create it" no.

Need maybe "If package not listed in package.json, install" no new imports.

Need maybe "Use dyad-write for code output exclusively" yes.

Need maybe "No markdown code blocks" final no code blocks.

Need maybe "same language user using" English. Good.

Let's craft full file. Need be careful not too long? It's okay. Need close dyad-write. Use no markdown.

Need maybe include comments? Fine.

Let's write full file. Ensure no accidental triple backticks. Need maybe include "use client";. Need imports.

Potential TS issue: `window as any` in useEffect. Fine.
Potential TS issue: `ReturnType<typeof setInterval>` in browser returns number. Fine.
Potential TS issue: `wtTimeoutRef.current` type `ReturnType<typeof setTimeout>` but setTimeout returns number in DOM. Fine.
Potential TS issue: `document.body.appendChild(script);` script async. Fine.
Potential TS issue: `file.renderTo('#webtorrent-video'...` okay.
Potential TS issue: `movie.streamUrl` optional, `effectiveStreamUrl` maybe undefined. In `handleOpenExternal`, if direct and effectiveStreamUrl. Good.
Potential TS issue: `TIER_COLORS[1]` returns string | undefined if strict noUncheckedIndexedAccess? Probably false. To be safe:
const TIER_COLORS: Record<number, string> = ...
No issue.
Potential TS issue: `activeServer` type ServerDef | undefined. Good.
Potential TS issue: `compatibleServers` type ServerDef[]. Good.
Potential TS issue: `tier3plus` type ServerDef[]. Good.
Potential TS issue: `const defaultEmbedServer = hasStreamUrl && !isMagnet ? 'direct' : isImdb ? 'vidsrc_xyz' : 'vidlink';` TypeScript infers union with direct and string. Good.
Potential TS issue: `setEmbedServer(nextDefault);` nextDefault inferred "direct" | "vidsrc_xyz" | "vidlink". Good.
Potential TS issue: `const [embedServer, setEmbedServer] = useState<EmbedServerType>(defaultEmbedServer);` okay.
Potential TS issue: `wtClientRef.current?.destroy();` if destroy undefined? WebTorrent client has destroy. Good.
Potential TS issue: `wtCountdownRef.current` in cleanup. Good.
Potential TS issue: `const isMagnet = effectiveStreamUrl?.startsWith('magnet:') || effectiveStreamUrl?.endsWith('.torrent');` inferred boolean | undefined? Actually `||` of boolean | undefined and boolean | undefined yields boolean | undefined? Let's check: `undefined || undefined` => undefined. TypeScript may infer boolean | undefined. But `isMagnet` used in `hasStreamUrl && !isMagnet`: `!undefined` okay. But state condition `isMagnet ?` okay. To ensure boolean: `const isMagnet = Boolean(effectiveStreamUrl?.startsWith('magnet:') || effectiveStreamUrl?.endsWith('.torrent'));`. Use Boolean. Good.
Potential TS issue: `movie.genre?.toLowerCase().includes('tv') || ...` yields boolean | undefined. Use Boolean(...). Good.
Potential TS issue: `movie.id.startsWith('tt')` okay.
Potential TS issue: `const isTv = Boolean(movie.genre?.toLowerCase().includes('tv') || movie.genre?.toLowerCase().includes('series'));` calls toLowerCase twice. Fine. Could lower once.
Potential TS issue: `setWtCountdown(prev => { if (prev <= 1) { if (wtCountdownRef.current) clearInterval(wtCountdownRef.current); return 0; } return prev - 1; });` setState in interval, ok.
Potential TS issue: `client.add` callback may not fire if error? okay.
Potential TS issue: `file.renderTo('#webtorrent-video', { autoplay: true, controls: true }, (err: any) => { ... });` okay.
Potential TS issue: `window.open(movie.streamUrl, '_blank', 'noopener,noreferrer')` with string | undefined guarded. Good.
Potential TS issue: `button` active class with `TIER_COLORS[1] + ' shadow-lg'`: if undefined, but no.
Potential TS issue: `showAllServers` and `tier3plus.length`. Good.

Need maybe "activeServer = ALL_SERVERS.find(s => s.id === embedServer);" If embedServer direct, undefined. Good.
Need maybe "Direct / P2P" button should appear if hasStreamUrl. Good.
Need maybe "Direct / P2P" button if manual magnet and embedServer direct. Good.
Need maybe "hasStreamUrl" if movie.streamUrl is empty string. Good.

Need maybe "if the requested change has already been implemented" not. Good.

Need maybe "Summary less than sentence, exactly one chat title". Use `<dyad-chat-summary>Expanding StreamPlayer sources</dyad-chat-summary>` at end.

Need maybe final after dyad-write: "I've added the expanded source list to StreamPlayer and skipped duplicates." One sentence.

Need maybe use `<dyad-write path="src/components/StreamPlayer.tsx" description="Updating StreamPlayer with expanded embed source tiers and manual magnet playback.">` full code.

Let's draft code. Need maybe include `const lowerGenre = movie.genre?.toLowerCase() || ''; const isTv = lowerGenre.includes('tv') || lowerGenre.includes('series');` good.
Need maybe `const effectiveStreamUrl = manualMagnetUrl || movie.streamUrl;` if `movie.streamUrl` empty and manual empty => undefined. Good.
Need maybe `const hasStreamUrl = Boolean(effectiveStreamUrl);`
Need maybe `const isMagnet = Boolean(effectiveStreamUrl?.startsWith('magnet:') || effectiveStreamUrl?.endsWith('.torrent'));`
Need maybe reset effect:
useEffect(() => {
const nextDefault = hasStreamUrl && !isMagnet ? 'direct' : isImdb ? 'vidsrc_xyz' : 'vidlink';
setEmbedServer(nextDefault);
setWtStatus('initializing');
setWtPeers(0);
setWtSpeed('');
setWtProgress(0);
setWtErrorMsg('');
setWtCountdown(0);
}, [effectiveStreamUrl, isImdb, isMagnet]);
But this effect runs after initial render and sets embedServer to same. It also runs if manualMagnetUrl changes. Good.
Potential issue: If user clicks a server, `effectiveStreamUrl` unchanged. no reset. Good.
Potential issue: If user clicks direct button when effectiveStreamUrl exists, set direct. Good.
Potential issue: If no streamUrl and user somehow clicks direct? Button not present. Good.
Potential issue: If user clicks Direct/P2P with movie.streamUrl but `embedServer` default maybe direct. Good.
Potential issue: If user clicks "Play" manual magnet, `manualMagnetUrl` set, effect runs, sets embedServer direct, isMagnet true. Good.
Potential issue: If manual magnet entered and movie.streamUrl exists, effectiveStreamUrl uses manual. Good.
Potential issue: If user clicks server after manual magnet, `effectiveStreamUrl` manual but embed server server. Good.
Potential issue: If user clicks Direct/P2P after using server, direct. Good.
Potential issue: If user clicks Direct/P2P with non-magnet direct stream, video. Good.
Potential issue: If user clicks Direct/P2P with magnet, WebTorrent. Good.

Need maybe "Manual magnet input" should set key and maybe clear errors. handleMagnetPlay:
if (!magnetInput.trim()) return;
setManualMagnetUrl(magnetInput.trim());
setEmbedServer('direct');
setKey(prev => prev + 1);
Maybe setWtStatus('initializing'). Good.
Need maybe "If direct stream no magnet, no need key"? okay.

Need maybe "Auto-fallback after 12s with 0 peers" The code currently always fallback after 12s even if peers > 0 but not ready. It says with 0 peers, but code doesn't check. Could improve: in timeout:
if (wtPeers === 0) setEmbedServer(...); else maybe keep. But state closure wtPeers at effect start 0, stale. Could use ref. Simpler: fallback after 12s regardless. UI says Auto-switch. Fine. User code same.

Need maybe "Clear interval when prev <=1 but interval may continue? It returns 0 every second and clears, but after first clear, no more calls. Good.
Need maybe "When setting embedServer to cloud in timeout, cleanup will run because dependency changes. It will clear timeout and destroy client. Good.
Need maybe "When setEmbedServer('vidsrc_xyz') from timeout, `wtCountdownRef.current` clear. Good.

Need maybe "If client.add callback gets file and renderTo, but no `torrent.on('download')` before metadata? okay.
Need maybe "If torrent has no video file, status error but client not destroyed. Could leave. Fine.
Need maybe "If renderTo error, client not destroyed. Fine.

Need maybe "Server source count" in tips says 50. There are 51? Let's count direct + 52? But user says 50. We can say "Expanded source list". To avoid false, maybe "Multiple streaming sources available." But user asked 50. Maybe keep "50+"? Hmm. Better "Expanded streaming sources available." We'll update tips to not claim exactly 50 maybe. But user requested "add these new sources". Fine.

Need maybe "ALL 50 EMBED SOURCES — verified..." comment could be false. We can remove "verified from..." and just say "Expanded source list." Good.

Need maybe "BlackHatWorld" not mention.

Need maybe "ALL 50" count? Could say "Expanded source list". Good.

Need maybe "Skip duplicates" not in code.

Let's write.
</think>I’ll update the Stremio stream player with the expanded source list, skipping anything that was already present.

<dyad-write path="src/components/StreamPlayer.tsx" description="Updating StreamPlayer with expanded Stremio-compatible source tiers and manual magnet playback.">
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/context/MusicContext';
import { Server, Info, Shield, RefreshCcw, ExternalLink, Play, Star, AlertCircle, Users, Download, Activity, Zap, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

interface StreamPlayerProps {
  movie: Movie;
}

type EmbedServerType =
  | 'direct'
  | 'vidsrc_xyz'
  | 'embed_su'
  | 'vidlink'
  | 'videasy'
  | 'vidfast'
  | 'vidsrc_fyi'
  | 'vidsrc_pro'
  | 'vidsrc_vip'
  | 'vidsrc_me'
  | 'vidsrc_to'
  | 'autoembed'
  | 'autoembed_co'
  | 'multiembed'
  | 'multiembed_vip'
  | 'superembed'
  | 'rivestream'
  | 'rivestream_torr'
  | 'rivestream_agg'
  | 'vidking'
  | 'vidapi'
  | 'moviesapi'
  | 'vidsrc_sbs'
  | '2embed'
  | 'embedmaster'
  | 'vidzee'
  | 'filmku'
  | 'vidora'
  | 'pstream'
  | 'gomo'
  | 'vikembed'
  | 'fsapi'
  | 'curtstream'
  | 'apimdb'
  | 'moviewp'
  | 'vidsrc_su'
  | 'vidsrcme_ru'
  | 'nxsha'
  | 'dbgdrive'
  | 'getsuperembed'
  | 'vidsrc_icu'
  | 'vidcloud'
  | 'smashystream'
  | 'rive_torrent_tv'
  | 'ezvidapi'
  | 'vidsync'
  | 'cinesrc'
  | 'lordflix'
  | 'xprime'
  | 'yflix'
  | 'abyss'
  | 'vidfast_alt';

interface ServerDef {
  id: EmbedServerType;
  label: string;
  tier: 1 | 2 | 3 | 4 | 5;
  quality: string;
  supportsImdb: boolean;
  supportsTmdb: boolean;
  supportsTv: boolean;
  note?: string;
}

const ALL_SERVERS: ServerDef[] = [
  { id: 'vidsrc_xyz', label: 'VidSrc.xyz', tier: 1, quality: '4K', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Most reliable' },
  { id: 'embed_su', label: 'Embed.su', tier: 1, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Fast & stable' },
  { id: 'vidlink', label: 'VidLink.pro', tier: 1, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'TMDb native' },
  { id: 'videasy', label: 'Videasy.net', tier: 1, quality: '4K', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Ad-free, 4K' },
  { id: 'vidfast', label: 'VidFast.pro', tier: 1, quality: '4K', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: '4K, anime' },
  { id: 'vidsrc_fyi', label: 'VidSrc.fyi', tier: 1, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Multi-server failover' },
  { id: 'vidsrc_pro', label: 'VidSrc.pro', tier: 1, quality: '4K', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Anime + 4K' },
  { id: 'vidsrc_vip', label: 'VidSrc.vip', tier: 1, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Download support' },
  { id: 'vidsrc_me', label: 'VidSrc.me', tier: 1, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'vidsrc_to', label: 'VidSrc.to', tier: 1, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },

  { id: 'autoembed', label: 'AutoEmbed.cc', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Anime + drama' },
  { id: 'autoembed_co', label: 'AutoEmbed.co', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'multiembed', label: 'MultiEmbed.mov', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: '10+ servers' },
  { id: 'multiembed_vip', label: 'MultiEmbed VIP', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'HLS multi-quality' },
  { id: 'superembed', label: 'SuperEmbed.stream', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'rivestream', label: 'RiveStream', tier: 2, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Multi-source' },
  { id: 'rivestream_torr', label: 'RiveStream Torrent', tier: 2, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Torrent-backed' },
  { id: 'rivestream_agg', label: 'RiveStream Aggregator', tier: 2, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Aggregated sources' },
  { id: 'vidking', label: 'VidKing.net', tier: 2, quality: '4K', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: '50K+ movies, HLS' },
  { id: 'vidapi', label: 'VidAPI.xyz', tier: 2, quality: '4K', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: 'Multi-audio' },
  { id: 'moviesapi', label: 'MoviesAPI.club', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true, note: '32K+ movies' },
  { id: 'vidsrc_sbs', label: 'VidSrc.sbs', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: '2embed', label: '2Embed.cc', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'embedmaster', label: 'EmbedMaster', tier: 2, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },

  { id: 'vidzee', label: 'VidZee.wtf', tier: 3, quality: '4K', supportsImdb: false, supportsTmdb: true, supportsTv: false, note: '4K embed' },
  { id: 'filmku', label: 'Filmku.stream', tier: 3, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Anime support' },
  { id: 'vidora', label: 'Vidora.su', tier: 3, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Ad-free' },
  { id: 'pstream', label: 'PStream (iframe)', tier: 3, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Ad-free' },
  { id: 'gomo', label: 'GoMo.to', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: false, supportsTv: false },
  { id: 'vikembed', label: 'VikingEmbed', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'fsapi', label: 'FSAPI.xyz', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: false, supportsTv: true },
  { id: 'curtstream', label: 'CurtStream', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'apimdb', label: 'APIMDB', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'moviewp', label: 'MovieWP', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'vidsrc_su', label: 'VidSrc.su', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'vidsrcme_ru', label: 'VidSrc-Embed.ru', tier: 3, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },

  { id: 'nxsha', label: 'NXSHA (Tamil)', tier: 4, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: false, note: 'Tamil content' },
  { id: 'dbgdrive', label: 'DatabaseGDrive', tier: 4, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'getsuperembed', label: 'GetSuperEmbed', tier: 4, quality: '1080p', supportsImdb: true, supportsTmdb: false, supportsTv: true },
  { id: 'vidsrc_icu', label: 'VidSrc.icu', tier: 4, quality: '1080p', supportsImdb: true, supportsTmdb: true, supportsTv: true },
  { id: 'vidcloud', label: 'VidCloud', tier: 4, quality: '1080p', supportsImdb: true, supportsTmdb: false, supportsTv: false },
  { id: 'smashystream', label: 'SmashyStream', tier: 4, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },

  { id: 'rive_torrent_tv', label: 'Rive Torrent TV', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'ezvidapi', label: 'EzVidAPI', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true, note: 'Auto-failover' },
  { id: 'vidsync', label: 'VidSync', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'cinesrc', label: 'CineSrc', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'lordflix', label: 'LordFlix', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'xprime', label: 'XPrime', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'yflix', label: 'YFlix', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'abyss', label: 'Abyss', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
  { id: 'vidfast_alt', label: 'VidFast (Alt)', tier: 5, quality: '1080p', supportsImdb: false, supportsTmdb: true, supportsTv: true },
];

const WEBRTC_TRACKERS = [
  'wss://tracker.webtorrent.dev',
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce',
  'wss://tracker.gbitt.info:443/announce',
  'wss://tracker.fastcast.nz'
];

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ movie }) => {
  const isImdb = movie.id.startsWith('tt');
  const lowerGenre = movie.genre?.toLowerCase() || '';
  const isTv = lowerGenre.includes('tv') || lowerGenre.includes('series');

  const [manualMagnetUrl, setManualMagnetUrl] = useState<string | null>(null);
  const effectiveStreamUrl = manualMagnetUrl || movie.streamUrl;
  const hasStreamUrl = Boolean(effectiveStreamUrl);
  const isMagnet = Boolean(effectiveStreamUrl?.startsWith('magnet:') || effectiveStreamUrl?.endsWith('.torrent'));

  const defaultEmbedServer = hasStreamUrl && !isMagnet ? 'direct' : isImdb ? 'vidsrc_xyz' : 'vidlink';
  const [embedServer, setEmbedServer] = useState<EmbedServerType>(defaultEmbedServer);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [key, setKey] = useState(0);
  const [showAllServers, setShowAllServers] = useState(false);
  const [magnetInput, setMagnetInput] = useState('');

  const [wtLoaded, setWtLoaded] = useState(false);
  const [wtProgress, setWtLoadedProgress] = useState(0);
  const [wtPeers, setWtPeers] = useState(0);
  const [wtSpeed, setWtSpeed] = useState('');
  const [wtStatus, setWtStatus] = useState<'initializing' | 'connecting' | 'metadata' | 'ready' | 'error'>('initializing');
  const [wtErrorMsg, setWtErrorMsg] = useState('');
  const [wtCountdown, setWtCountdown] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wtClientRef = useRef<any>(null);
  const wtTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wtCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const nextDefault = hasStreamUrl && !isMagnet ? 'direct' : isImdb ? 'vidsrc_xyz' : 'vidlink';
    setEmbedServer(nextDefault);
    setWtStatus('initializing');
    setWtPeers(0);
    setWtSpeed('');
    setWtProgress(0);
    setWtErrorMsg('');
    setWtCountdown(0);
  }, [effectiveStreamUrl, isImdb, isMagnet]);

  useEffect(() => {
    if (isMagnet && embedServer === 'direct') {
      if ((window as any).WebTorrent) {
        setWtLoaded(true);
        return;
      }

      setWtStatus('initializing');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js';
      script.async = true;
      script.onload = () => setWtLoaded(true);
      script.onerror = () => {
        setWtStatus('error');
        setWtErrorMsg('Failed to load WebTorrent library.');
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [isMagnet, embedServer]);

  useEffect(() => {
    if (isMagnet && embedServer === 'direct' && wtLoaded && effectiveStreamUrl) {
      setWtStatus('connecting');
      const WebTorrent = (window as any).WebTorrent;

      if (!WebTorrent) {
        setWtStatus('error');
        setWtErrorMsg('WebTorrent not available.');
        return;
      }

      wtClientRef.current?.destroy();
      if (wtTimeoutRef.current) clearTimeout(wtTimeoutRef.current);
      if (wtCountdownRef.current) clearInterval(wtCountdownRef.current);

      const client = new WebTorrent();
      wtClientRef.current = client;

      let enrichedMagnet = effectiveStreamUrl;
      if (enrichedMagnet.startsWith('magnet:')) {
        WEBRTC_TRACKERS.forEach(tr => {
          if (!enrichedMagnet.includes(encodeURIComponent(tr)) && !enrichedMagnet.includes(tr)) {
            enrichedMagnet += `&tr=${encodeURIComponent(tr)}`;
          }
        });
      }

      setWtStatus('metadata');
      setWtCountdown(12);

      wtCountdownRef.current = setInterval(() => {
        setWtCountdown(prev => {
          if (prev <= 1) {
            if (wtCountdownRef.current) clearInterval(wtCountdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      wtTimeoutRef.current = setTimeout(() => {
        wtClientRef.current?.destroy();
        wtClientRef.current = null;

        if (wtCountdownRef.current) {
          clearInterval(wtCountdownRef.current);
          wtCountdownRef.current = null;
        }

        setEmbedServer(isImdb ? 'vidsrc_xyz' : 'vidlink');
      }, 12000);

      client.add(enrichedMagnet, { announce: WEBRTC_TRACKERS }, (torrent: any) => {
        if (wtTimeoutRef.current) {
          clearTimeout(wtTimeoutRef.current);
          wtTimeoutRef.current = null;
        }
        if (wtCountdownRef.current) {
          clearInterval(wtCountdownRef.current);
          wtCountdownRef.current = null;
        }

        const file = torrent.files.find((f: any) =>
          f.name.endsWith('.mp4') ||
          f.name.endsWith('.mkv') ||
          f.name.endsWith('.webm') ||
          f.name.endsWith('.avi')
        );

        if (!file) {
          setWtStatus('error');
          setWtErrorMsg('No streamable video file found in torrent.');
          return;
        }

        setWtStatus('ready');

        file.renderTo('#webtorrent-video', { autoplay: true, controls: true }, (err: any) => {
          if (err) {
            setWtStatus('error');
            setWtErrorMsg('Codec not supported by this browser.');
          }
        });

        torrent.on('download', () => {
          setWtLoadedProgress(Math.round(torrent.progress * 100));
          setWtPeers(torrent.numPeers);
          setWtSpeed(`${(torrent.downloadSpeed / (1024 * 1024)).toFixed(2)} MB/s`);
        });

        torrent.on('wire', () => setWtPeers(torrent.numPeers));
      });

      client.on('error', (err: any) => {
        if (wtTimeoutRef.current) {
          clearTimeout(wtTimeoutRef.current);
          wtTimeoutRef.current = null;
        }
        if (wtCountdownRef.current) {
          clearInterval(wtCountdownRef.current);
          wtCountdownRef.current = null;
        }
        setWtStatus('error');
        setWtErrorMsg(err.message || 'P2P connection failed.');
      });

      return () => {
        if (wtTimeoutRef.current) {
          clearTimeout(wtTimeoutRef.current);
          wtTimeoutRef.current = null;
        }
        if (wtCountdownRef.current) {
          clearInterval(wtCountdownRef.current);
          wtCountdownRef.current = null;
        }
        client.destroy();
      };
    }
  }, [isMagnet, embedServer, wtLoaded, effectiveStreamUrl, isImdb, key]);

  const getEmbedUrl = (): string => {
    const id = movie.id;
    const s = season;
    const e = episode;

    switch (embedServer) {
      case 'vidsrc_xyz':
        return isTv ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` : `https://vidsrc.xyz/embed/movie/${id}`;
      case 'embed_su':
        return isTv ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}`;
      case 'vidlink':
        return isTv ? `https://vidlink.pro/tv/${id}/${s}/${e}` : `https://vidlink.pro/movie/${id}`;
      case 'videasy':
        return isTv ? `https://player.videasy.net/tv/${id}/${s}/${e}` : `https://player.videasy.net/movie/${id}`;
      case 'vidfast':
        return isTv ? `https://vidfast.pro/tv/${id}/${s}/${e}` : `https://vidfast.pro/movie/${id}`;
      case 'vidsrc_fyi':
        return isTv ? `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}` : `https://vidsrc.fyi/embed/movie/${id}`;
      case 'vidsrc_pro':
        return isTv ? `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` : `https://vidsrc.pro/embed/movie/${id}`;
      case 'vidsrc_vip':
        return isTv ? `https://vidsrc.vip/embed/tv/${id}/${s}/${e}` : `https://vidsrc.vip/embed/movie/${id}`;
      case 'vidsrc_me':
        return isTv
          ? isImdb ? `https://vidsrc.me/embed/tv?imdb=${id}&season=${s}&episode=${e}` : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
          : isImdb ? `https://vidsrc.me/embed/movie?imdb=${id}` : `https://vidsrc.me/embed/movie?tmdb=${id}`;
      case 'vidsrc_to':
        return isTv ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}` : `https://vidsrc.to/embed/movie/${id}`;

      case 'autoembed':
        return isTv ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}` : `https://player.autoembed.cc/embed/movie/${id}`;
      case 'autoembed_co':
        return isTv
          ? isImdb ? `https://autoembed.co/tv/imdb/${id}-${s}-${e}` : `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`
          : isImdb ? `https://autoembed.co/movie/imdb/${id}` : `https://autoembed.co/movie/tmdb/${id}`;
      case 'multiembed':
        return isTv
          ? `https://multiembed.mov/?video_id=${id}&tmdb=${isImdb ? 0 : 1}&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${id}&tmdb=${isImdb ? 0 : 1}`;
      case 'multiembed_vip':
        return isTv
          ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=${isImdb ? 0 : 1}&s=${s}&e=${e}`
          : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=${isImdb ? 0 : 1}`;
      case 'superembed':
        return isTv
          ? `https://multiembed.mov/?video_id=${id}&tmdb=${isImdb ? 0 : 1}&s=${s}&e=${e}`
          : `https://www.superembed.stream/embed?id=${id}&tmdb=${isImdb ? 0 : 1}`;
      case 'rivestream':
        return isTv ? `https://www.rivestream.app/embed?type=tv&id=${id}&season=${s}&episode=${e}` : `https://www.rivestream.app/embed?type=movie&id=${id}`;
      case 'rivestream_torr':
        return isTv ? `https://www.rivestream.app/embed/torrent?type=tv&id=${id}&season=${s}&episode=${e}` : `https://www.rivestream.app/embed/torrent?type=movie&id=${id}`;
      case 'rivestream_agg':
        return isTv ? `https://www.rivestream.app/embed/agg?type=tv&id=${id}&season=${s}&episode=${e}` : `https://www.rivestream.app/embed/agg?type=movie&id=${id}`;
      case 'vidking':
        return isTv ? `https://www.vidking.net/embed/tv/${id}/${s}/${e}?autoPlay=true` : `https://www.vidking.net/embed/movie/${id}?autoPlay=true`;
      case 'vidapi':
        return isTv ? `https://vidapi.xyz/embed/tv/${id}/${s}/${e}` : `https://vidapi.xyz/embed/movie/${id}`;
      case 'moviesapi':
        return isTv ? `https://moviesapi.club/tv/${id}-${s}-${e}` : `https://moviesapi.club/movie/${id}`;
      case 'vidsrc_sbs':
        return isTv ? `https://vidsrc.sbs/embed/tv/${id}/${s}/${e}?autoplay=1` : `https://vidsrc.sbs/embed/movie/${id}?autoplay=1`;
      case '2embed':
        return isTv ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${id}`;
      case 'embedmaster':
        return isTv
          ? isImdb ? `https://embedmaster.com/embed/series/${id}/${s}/${e}` : `https://embedmaster.com/embed/series/tmdb/${id}/${s}/${e}`
          : isImdb ? `https://embedmaster.com/embed/movie/${id}` : `https://embedmaster.com/embed/movie/tmdb/${id}`;

      case 'vidzee':
        return `https://player.vidzee.wtf/embed/movie/${id}`;
      case 'filmku':
        return isTv ? `https://filmku.stream/embed/tv?tmdb=${id}&sea=${s}&epi=${e}` : `https://filmku.stream/embed/movie?tmdb=${id}`;
      case 'vidora':
        return isTv ? `https://vidora.su/tv/${id}/${s}/${e}` : `https://vidora.su/movie/${id}`;
      case 'pstream':
        return isTv ? `https://iframe.pstream.org/embed/tmdb/tv-${id}/${s}/${e}` : `https://iframe.pstream.org/embed/tmdb/movie-${id}`;
      case 'gomo':
        return `https://gomo.to/movie/${id}`;
      case 'vikembed':
        return isTv ? `https://vembed.click/embed/tv/${id}/${s}/${e}` : `https://vembed.click/embed/movie/${id}`;
      case 'fsapi':
        return isTv ? `https://fsapi.xyz/tv-imdb/${id}-${s}-${e}` : `https://fsapi.xyz/movie/${id}`;
      case 'curtstream':
        return isTv ? `https://curtstream.com/series/tmdb/${id}/${s}/${e}` : `https://curtstream.com/movies/imdb/${id}`;
      case 'apimdb':
        return isTv ? `https://v2.apimdb.net/e/tmdb/tv/${id}/${s}/${e}/` : `https://v2.apimdb.net/e/movie/${id}`;
      case 'moviewp':
        return isTv ? `https://moviewp.com/se.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` : `https://moviewp.com/se.php?video_id=${id}&tmdb=1`;
      case 'vidsrc_su':
        return isTv ? `https://vidsrc.su/embed/tv/${id}/${s}/${e}` : `https://vidsrc.su/embed/movie/${id}`;
      case 'vidsrcme_ru':
        return isTv ? `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}` : `https://vidsrc-embed.ru/embed/movie?tmdb=${id}`;

      case 'nxsha':
        return `https://web.nxsha.app/embed/movie/${id}?lang=tamil&autoplay=true`;
      case 'dbgdrive':
        return isTv ? `https://databasegdriveplayer.co/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}` : `https://databasegdriveplayer.co/player.php?type=movie&tmdb=${id}`;
      case 'getsuperembed':
        return isTv ? `https://getsuperembed.link/?video_id=${id}&season=${s}&episode=${e}` : `https://getsuperembed.link/?video_id=${id}`;
      case 'vidsrc_icu':
        return isTv ? `https://vidsrc.icu/embed/tv/${id}/${s}/${e}` : `https://vidsrc.icu/embed/movie/${id}`;
      case 'vidcloud':
        return `https://vidcloud.stream/${id}.html`;
      case 'smashystream':
        return isTv ? `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${id}`;

      case 'rive_torrent_tv':
        return isTv ? `https://www.rivestream.app/embed/torrent?type=tv&id=${id}&season=${s}&episode=${e}` : `https://www.rivestream.app/embed/torrent?type=movie&id=${id}`;
      case 'ezvidapi':
        return isTv ? `https://ezvidapi.com/embed/tv/${id}/${s}/${e}` : `https://ezvidapi.com/embed/movie/${id}`;
      case 'vidsync':
        return isTv ? `https://vidsync.to/embed/tv/${id}/${s}/${e}` : `https://vidsync.to/embed/movie/${id}`;
      case 'cinesrc':
        return isTv ? `https://cinesrc.org/embed/tv/${id}/${s}/${e}` : `https://cinesrc.org/embed/movie/${id}`;
      case 'lordflix':
        return isTv ? `https://lordflix.to/embed/tv/${id}/${s}/${e}` : `https://lordflix.to/embed/movie/${id}`;
      case 'xprime':
        return isTv ? `https://xprime.tv/embed/tv/${id}/${s}/${e}` : `https://xprime.tv/embed/movie/${id}`;
      case 'yflix':
        return isTv ? `https://yflix.to/embed/tv/${id}/${s}/${e}` : `https://yflix.to/embed/movie/${id}`;
      case 'abyss':
        return isTv ? `https://abysscdn.com/embed/tv/${id}/${s}/${e}` : `https://abysscdn.com/embed/movie/${id}`;
      case 'vidfast_alt':
        return isTv ? `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${id}?autoPlay=true`;

      default:
        return `https://vidsrc.xyz/embed/movie/${id}`;
    }
  };

  const refreshPlayer = () => setKey(prev => prev + 1);

  const handleOpenExternal = () => {
    if (embedServer === 'direct' && effectiveStreamUrl) {
      window.open(effectiveStreamUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(getEmbedUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  const handleMagnetPlay = () => {
    if (!magnetInput.trim()) return;
    setManualMagnetUrl(magnetInput.trim());
    setEmbedServer('direct');
    setKey(prev => prev + 1);
    setWtStatus('initializing');
  };

  const compatibleServers = ALL_SERVERS.filter(srv => {
    if (isImdb && !srv.supportsImdb) return false;
    if (!isImdb && !srv.supportsTmdb) return false;
    if (isTv && !srv.supportsTv) return false;
    return true;
  });

  const tier1 = compatibleServers.filter(s => s.tier === 1);
  const tier2 = compatibleServers.filter(s => s.tier === 2);
  const tier3plus = compatibleServers.filter(s => s.tier >= 3);

  const TIER_COLORS: Record<number, string> = {
    1: 'bg-purple-600 text-white shadow-purple-600/20',
    2: 'bg-indigo-600 text-white shadow-indigo-600/20',
    3: 'bg-zinc-700 text-zinc-200',
    4: 'bg-zinc-800 text-zinc-400',
    5: 'bg-zinc-900 text-zinc-500',
  };

  const activeServer = ALL_SERVERS.find(s => s.id === embedServer);

  return (
    <div className="flex flex-col gap-6 w-full">
      {isTv && embedServer !== 'direct' && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Season:</span>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[100px] bg-zinc-900 border-none rounded-xl font-bold text-xs h-9">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                {Array.from({ length: 15 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs">Season {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Episode:</span>
            <Select value={episode} onValueChange={setEpisode}>
              <SelectTrigger className="w-[100px] bg-zinc-900 border-none rounded-xl font-bold text-xs h-9">
                <SelectValue placeholder="Episode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                {Array.from({ length: 30 }).map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold text-xs">Episode {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center">
          {embedServer === 'direct' && effectiveStreamUrl ? (
            isMagnet ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-4 md:p-6 text-center overflow-y-auto">
                {wtStatus === 'ready' ? (
                  <video id="webtorrent-video" className="w-full h-full object-contain" controls autoPlay />
                ) : (
                  <div className="max-w-lg w-full space-y-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                    <div className="flex justify-center">
                      {wtStatus === 'error' ? (
                        <AlertCircle className="text-red-500 w-10 h-10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-base tracking-tight uppercase">
                        {wtStatus === 'initializing' && 'Loading P2P Engine...'}
                        {wtStatus === 'connecting' && 'Connecting to WebRTC...'}
                        {wtStatus === 'metadata' && 'Fetching Torrent Metadata...'}
                        {wtStatus === 'error' && 'P2P Playback Failed'}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-semibold max-w-sm mx-auto">
                        {wtStatus === 'error' ? (wtErrorMsg || 'No peers found.') : 'Reading files and structures in peer network...'}
                      </p>
                    </div>

                    {wtStatus !== 'error' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 px-1">
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                            <Users size={12} className="text-indigo-400 animate-pulse" />
                            <span>{wtPeers} WebRTC Seeds</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                            <Activity size={12} className="text-indigo-400" />
                            <span>{wtSpeed || '0.00 MB/s'}</span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-white/[0.03] border border-white/8 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <HelpCircle size={11} className="text-indigo-400" />
                              Browsers need WebRTC peers
                            </span>
                            {wtCountdown > 0 && (
                              <span className="text-amber-400 font-black tabular-nums">Auto-switch in {wtCountdown}s</span>
                            )}
                          </div>
                          <p className="font-bold text-zinc-200 text-[11px] text-center">⚡ Watch immediately via cloud:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => setEmbedServer('vidsrc_xyz')} className="rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-[10px] h-9 gap-1 text-white">
                              <Play size={10} fill="currentColor" /> VidSrc.xyz
                            </Button>
                            <Button onClick={() => setEmbedServer('vidlink')} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-[10px] h-9 gap-1 text-white">
                              <Play size={10} fill="currentColor" /> VidLink.pro
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {wtStatus === 'error' && (
                      <div className="flex flex-col gap-2 pt-2">
                        <Button onClick={refreshPlayer} className="rounded-xl bg-white/5 border border-white/10 font-bold text-xs">Retry P2P</Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={() => setEmbedServer('vidsrc_xyz')} className="rounded-xl bg-purple-600 text-white font-bold text-xs">VidSrc.xyz</Button>
                          <Button onClick={() => setEmbedServer('vidlink')} className="rounded-xl bg-indigo-600 text-white font-bold text-xs">VidLink.pro</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {wtStatus === 'ready' && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-4 text-[10px] font-bold text-zinc-400 z-10 pointer-events-none">
                    <div className="flex items-center gap-1 text-green-400">
                      <Users size={12} /> {wtPeers} PEERS
                    </div>
                    <div className="flex items-center gap-1 text-indigo-400">
                      <Download size={12} /> {wtSpeed}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Zap size={12} /> {wtProgress}%
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <video
                ref={videoRef}
                key={`${effectiveStreamUrl}-${key}`}
                src={effectiveStreamUrl}
                className="w-full h-full"
                controls
                autoPlay
                preload="auto"
                playsInline
              />
            )
          ) : (
            <iframe
              key={`${embedServer}-${movie.id}-${season}-${episode}-${key}`}
              src={getEmbedUrl()}
              className="w-full h-full border-none"
              allowFullScreen
              scrolling="no"
              referrerPolicy="origin"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
        </div>

        <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Server size={14} className="text-purple-400" />
              <span className="font-bold">Streaming Sources ({isImdb ? 'IMDb' : 'TMDb'} • {isTv ? 'TV' : 'Movie'}):</span>
              {activeServer && (
                <span className="text-[10px] text-zinc-500">• {activeServer.quality} • {activeServer.note || ''}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={refreshPlayer} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                <RefreshCcw size={12} /> Reload Player
              </button>
              <Button onClick={handleOpenExternal} variant="outline" size="sm" className="h-8 rounded-lg border-purple-500/20 hover:bg-purple-500/10 text-purple-300 hover:text-white text-[10px] font-bold gap-1.5">
                <ExternalLink size={12} /> Open in New Tab
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Star size={9} className="text-yellow-500" /> Tier 1 — Best Quality
            </p>
            <div className="flex flex-wrap gap-2">
              {hasStreamUrl && (
                <button
                  onClick={() => setEmbedServer('direct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === 'direct' ? 'bg-green-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-green-500/20'}`}
                >
                  Direct / P2P
                </button>
              )}
              {tier1.map(srv => (
                <button
                  key={srv.id}
                  onClick={() => setEmbedServer(srv.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv.id ? `${TIER_COLORS[1]} shadow-lg` : 'bg-white/5 text-white/60 hover:bg-white/10 border border-purple-500/20'}`}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tier 2 — Good Reliability</p>
            <div className="flex flex-wrap gap-2">
              {tier2.map(srv => (
                <button
                  key={srv.id}
                  onClick={() => setEmbedServer(srv.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv.id ? `${TIER_COLORS[2]} shadow-lg` : 'bg-white/5 text-white/60 hover:bg-white/10 border border-indigo-500/10'}`}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAllServers(v => !v)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
          >
            {showAllServers ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showAllServers ? 'Hide' : 'Show'} {tier3plus.length} more sources (Tier 3–5)
          </button>

          {showAllServers && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex flex-wrap gap-2">
                {tier3plus.map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => setEmbedServer(srv.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${embedServer === srv.id ? 'bg-zinc-600 text-white shadow-lg' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                  >
                    {srv.label}
                    {srv.note && <span className="ml-1 text-[8px] opacity-60">({srv.note})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/5 space-y-2">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">🧲 Play Any Magnet Link</p>
            <div className="flex gap-2">
              <Input
                value={magnetInput}
                onChange={e => setMagnetInput(e.target.value)}
                placeholder="Paste magnet:?xt=urn:btih:... link here"
                className="bg-white/5 border-white/10 text-xs text-white placeholder:text-zinc-600 h-9 rounded-xl flex-1"
              />
              <Button onClick={handleMagnetPlay} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-4 rounded-xl shrink-0">
                <Play size={12} fill="currentColor" className="mr-1" /> Play
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 leading-relaxed">
          <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
          <p>Expanded streaming source tiers are available. Tier 1 sources are fastest and most reliable. If one fails, try the next tier or use <strong>Open in New Tab</strong> to bypass iframe blocks.</p>
        </div>
        <div className="flex gap-2 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200 leading-relaxed">
          <Shield size={16} className="text-purple-400 shrink-0 mt-0.5" />
          <p><strong>Adblocker Tip:</strong> Some sources work better with uBlock Origin enabled. If you see a blank screen, click <strong>Open in New Tab</strong> to watch directly.</p>
        </div>
      </div>
    </div>
  );
};