import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const QueueContext = createContext();

export function QueueProvider({ children }) {
    // Queue state
    const [queue, setQueue] = useState([]);
    const [queueHistory, setQueueHistory] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Audio control state
    const [volume, setVolume] = useState(() => {
        const savedVolume = localStorage.getItem('harmony_volume');
        return savedVolume ? parseFloat(savedVolume) : 0.7;
    });
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    // Playback options
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
    const [shuffleMode, setShuffleMode] = useState(false);

    // Refs
    const audioRef = useRef(new Audio());
    const prevVolume = useRef(volume);
    const playbackFailCount = useRef(0);
    const maxRetries = 3;

    // Initialize audio element with event listeners
    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleDurationChange = () => {
            setDuration(audio.duration || 0);
            setIsLoading(false);
        };

        const handleEnded = () => {
            handleTrackEnd();
        };

        const handleError = (e) => {
            console.error("Audio playback error:", e);
            setHasError(true);

            if (playbackFailCount.current < maxRetries) {
                playbackFailCount.current++;
                console.log(`Retrying playback (${playbackFailCount.current}/${maxRetries})...`);

                // Try reloading the audio
                setTimeout(() => {
                    const currentTrack = queue[currentTrackIndex];
                    if (currentTrack && currentTrack.download_url) {
                        audio.src = `${currentTrack.download_url}?retry=${Date.now()}`;
                        audio.load();

                        if (isPlaying) {
                            audio.play().catch(err => {
                                console.error("Retry failed:", err);
                                if (playbackFailCount.current >= maxRetries) {
                                    toast.error("This track couldn't be played. Try another one.", {
                                        className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                                    });
                                    setIsPlaying(false);
                                    setIsLoading(false);
                                }
                            });
                        }
                    }
                }, 1000);
            } else {
                setIsPlaying(false);
                setIsLoading(false);
                toast.error("This track couldn't be played. Try another one.", {
                    className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                });
            }
        };

        const handleLoadStart = () => {
            setIsLoading(true);
            setHasError(false);
            playbackFailCount.current = 0;
        };

        const handleCanPlay = () => {
            setIsLoading(false);
            if (isPlaying) {
                audio.play().catch(err => {
                    console.error("Error in canplay handler:", err);
                });
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Save volume to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('harmony_volume', volume.toString());
    }, [volume]);

    // Update audio element when current track changes
    useEffect(() => {
        const audio = audioRef.current;
        const currentTrack = queue[currentTrackIndex];

        if (currentTrack && currentTrack.download_url) {
            setIsLoading(true);
            setHasError(false);

            // Only update if source has changed
            if (audio.src !== currentTrack.download_url) {
                // Add cache-busting parameter to avoid issues with cached audio
                audio.src = `${currentTrack.download_url}?t=${Date.now()}`;
                audio.load();
            }

            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error('Error playing track:', err);

                        // Handle autoplay restrictions specially
                        if (err.name === 'NotAllowedError') {
                            toast.error("Playback was blocked. Click play to continue.", {
                                className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                            });
                        }

                        setIsPlaying(false);
                        setIsLoading(false);
                    });
                }
            }
        } else if (audio.src) {
            audio.pause();
            audio.src = '';
            setCurrentTime(0);
            setDuration(0);
            setProgress(0);
            setIsLoading(false);
        }
    }, [currentTrackIndex, queue]);

    // Play/pause controls
    useEffect(() => {
        const audio = audioRef.current;

        if (isPlaying && audio.src) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error('Error playing track:', err);
                    setIsPlaying(false);
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Volume control
    useEffect(() => {
        audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    // Handle track ending
    const handleTrackEnd = useCallback(() => {
        if (repeatMode === 'one') {
            // Repeat current track
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
                console.error("Error repeating track:", err);
                setIsPlaying(false);
            });
            return;
        }

        if (currentTrackIndex < queue.length - 1) {
            // Play next track
            setCurrentTrackIndex(prev => prev + 1);
        } else if (repeatMode === 'all' && queue.length > 0) {
            // Loop back to first track
            setCurrentTrackIndex(0);
        } else {
            // End of queue, stop playback
            setIsPlaying(false);
        }
    }, [queue.length, currentTrackIndex, repeatMode]);

    // Add track to queue
    const addToQueue = useCallback((track) => {
        if (!track || !track.id) {
            console.error("Cannot add invalid track to queue:", track);
            return;
        }

        setQueue(prevQueue => [...prevQueue, track]);
        toast.success(`Added to queue: ${track.name}`, {
            className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        });

        // If this is the first track and nothing is playing, start playing it
        if (queue.length === 0 && currentTrackIndex === -1) {
            setCurrentTrackIndex(0);
            setIsPlaying(true);
        }
    }, [queue.length, currentTrackIndex]);

    // Add next in queue (play next)
    const addNextInQueue = useCallback((track) => {
        if (!track || !track.id) {
            console.error("Cannot add invalid track to queue:", track);
            return;
        }

        if (currentTrackIndex === -1 || queue.length === 0) {
            addToQueue(track);
            return;
        }

        setQueue(prevQueue => [
            ...prevQueue.slice(0, currentTrackIndex + 1),
            track,
            ...prevQueue.slice(currentTrackIndex + 1)
        ]);

        toast.success(`Playing next: ${track.name}`, {
            className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100",
            icon: '🎵'
        });
    }, [currentTrackIndex, queue.length, addToQueue]);

    // Play a specific track immediately
    const playTrack = useCallback((track) => {
        if (!track || !track.id) {
            console.error("Cannot play invalid track:", track);
            return;
        }

        const existingIndex = queue.findIndex(item => item.id === track.id);

        if (existingIndex !== -1) {
            // Track already in queue, just play it
            setCurrentTrackIndex(existingIndex);
            setIsPlaying(true);
            return;
        }

        // Add to queue and play immediately
        setQueue(prevQueue => [...prevQueue, track]);
        setCurrentTrackIndex(queue.length);
        setIsPlaying(true);
    }, [queue]);

    // Replace current queue with new tracklist and play selected track
    const playTracklist = useCallback((tracks, startIndex = 0) => {
        if (!tracks || !tracks.length) {
            console.error("Cannot play empty tracklist");
            return;
        }

        // Save current queue to history
        if (queue.length > 0) {
            setQueueHistory(prev => [...prev, queue].slice(-5)); // Keep last 5 queues
        }

        setQueue(tracks);
        setCurrentTrackIndex(startIndex);
        setIsPlaying(true);
    }, [queue]);

    // Remove from queue
    const removeFromQueue = useCallback((index) => {
        // Adjust currentTrackIndex if removing a track before it
        if (index < currentTrackIndex) {
            setCurrentTrackIndex(prevIndex => prevIndex - 1);
        }
        // If removing current track, pause and reset
        else if (index === currentTrackIndex) {
            setIsPlaying(false);
            if (queue.length === 1) {
                // If this was the last track
                setCurrentTrackIndex(-1);
            } else if (index === queue.length - 1) {
                // If this was the last track in the queue
                setCurrentTrackIndex(prevIndex => prevIndex - 1);
            }
            // Otherwise stay at the same index which will now point to the next track
        }

        setQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
    }, [currentTrackIndex, queue.length]);

    // Clear the queue
    const clearQueue = useCallback(() => {
        // Save current queue to history before clearing
        if (queue.length > 0) {
            setQueueHistory(prev => [...prev, queue].slice(-5)); // Keep last 5 queues
        }

        setQueue([]);
        setCurrentTrackIndex(-1);
        setIsPlaying(false);
    }, [queue.length]);

    // Restore previous queue
    const restorePreviousQueue = useCallback(() => {
        if (queueHistory.length > 0) {
            const previousQueue = queueHistory[queueHistory.length - 1];
            setQueue(previousQueue);
            setCurrentTrackIndex(0);
            setQueueHistory(prev => prev.slice(0, -1));
            toast.success("Previous queue restored", {
                className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            });
        } else {
            toast.error("No previous queue available", {
                className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            });
        }
    }, [queueHistory]);

    // Skip to next track
    const playNext = useCallback(() => {
        if (currentTrackIndex < queue.length - 1) {
            setCurrentTrackIndex(prevIndex => prevIndex + 1);
        } else if (repeatMode === 'all' && queue.length > 0) {
            // Loop back to first track if repeat all is enabled
            setCurrentTrackIndex(0);
        } else {
            // End of queue with no repeat
            toast.info("End of queue reached", {
                className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100",
                icon: '🎵'
            });
        }
    }, [currentTrackIndex, queue.length, repeatMode]);

    // Go to previous track
    const playPrevious = useCallback(() => {
        // Go to beginning of track if beyond 3 seconds, otherwise go to previous track
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
        } else if (currentTrackIndex > 0) {
            setCurrentTrackIndex(prevIndex => prevIndex - 1);
        } else if (repeatMode === 'all' && queue.length > 0) {
            // Loop to last track if repeat all is enabled
            setCurrentTrackIndex(queue.length - 1);
        } else {
            // Already at the first track
            audioRef.current.currentTime = 0;
        }
    }, [currentTrackIndex, queue.length, repeatMode]);

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        if (queue.length === 0) {
            toast.info("Add some tracks to your queue first", {
                className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            });
            return;
        }

        // If no track is selected but queue has tracks
        if (currentTrackIndex === -1 && queue.length > 0) {
            setCurrentTrackIndex(0);
            setIsPlaying(true);
            return;
        }

        setIsPlaying(prevState => !prevState);
    }, [queue.length, currentTrackIndex]);

    // Set volume (0-1)
    const setAudioVolume = useCallback((newVolume) => {
        setVolume(newVolume);
        if (isMuted && newVolume > 0) {
            setIsMuted(false);
        }
    }, [isMuted]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (!isMuted) {
            prevVolume.current = volume;
            setIsMuted(true);
        } else {
            setIsMuted(false);
            if (volume === 0) {
                setVolume(prevVolume.current || 0.7);
            }
        }
    }, [isMuted, volume]);

    // Handle seek/scrubbing
    const seek = useCallback((time) => {
        const audio = audioRef.current;
        if (!audio.src) return;

        audio.currentTime = time;
        setCurrentTime(time);
        if (audio.duration) {
            setProgress((time / audio.duration) * 100);
        }
    }, []);

    // Toggle repeat mode: off -> all -> one -> off
    const toggleRepeatMode = useCallback(() => {
        setRepeatMode(current => {
            switch (current) {
                case 'off': return 'all';
                case 'all': return 'one';
                case 'one': return 'off';
                default: return 'off';
            }
        });
    }, []);

    // Toggle shuffle mode and shuffle queue if turning on
    const toggleShuffleMode = useCallback(() => {
        setShuffleMode(current => {
            const newMode = !current;

            // If turning shuffle on, shuffle the remaining queue
            if (newMode && queue.length > currentTrackIndex + 1) {
                const currentTrack = queue[currentTrackIndex];
                const playedTracks = queue.slice(0, currentTrackIndex);
                const remainingTracks = queue.slice(currentTrackIndex + 1);

                // Shuffle remaining tracks
                for (let i = remainingTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [remainingTracks[i], remainingTracks[j]] = [remainingTracks[j], remainingTracks[i]];
                }

                // Reconstruct queue
                setQueue([...playedTracks, currentTrack, ...remainingTracks]);
            }

            return newMode;
        });
    }, [queue, currentTrackIndex]);

    // Format time for UI display (mm:ss)
    const formatTime = useCallback((timeInSeconds) => {
        if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, []);

    // Current playing track
    const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < queue.length
        ? queue[currentTrackIndex]
        : null;

    return (
        <QueueContext.Provider value={{
            // Queue state
            queue,
            queueHistory,
            currentTrackIndex,
            currentTrack,

            // Playback state
            isPlaying,
            isLoading,
            hasError,

            // Audio state
            volume,
            isMuted,
            currentTime,
            duration,
            progress,
            audioElement: audioRef.current,

            // Playback options
            repeatMode,
            shuffleMode,

            // Utility functions for UI
            formatTime,

            // Actions
            addToQueue,
            addNextInQueue,
            playTrack,
            playTracklist,
            removeFromQueue,
            clearQueue,
            restorePreviousQueue,
            playNext,
            playPrevious,
            togglePlayPause,
            setAudioVolume,
            toggleMute,
            seek,
            toggleRepeatMode,
            toggleShuffleMode
        }}>
            {children}
        </QueueContext.Provider>
    );
}

export const useQueue = () => useContext(QueueContext);

export default QueueProvider;