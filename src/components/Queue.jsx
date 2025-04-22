import { useQueue } from '../context/QueueContext';
import { X, Music, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Queue() {
    const { queue, currentTrackIndex, playTrack, removeFromQueue, clearQueue } = useQueue();

    if (queue.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center relative overflow-hidden">
                <div className="relative mb-5">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                    >
                        <Clock size={36} className="text-indigo-500 dark:text-indigo-400 opacity-30 mx-auto" />
                    </motion.div>
                    <motion.div
                        className="absolute -top-1 -right-1/2 transform translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 text-xs font-bold"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        0
                    </motion.div>
                </div>
                <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-100">Your queue is empty</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] mx-auto">
                    Find songs you love and add them to your listening queue
                </p>
                <motion.div
                    className="mt-4 w-full h-[1px]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{
                        background: 'linear-gradient(to right, #6366f1, #2dd4bf)',
                        transformOrigin: 'center'
                    }}
                />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                    <Clock size={16} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Queue</h3>
                    <motion.div
                        className="ml-2 px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-xs font-medium"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        key={queue.length}
                    >
                        {queue.length}
                    </motion.div>
                </div>

                <button
                    onClick={clearQueue}
                    className="text-sm flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    title="Clear queue"
                >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline text-xs">Clear</span>
                </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                <AnimatePresence initial={false}>
                    <ul>
                        {queue.map((track, index) => {
                            const isCurrentTrack = index === currentTrackIndex;

                            return (
                                <motion.li
                                    key={`${track.id}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{
                                        opacity: 0,
                                        x: 20,
                                        transition: { duration: 0.2 }
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05
                                    }}
                                    className={`flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 ${isCurrentTrack ? 'bg-gray-50 dark:bg-gray-750' : ''
                                        }`}
                                >
                                    <div
                                        className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden cursor-pointer relative group"
                                        onClick={() => playTrack(track)}
                                    >
                                        {track.album.images[0]?.url ? (
                                            <>
                                                <img
                                                    src={track.album.images[0]?.url}
                                                    alt={track.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-white"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 5.14v14l11-7-11-7z" />
                                                        </svg>
                                                    </motion.div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                                <Music size={14} className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}

                                        {isCurrentTrack && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"
                                                layoutId="currentTrackIndicator"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 ml-3">
                                        <div
                                            className={`text-sm font-medium truncate cursor-pointer transition-colors ${isCurrentTrack
                                                ? 'text-indigo-500 dark:text-indigo-400'
                                                : 'text-gray-800 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400'
                                                }`}
                                            onClick={() => playTrack(track)}
                                        >
                                            {track.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {track.artists.map(artist => artist.name).join(', ')}
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeFromQueue(index)}
                                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 ml-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        aria-label="Remove from queue"
                                    >
                                        <X size={14} />
                                    </motion.button>
                                </motion.li>
                            );
                        })}
                    </ul>
                </AnimatePresence>

                {queue.length > 5 && (
                    <div className="p-3 text-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {queue.length} tracks in queue
                        </span>
                    </div>
                )}
            </div>

            {/* Decorative corner accent */}
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full opacity-5"
                style={{
                    background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)'
                }}
            />
        </div>
    );
}

export default Queue;