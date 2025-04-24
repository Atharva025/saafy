import { useQueue } from '../context/QueueContext';
import { Play, MoreHorizontal, Plus, Music, ListPlus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePlaylist } from '../context/PlaylistContext';
import PlaylistModal from './PlaylistModal';

function TrackList({ tracks, emptyMessage = "No tracks found." }) {
    const { playTrack, addToQueue, addNextInQueue, currentTrack, isPlaying } = useQueue();
    const [activeTrackId, setActiveTrackId] = useState(null);
    const [showDropdown, setShowDropdown] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);

    if (!tracks || tracks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center"
            >
                <Music size={32} className="mx-auto mb-3 text-gray-400 dark:text-gray-500 opacity-40" />
                <p className="text-gray-600 dark:text-gray-400 mb-1">{emptyMessage}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Try searching for something else</p>
            </motion.div>
        );
    }

    // Format track duration from ms to MM:SS
    const formatDuration = (ms) => {
        if (!ms) return "0:00";
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    // Handle dropdown toggle
    const toggleDropdown = (trackId) => {
        setShowDropdown(showDropdown === trackId ? null : trackId);
    };

    // Close dropdown when clicking outside
    const closeDropdown = () => {
        setShowDropdown(null);
    };

    const handleAddToPlaylist = (track) => {
        setSelectedTrack(track);
        setShowPlaylistModal(true);
        closeDropdown();
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {tracks.map((track, index) => {
                    const isCurrentTrackPlaying = currentTrack?.id === track.id && isPlaying;
                    const isActiveTrack = currentTrack?.id === track.id;

                    return (
                        <motion.li
                            key={`${track.id}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`flex items-center p-3 border-2 border-transparent hover:border-gray-200/80 dark:hover:border-gray-600/80 group 
                                ${isActiveTrack ? 'bg-gray-50/70 dark:bg-gray-750/70 border-l-indigo-500 dark:border-l-indigo-400' : ''}
                            `}
                            onMouseEnter={() => setActiveTrackId(track.id)}
                            onMouseLeave={() => setActiveTrackId(null)}
                        >
                            <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden mr-3 relative">
                                {track.album.images[0]?.url ? (
                                    <>
                                        <img
                                            src={track.album.images[0]?.url}
                                            alt={track.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />

                                        {/* Play overlay */}
                                        <div
                                            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center ${activeTrackId === track.id && !isCurrentTrackPlaying ? 'opacity-100' : 'opacity-0'
                                                } group-hover:opacity-100 transition-opacity`}
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => playTrack(track)}
                                                className="text-white hover:text-indigo-500 transition-colors"
                                            >
                                                <Play size={22} fill="currentColor" />
                                            </motion.button>
                                        </div>

                                        {/* Now playing indicator */}
                                        {isCurrentTrackPlaying && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    {[...Array(4)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1 h-4 bg-white rounded-full"
                                                            animate={{
                                                                height: [4, 12, 4],
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                delay: i * 0.15,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Accent border for active track */}
                                        {isActiveTrack && (
                                            <motion.div
                                                layoutId="activeTrackIndicator"
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                        <Music size={20} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className={`font-medium truncate ${isActiveTrack ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {track.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {track.artists.map(artist => artist.name).join(', ')}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 ml-4 mr-6 hidden md:block">
                                {formatDuration(track.duration_ms)}
                            </div>

                            <div
                                className={`flex items-center ml-auto ${activeTrackId === track.id ? 'opacity-100' : 'opacity-0'
                                    } group-hover:opacity-100 transition-opacity`}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleAddToPlaylist(track)}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all rounded-full"
                                    title="Add to playlist"
                                >
                                    <Heart size={16} />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => addNextInQueue(track)}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all rounded-full"
                                    title="Play next"
                                >
                                    <ListPlus size={16} />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => addToQueue(track)}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all rounded-full ml-1"
                                    title="Add to queue"
                                >
                                    <Plus size={16} />
                                </motion.button>

                                <div className="relative ml-1">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleDropdown(track.id)}
                                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all rounded-full"
                                        title="More options"
                                    >
                                        <MoreHorizontal size={16} />
                                    </motion.button>

                                    {/* Dropdown menu */}
                                    <AnimatePresence>
                                        {showDropdown === track.id && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md z-10 py-1 border border-gray-100 dark:border-gray-700"
                                                >
                                                    <ul>
                                                        <li>
                                                            <button
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors flex items-center text-gray-700 dark:text-gray-300"
                                                                onClick={() => {
                                                                    playTrack(track);
                                                                    closeDropdown();
                                                                }}
                                                            >
                                                                <Play size={14} className="mr-2" />
                                                                Play now
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors flex items-center text-gray-700 dark:text-gray-300"
                                                                onClick={() => {
                                                                    addNextInQueue(track);
                                                                    closeDropdown();
                                                                }}
                                                            >
                                                                <ListPlus size={14} className="mr-2" />
                                                                Play next
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors flex items-center text-gray-700 dark:text-gray-300"
                                                                onClick={() => {
                                                                    addToQueue(track);
                                                                    closeDropdown();
                                                                }}
                                                            >
                                                                <Plus size={14} className="mr-2" />
                                                                Add to queue
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors flex items-center text-gray-700 dark:text-gray-300"
                                                                onClick={() => handleAddToPlaylist(track)}
                                                            >
                                                                <Heart size={14} className="mr-2" />
                                                                Add to playlist
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-0"
                                                    onClick={closeDropdown}
                                                />
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>

            {/* Playlist Modal */}
            {selectedTrack && (
                <PlaylistModal
                    isOpen={showPlaylistModal}
                    onClose={() => {
                        setShowPlaylistModal(false);
                        setSelectedTrack(null);
                    }}
                    track={selectedTrack}
                    mode="add"
                />
            )}
        </motion.div>
    );
}

export default TrackList;