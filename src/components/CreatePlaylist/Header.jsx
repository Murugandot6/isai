import { Link, useSearchParams } from "react-router-dom"

import { MdArrowBack } from "react-icons/md"
import { useMemo } from "react"

const Header = () => {
  const [params] = useSearchParams();
  const isImportPage = useMemo(() => params.get('import') === 'true', [params]);

  return (
    <div className="w-full flex items-center gap-3 mb-6">
      <Link to="/playlists" className='mt-[1px] flex justify-center items-center hover:text-gray-100 text-gray-300 text-xs rounded-md'>
        <MdArrowBack size={25} />
      </Link>
      <h3 className="flex-1 text-white font-bold text-xl">{isImportPage ? 'Import playlist' : 'Create new playlist'}</h3>
    </div>
  )
}

export default Header