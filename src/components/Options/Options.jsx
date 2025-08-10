import { useState, useRef, useMemo, useEffect } from "react"; // Import useEffect
import { useLocation, useNavigate } from "react-router-dom";

import { options } from "../../utils/options";
import { filterOptions } from "../../utils/option";

import Option from './Option';
import OptionBtn from "./OptionBtn";
import { useDispatch } from "react-redux";
import { setNowPlaying } from "../../redux/features/playerSlice";

// Helper function to determine modal position based on button's location
const getModalStyle = (buttonRect, modalRef) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Get actual modal dimensions (or estimate if not yet rendered)
    // This might cause a slight flicker on first open as dimensions are 0 initially,
    // but it will correct itself on the next render.
    const modalWidth = modalRef.current ? modalRef.current.offsetWidth : 160; // min-w-[160px] from CSS
    const modalHeight = modalRef.current ? modalRef.current.offsetHeight : 200; // A reasonable estimate

    let top = buttonRect.y;
    let left = buttonRect.x + buttonRect.width + 5; // Default: to the right of the button + 5px padding

    // Check if there's more space to the left or right
    if (left + modalWidth > viewportWidth) {
        // Not enough space on the right, try left side
        left = buttonRect.x - modalWidth - 5;
        if (left < 0) { // If still off-screen to the left, align to left edge
            left = 5;
        }
    }

    // Check if there's more space above or below
    if (top + modalHeight > viewportHeight) {
        // Not enough space below, try above
        top = buttonRect.y - modalHeight;
        if (top < 0) { // If still off-screen to the top, align to top edge
            top = 5;
        }
    }

    return { top: `${top}px`, left: `${left}px` };
};

const Options = ({ type, small, song, artist, genre, album, radio, playlist, tracks, i, favorite, blacklist }) => {
    const { pathname } = useLocation();
    const dispatch = useDispatch();

    const filteredOptions = useMemo(() => filterOptions({ options, type, favorite, blacklist, isInPlaylistPath: /\/playlists\//.test(pathname) }), [pathname, blacklist, favorite, playlist]);

    const [showModal, setShowModal] = useState(false);
    const [buttonRect, setButtonRect] = useState({ x: 0, y: 0, width: 0, height: 0 }); // Store button's bounding rect

    const btnRef = useRef(null);
    const modalRef = useRef(null); // Ref for the modal content (ul)

    // Calculate modal style dynamically
    const modalStyle = useMemo(() => {
        if (!showModal || !buttonRect) return {};
        return getModalStyle(buttonRect, modalRef);
    }, [showModal, buttonRect]);

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
                <>
                    {/* Full-screen transparent overlay to catch clicks outside the modal */}
                    <div className="fixed inset-0 z-[9998] bg-transparent" onClick={closeModal} />
                    <ul
                        ref={modalRef}
                        // Removed animate-slowfade from here
                        onClick={(e) => e.stopPropagation()}
                        style={{ ...modalStyle, position: 'fixed' }} // Apply calculated style and ensure fixed position
                        className="shadow-xl overflow-hidden shadow-black/20 z-[9999] w-max flex-col text-gray-200 text-sm font-semibold rounded-[20px] bg-[#202020] min-w-[160px]"
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
                </>
            )}
        </div>
    )
}

export default Options