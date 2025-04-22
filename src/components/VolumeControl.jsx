import { useState, useEffect } from 'react';
import { useQueue } from '../context/QueueContext';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

function VolumeControl() {
    const { volume, setAudioVolume } = useQueue();
    const [previousVolume, setPreviousVolume] = useState(0.7);
    const [isDragging, setIsDragging] = useState(false);

    // Handle volume change from slider
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setAudioVolume(newVolume);
    };

    // Mute/unmute toggle
    const toggleMute = () => {
        if (volume > 0) {
            setPreviousVolume(volume);
            setAudioVolume(0);
        } else {
            setAudioVolume(previousVolume);
        }
    };

    // Get appropriate volume icon based on current level
    const getVolumeIcon = () => {
        if (volume === 0) {
            return <VolumeX size={16} />;
        } else if (volume < 0.3) {
            return <Volume size={16} />;
        } else if (volume < 0.7) {
            return <Volume1 size={16} />;
        } else {
            return <Volume2 size={16} />;
        }
    };

    // Handle dragging state
    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    // Add global mouse-up listener for edge cases
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Volume</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(volume * 100)}%
                </span>
            </div>

            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMute}
                    className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${volume === 0
                        ? 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                        : 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        }`}
                    aria-label={volume === 0 ? "Unmute" : "Mute"}
                >
                    {getVolumeIcon()}
                </motion.button>

                <div className="flex-1 relative group">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        className="w-full h-1 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 focus:outline-none"
                        style={{
                            background: `linear-gradient(to right, #6366f1 ${volume * 100}%, #e5e7eb ${volume * 100}%)`
                        }}
                        aria-label="Volume"
                    />

                    {/* Hoverable volume thumb */}
                    <div
                        className={`absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-indigo-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            } transition-opacity shadow-md`}
                        style={{
                            left: `calc(${volume * 100}% - 8px)`,
                        }}
                    />
                </div>
            </div>

            {/* Volume level icons - using Tailwind to create the bars */}
            <div className="flex justify-between mt-1.5 px-1">
                <div className="flex items-end gap-0.5">
                    <div className="w-1 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-60"></div>
                    <div className="w-1 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-40"></div>
                </div>
                <div className="flex items-end gap-0.5">
                    <div className="w-1 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-40"></div>
                    <div className="w-1 h-4 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-60"></div>
                    <div className="w-1 h-5 bg-gray-400 dark:bg-gray-500 rounded-sm opacity-80"></div>
                </div>
            </div>

            {/* Dynamic volume note for accessibility */}
            <div
                className={`text-xs text-indigo-500 dark:text-indigo-400 mt-2 text-center transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {volume === 0 ? 'Muted' :
                    volume < 0.3 ? 'Low volume' :
                        volume < 0.7 ? 'Medium volume' :
                            'High volume'}
            </div>
        </div>
    );
}

export default VolumeControl;