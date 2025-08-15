import { useLocation } from "react-router-dom";
import Logo from "./Logo";
import Links from "./Links";
import SecondLinks from "./SecondLinks";
import Footer from "./Footer";
import { links, secondLinks } from "../../assets/data/constants";


const NavLinks = ({ isMobileSidebar = false }) => { // New prop
    const { pathname } = useLocation()

    return (
        <div className={`${isMobileSidebar ? 'block h-full' : 'row-span-2 sticky top-2 left-0 z-[10] lg:block hidden h-[calc(100vh-16px)]'}`}>
            <nav className="h-full flex flex-col gap-4 pt-10 pb-4 px-2 bg-[#151515bd] rounded-[15px] border border-white/5 shadow shadow-black/30">
                <Logo />
                <ul className="mt-6 flex-1 flex flex-col gap-1">
                    {
                        links.map((item, index) => (
                            <Links
                                key={index}
                                active={((new RegExp(item.to, 'i')).test(pathname || '') && item.to !== '/') || ((!(/(genres|charts|playlist|favorites)/i).test(pathname)) && item.to === '/')}
                                link={item}
                                isMobileSidebar={isMobileSidebar}
                            />
                        ))
                    }
                    {
                        secondLinks.map((secondLink, index) => (
                            <SecondLinks 
                                key={index} 
                                link={secondLink} 
                                active={(new RegExp(secondLink.to, 'i')).test(pathname)} 
                                isMobileSidebar={isMobileSidebar}
                            />
                        ))
                    }
                </ul>
                <Footer />
            </nav>
        </div>
    )
};

export default NavLinks