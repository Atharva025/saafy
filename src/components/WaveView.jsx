import { motion } from 'framer-motion';

function WaveView({ isPlaying, size = 'normal' }) {
    // Determine bar count based on size
    const barCount = size === 'large' ? 6 : size === 'small' ? 3 : 5;

    // Define height and width classes based on size
    const getBarSizeClasses = () => {
        switch (size) {
            case 'large': return 'h-5 w-1';
            case 'small': return 'h-3 w-0.5';
            default: return 'h-4 w-0.5';
        }
    };

    // Get gap spacing based on size
    const getGapClasses = () => {
        switch (size) {
            case 'large': return 'gap-1.5';
            case 'small': return 'gap-1';
            default: return 'gap-1';
        }
    };

    return (
        <div className={`flex items-center ${getGapClasses()}`}>
            {[...Array(barCount)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`${getBarSizeClasses()} rounded-full ${isPlaying ? 'bg-gradient-to-t from-indigo-500 to-teal-400' : 'bg-gray-400 dark:bg-gray-600'
                        }`}
                    animate={{
                        scaleY: isPlaying
                            ? [0.3, 0.7 + Math.random() * 0.4, 0.3]
                            : [0.2, 0.3, 0.2],
                        opacity: isPlaying ? [0.7, 1, 0.7] : [0.5, 0.6, 0.5]
                    }}
                    transition={{
                        duration: isPlaying ? (0.6 + Math.random() * 0.4) : 1.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.1,
                        ease: isPlaying ? "easeInOut" : "linear"
                    }}
                />
            ))}
        </div>
    );
}

export default WaveView;