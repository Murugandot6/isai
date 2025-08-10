import { AiOutlineHome, AiFillHome, AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BsBarChartLine, BsFillBarChartLineFill } from 'react-icons/bs'
import { MdLibraryMusic, MdOutlineLibraryMusic, MdOutlineFeaturedPlayList, MdFeaturedPlayList } from 'react-icons/md';
import { RiPlayListFill, RiPlayListLine } from "react-icons/ri";

export const links = [
  { name: 'Home', to: '/', icon: AiOutlineHome, altIcon: AiFillHome },
  // Charts and Genres are removed as they are not directly supported by Saavn API
  // { name: 'Charts', to: '/charts', icon: BsBarChartLine, altIcon: BsFillBarChartLineFill },
  // { name: 'Genres', to: '/genres', icon: MdOutlineLibraryMusic, altIcon: MdLibraryMusic },
];

export const secondLinks = [
  { name: "Editor's Pick", to: '/editors-pick', icon: MdOutlineFeaturedPlayList, altIcon: MdFeaturedPlayList, color: 'text-green-400', bgFrom: 'from-green-200', bgTo: 'to-green-500' }, // Moved to the top
  { name: 'Playlist', to: '/playlists', icon: RiPlayListFill, altIcon: RiPlayListLine, color: 'text-purple-400', bgFrom: 'from-purple-200', bgTo: 'to-purple-500' },
  { name: 'Favorites', to: '/favorites', icon: AiFillHeart , altIcon: AiOutlineHeart, color: 'text-red-400', bgFrom: 'from-red-200', bgTo: 'to-red-500' }
]

export const categories = [
  // Categories are simplified as Saavn API primarily returns songs
  { name: 'song', to: 'songs', desc: "View songs that are toping the charts" },
  // 'album', 'artist', 'radio' categories are removed for now
];