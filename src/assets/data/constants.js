import { AiOutlineHome, AiFillHome, AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BsBarChartLine, BsFillBarChartLineFill } from 'react-icons/bs'
import { MdLibraryMusic, MdOutlineLibraryMusic, MdOutlineFeaturedPlayList, MdFeaturedPlayList, MdRadio, MdOutlineRadio, MdPersonOutline } from 'react-icons/md';
import { RiPlayListFill, RiPlayListLine } from "react-icons/ri";
import { FaUserAlt, FaGlobe } from 'react-icons/fa';

export const links = [
  { name: 'Home', to: '/', icon: AiOutlineHome, altIcon: AiFillHome },
];

export const secondLinks = [
  { name: "Featured", to: '/editors-pick', icon: MdOutlineFeaturedPlayList, altIcon: MdFeaturedPlayList, color: 'text-green-400', bgFrom: 'from-green-200', bgTo: 'to-green-500' },
  { name: 'Radio', to: '/radio', icon: MdOutlineRadio, altIcon: MdRadio, color: 'text-blue-400', bgFrom: 'from-blue-200', bgTo: 'to-blue-500' },
  { name: 'Playlist', to: '/playlists', icon: RiPlayListFill, altIcon: RiPlayListLine, color: 'text-purple-400', bgFrom: 'from-purple-200', bgTo: 'to-purple-500' },
  { name: 'Favorites', to: '/favorites', icon: AiFillHeart , altIcon: AiOutlineHeart, color: 'text-red-400', bgFrom: 'from-red-200', bgTo: 'to-red-500' },
  { name: 'Artists', to: '/artists', icon: MdPersonOutline, altIcon: FaUserAlt, color: 'text-yellow-400', bgFrom: 'from-yellow-200', bgTo: 'to-yellow-500' },
  { name: 'Language', to: '/language-settings', icon: FaGlobe, altIcon: FaGlobe, color: 'text-gray-400', bgFrom: 'from-gray-200', bgTo: 'to-gray-500' }
]

export const categories = [
  { name: 'song', to: 'songs', desc: "View songs that are toping the charts" },
];