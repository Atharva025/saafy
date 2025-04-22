import { useQueue } from '../context/QueueContext';
import { SkipBack, Play, Pause, SkipForward, Music, List, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WaveView from './WaveView';
import { useState } from 'react';

function PlayerControls({ focusMode, toggleQueue }) {
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        playNext,
        playPrevious,
        currentTime,
        duration,
        progress,
        seek
    } = useQueue();

    const [isLiked, setIsLiked] = useState(false);

    // Format time in mm:ss
    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Handle seekbar change
    const handleSeek = (e) => {
        const seekTime = parseFloat(e.target.value);
        seek(seekTime);
    };

    // Handle liking tracks
    const toggleLike = () => {
        setIsLiked(!isLiked);
    };

    if (!currentTrack) {
        return (
            <motion.div
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
                <div className="flex justify-center items-center h-20 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                        <Music size={24} className="mb-2 opacity-60" />
                        <span className="text-sm">Select a track to start listening</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 ${focusMode ? 'bg-opacity-90 backdrop-blur-md dark:bg-opacity-90' : ''
                }`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 relative">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400"
                    style={{ width: `${progress}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                />
            </div>

            {/* Player controls layout */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3">
                {/* Track info section */}
                <div className="flex items-center w-full md:w-1/4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`cover-${currentTrack.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="w-14 h-14 rounded-md overflow-hidden shadow-md mr-4 flex-shrink-0 relative group"
                        >
                            {currentTrack.album.images[0]?.url ? (
                                <>
                                    <img
                                        src={currentTrack.album.images[0]?.url}
                                        alt={currentTrack.name}
                                        className="w-full h-full object-cover transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={togglePlayPause}
                                            className="text-white"
                                        >
                                            {isPlaying ? (
                                                <Pause size={20} />
                                            ) : (
                                                <Play size={20} className="ml-0.5" />
                                            )}
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                    <Music size={20} className="text-gray-400 dark:text-gray-500" />
                                </div>
                            )}

                            {/* Album gradient reflection */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1/4 opacity-30"
                                style={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                                }}
                            ></div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`info-${currentTrack.id}`}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="font-medium truncate text-gray-800 dark:text-gray-100">{currentTrack.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {currentTrack.artists.map(artist => artist.name).join(', ')}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center gap-2 mt-1">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleLike}
                                className={`text-sm ${isLiked ? 'text-teal-400 dark:text-teal-300' : 'text-gray-400 dark:text-gray-500'}`}
                                title={isLiked ? "Unlike" : "Like"}
                            >
                                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400"
                                title="Share"
                            >
                                <Share2 size={14} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Main controls section */}
                <div className="flex flex-col items-center w-full md:w-2/4 px-4 mt-3 md:mt-0">
                    <div className="flex items-center gap-6 mb-3">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={playPrevious}
                            className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                            aria-label="Previous track"
                        >
                            <SkipBack size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePlayPause}
                            className={`p-3 rounded-full shadow-md relative text-white ${isPlaying ? 'bg-gradient-to-r from-indigo-500 to-teal-400' : 'bg-indigo-500'
                                }`}
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {/* Subtle glow effect when playing */}
                            {isPlaying && (
                                <motion.div
                                    className="absolute inset-0 rounded-full opacity-30"
                                    animate={{
                                        boxShadow: ['0 0 0px #3b82f6', '0 0 8px #3b82f6', '0 0 0px #3b82f6']
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "loop"
                                    }}
                                />
                            )}

                            {isPlaying ? (
                                <Pause size={22} />
                            ) : (
                                <Play size={22} className="ml-0.5" />
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={playNext}
                            className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                            aria-label="Next track"
                        >
                            <SkipForward size={20} />
                        </motion.button>
                    </div>

                    <div className="w-full flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(currentTime)}</span>

                        <div className="flex-1 relative group">
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                step="1"
                                value={currentTime || 0}
                                onChange={handleSeek}
                                className="w-full h-1 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 focus:outline-none"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 ${progress}%, #e5e7eb ${progress}%)`
                                }}
                                aria-label="Seek"
                            />
                        </div>

                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right side controls */}
                <div className="flex items-center justify-end w-full md:w-1/4 mt-3 md:mt-0">
                    <div className="mr-4 hidden md:block">
                        <WaveView isPlaying={isPlaying} />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleQueue}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        aria-label="Show queue"
                    >
                        <List size={18} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

export default PlayerControls;