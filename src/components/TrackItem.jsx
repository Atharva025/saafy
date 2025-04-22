import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Music, Headphones } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

function TrackItem({ track, index }) {
    const { currentTrack, playTrack, addToQueue, isPlaying } = useQueue();
    const [isHovered, setIsHovered] = useState(false);

    const isCurrentTrack = currentTrack?.id === track.id;
    const formattedDuration = formatTime(track.duration_ms / 1000);

    // Format time in mm:ss
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isCurrentTrack ? 'bg-gray-50 dark:bg-gray-800' : ''
                } transition-colors group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center flex-1 min-w-0 gap-3">
                <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden relative">
                    {track.album.images[0]?.url ? (
                        <img
                            src={track.album.images[0]?.url}
                            alt={track.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Music size={16} className="text-gray-400 dark:text-gray-500" />
                        </div>
                    )}

                    {isHovered && !isCurrentTrack && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => playTrack(track)}
                                className="bg-indigo-500 text-white p-2 rounded-full shadow-md"
                            >
                                <Play size={16} fill="currentColor" className="ml-0.5" />
                            </motion.button>
                        </div>
                    )}

                    {isCurrentTrack && isPlaying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40"
                        >
                            <div className="flex items-center gap-0.5">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 h-4 bg-white rounded-full"
                                        animate={{
                                            scaleY: [0.4, 0.7 + Math.random() * 0.3, 0.4],
                                            backgroundColor: i === 1 ? '#4ade80' : '#6366f1'
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1 + Math.random() * 0.5,
                                            ease: 'easeInOut'
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {isCurrentTrack && !isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                            <Headphones size={16} className="text-white" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h4 className={`font-medium truncate ${isCurrentTrack ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-100'
                        }`}>
                        {track.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <span className="text-xs hidden sm:block">{formattedDuration}</span>

                {!isCurrentTrack && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToQueue(track)}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hidden sm:flex"
                        title="Add to queue"
                    >
                        <Plus size={16} />
                    </motion.button>
                )}

                {isCurrentTrack && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 p-1 rounded-full"
                    >
                        <motion.div
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Music size={14} />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default TrackItem;