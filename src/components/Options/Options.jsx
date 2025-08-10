import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { options } from "../../utils/options";
import { filterOptions } from "../../utils/option";

import Option from './Option';
import OptionBtn from "./OptionBtn";
import { useDispatch } from "react-redux";
import { setNowPlaying } from "../../redux/features/playerSlice";

// Helper function to determine modal position based on button's location
const calculateModalPosition = (buttonRect, modalWidth, modalHeight) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = buttonRect.y + buttonRect.height + 5; // Default: below the button, with a small gap
    let left = buttonRect.x + 5; // Default: aligned with the left of the button, with a small gap

    // Horizontal adjustment
    if (left + modalWidth > viewportWidth) {
        // If it goes off the right, try placing it to the left of the button
        left = buttonRect.x - modalWidth - 5;
        if (left < 0) {
            // If it still goes off the left, clamp to the right edge of the viewport
            left = viewportWidth - modalWidth - 5;
            if (left < 5) left = 5; // Ensure minimum padding from left edge
        }
    }

    // Vertical adjustment
    if (top + modalHeight > viewportHeight) {
        // If it goes off the bottom, try placing it above the button
        top = buttonRect.y - modalHeight - 5;
        if (top < 0) {
            // If it still goes off the top, clamp to the top edge of the viewport
            top = 5; // Ensure minimum padding from top edge
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
    const [modalPosition, setModalPosition] = useState({ top: '0px', left: '0px' }); // New state for modal position

    const btnRef = useRef(null);
    const modalRef = useRef(null); // Ref for the modal content (ul)

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
        setShowModal(true); // Show the modal first
    }

    function closeModal() {
        setShowModal(false);
    }

    // Effect to calculate position AFTER modal is rendered and its dimensions are available
    useEffect(() => {
        if (showModal && modalRef.current && buttonRect.width > 0) { // Ensure buttonRect is also set
            const calculatedPosition = calculateModalPosition(
                buttonRect,
                modalRef.current.offsetWidth,
                modalRef.current.offsetHeight
            );
            setModalPosition(calculatedPosition);
        }
    }, [showModal, buttonRect]); // Re-run when modal visibility or button position changes

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
                    <div className="fixed inset-0 z-[999998] bg-transparent" onClick={closeModal} />
                    <ul
                        ref={modalRef}
                        onClick={(e) => e.stopPropagation()}
                        style={{ ...modalPosition, position: 'fixed', transition: 'top 0.2s ease-out, left 0.2s ease-out' }} // Apply calculated style and ensure fixed position
                        className="shadow-xl overflow-hidden shadow-black/20 z-[999999] w-max flex-col text-gray-200 text-sm font-semibold rounded-[20px] bg-[#202020] min-w-[160px]"
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

export default Options;