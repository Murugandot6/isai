import { logo } from "../../assets/images"

const Logo = () => {
  return (
    <div className="w-full flex flex-row gap-[5px] px-2 lg:justify-start justify-center items-center">
        <img src={logo} alt="logo" className="w-16"/>
    </div>
  )
}

export default Logo