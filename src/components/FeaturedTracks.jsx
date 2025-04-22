import { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Play, Plus, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function FeaturedTracks({ tracks }) {
    const { playTrack, addToQueue, currentTrack, isPlaying: isPlayerPlaying } = useQueue();
    const [hoveredTrackId, setHoveredTrackId] = useState(null);

    if (!tracks || tracks.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isPlaying = isCurrentTrack && isPlayerPlaying;
                const isHovered = hoveredTrackId === track.id;

                return (
                    <motion.div
                        key={track.id}
                        className={`group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${isCurrentTrack ? 'ring-1 ring-indigo-500 dark:ring-indigo-400' : ''
                            }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.1 * index,
                            duration: 0.4,
                            type: 'spring',
                            stiffness: 100,
                            damping: 15
                        }}
                        onMouseEnter={() => setHoveredTrackId(track.id)}
                        onMouseLeave={() => setHoveredTrackId(null)}
                    >
                        <div className="relative aspect-square w-full overflow-hidden">
                            <motion.img
                                animate={{ scale: isHovered ? 1.08 : 1 }}
                                transition={{ type: 'tween', duration: 0.3 }}
                                src={track.album.images[0]?.url || ''}
                                alt={track.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />

                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playTrack(track);
                                                }}
                                                className="bg-indigo-500 text-white p-3 rounded-full shadow-lg"
                                                aria-label={isPlaying ? "Pause" : "Play"}
                                            >
                                                <Play size={18} fill="currentColor" className={isPlaying ? "ml-1" : "ml-0.5"} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToQueue(track);
                                                }}
                                                className="bg-white/90 text-indigo-500 p-3 rounded-full shadow-lg"
                                                aria-label="Add to queue"
                                            >
                                                <Plus size={18} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isCurrentTrack && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                >
                                    <Headphones size={16} />
                                </motion.div>
                            )}
                        </div>

                        <div className="p-4">
                            <motion.div
                                animate={{ y: isHovered ? -4 : 0 }}
                                transition={{ type: 'tween', duration: 0.3 }}
                            >
                                <h3 className={`font-medium truncate mb-1 ${isCurrentTrack ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {track.name}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                                    {track.artists.map(artist => artist.name).join(', ')}
                                </p>
                            </motion.div>
                        </div>

                        {/* Elegant gradient line along the bottom when hovered */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-emerald-400"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isHovered || isCurrentTrack ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ transformOrigin: 'left' }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}

export default FeaturedTracks;