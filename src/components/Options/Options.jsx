import { useState, useRef, useMemo, useEffect } from "react"; // Import useEffect
import { useLocation, useNavigate } from "react-router-dom";

import { options } from "../../utils/options";
import { filterOptions } from "../../utils/option";

import Option from './Option';
import OptionBtn from "./OptionBtn";
import { useDispatch } from "react-redux";
import { setNowPlaying } from "../../redux/features/playerSlice";

// Helper function to determine modal position based on button's location
const getModalPosition = (buttonRect) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Default to top-left if not enough space
    let verticalPos = 'top-0';
    let horizontalPos = 'left-[calc(100%+5px)]';

    // Check if there's more space below or above
    if (buttonRect.y > viewportHeight / 2) {
        verticalPos = 'bottom-0';
    }

    // Check if there's more space to the right or left
    if (buttonRect.x > viewportWidth / 2) {
        horizontalPos = 'right-[calc(100%+5px)]';
    }

    return `${verticalPos} ${horizontalPos}`;
};

const Options = ({ type, small, song, artist, genre, album, radio, playlist, tracks, i, favorite, blacklist }) => {
    const { pathname } = useLocation();
    const dispatch = useDispatch();

    const filteredOptions = useMemo(() => filterOptions({ options, type, favorite, blacklist, isInPlaylistPath: /\/playlists\//.test(pathname) }), [pathname, blacklist, favorite, playlist]);

    const [showModal, setShowModal] = useState(false);
    const [buttonRect, setButtonRect] = useState({ x: 0, y: 0, width: 0, height: 0 }); // Store button's bounding rect

    const btnRef = useRef(null);
    const modalRef = useRef(null);

    const modalPosition = useMemo(() => getModalPosition(buttonRect), [buttonRect]);

    const navigate = useNavigate();

    function handleOption(cbAction, values) {
        const navigateTo = cbAction(values);
        if (navigateTo) navigate(navigateTo);
        closeModal();
        dispatch(setNowPlaying(false));
    }

    function openModal() {
        if (!btnRef.current) return;

        const rect = btnRef.current.getBoundingClientRect();
        setButtonRect(rect); // Store the button's position
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
    }

    // Effect to handle clicks outside the modal
    useEffect(() => {
        const handleOutsideClick = (event) => {
            // If modal is shown and click is outside the modal and outside the button that opened it
            if (showModal && modalRef.current && !modalRef.current.contains(event.target) && btnRef.current && !btnRef.current.contains(event.target)) {
                closeModal();
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showModal]); // Dependency on showModal

    return (
        <div className="relative">
            <OptionBtn openModal={openModal} btnRef={btnRef} small={small} optionType={type} />
            {showModal && (
                // Full-screen transparent overlay to catch clicks outside the modal
                <div className="fixed inset-0 z-[9998] bg-transparent" onClick={closeModal}>
                    <ul
                        ref={modalRef}
                        // Prevent clicks inside the modal from propagating to the overlay
                        onClick={(e) => e.stopPropagation()}
                        style={{ top: buttonRect.y, left: buttonRect.x }} // Position relative to the button
                        className={`${modalPosition} absolute animate-slowfade shadow-xl overflow-hidden shadow-black/20 z-[9999] w-max flex-col text-gray-200 text-sm font-semibold rounded-[20px] bg-[#202020] min-w-[160px]`}
                    >
                        {
                            filteredOptions
                                .map((option, index) =>
                                    <Option
                                        key={index}
                                        option={option}
                                        handleOption={handleOption}
                                        song={song}
                                        artist={artist}
                                        album={album}
                                        genre={genre}
                                        playlist={playlist}
                                        radio={radio}
                                        tracks={tracks}
                                        i={i}
                                    />
                                )
                        }
                    </ul>
                </div>
            )}
        </div>
    )
}

export default Options