import { BsDot } from "react-icons/bs"
import { Link } from "react-router-dom"

const Contributors = ({ contributors, text }) => {
  // Saavn API's primaryArtists is a string, not an array of contributors.
  // This component might not be fully functional with Saavn data.
  // For now, we'll just display the primary artist if available.
  if (!contributors || contributors.length === 0) return null;

  return contributors.map( (contributor, i) => (
    <Link key={i} to={`/artists/${contributor.id}`}>
      <div className="flex flex-row items-center ml-[-20px] opacity-80">
        <img 
          src={ contributor.image?.[0]?.link } // Assuming Saavn artist object has an image array
          alt="artist" 
          className={`relative shadow-md shadow-black/20 bottom-0 left-5 rounded-full h-full max-h-[30px] w-auto block`}
        />
        <p style={{ color: text }} className="relative text-base font-bold text-gray-200 ml-6">{contributor.name}</p>
        <BsDot size={20} style={{ color: text }} />
      </div>
    </Link>
  ))
}

export default Contributors