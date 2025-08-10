import { BsDot } from "react-icons/bs"
import { Link } from "react-router-dom"
import { getSingleData } from '../../../utils/fetchData'; // Import getSingleData
import { artistImage as defaultArtistImage } from '../../../assets/images'; // Import default image

const Contributors = ({ contributors, text }) => {
  // Saavn API's primaryArtists is a string, not an array of contributors.
  // This component might not be fully functional with Saavn data.
  // For now, we'll just display the primary artist if available.
  if (!contributors || contributors.length === 0) return null;

  return contributors.map( (rawContributor, i) => {
    const contributor = getSingleData(rawContributor, 'artists'); // Normalize each contributor
    if (!contributor) return null; // Skip if normalization fails

    return (
      <Link key={i} to={`/artists/${contributor.id}`}>
        <div className="flex flex-row items-center ml-[-20px] opacity-80">
          <img 
            src={ contributor.image || defaultArtistImage } // Use normalized image URL or default
            alt={contributor.name}
            className={`relative shadow-md shadow-black/20 bottom-0 left-5 rounded-full h-full max-h-[30px] w-auto block`}
          />
          <p style={{ color: text }} className="relative text-base font-bold text-gray-200 ml-6">{contributor.name}</p>
          <BsDot size={20} style={{ color: text }} />
        </div>
      </Link>
    );
  });
}

export default Contributors