import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

// Create context for player functionality
const PlayerContext = createContext();

// Custom hook to use the player context
export const usePlayerContext = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);
    const [volume, setVolume] = useState(0.7);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [repeat, setRepeat] = useState(false); // false, true, 'one'
    const [shuffle, setShuffle] = useState(false);
    const [loadingTrack, setLoadingTrack] = useState(false);
    const [error, setError] = useState(null);
    const [playbackQuality, setPlaybackQuality] = useState('high'); // high, medium, low
    const audioElement = useRef(null);
    const playbackRetries = useRef(0);
    const maxRetries = 3;

    // Initialize audio element with event listeners
    useEffect(() => {
        audioElement.current = new Audio();
        audioElement.current.volume = volume;
        audioElement.current.preload = "auto";

        const handleTimeUpdate = () => {
            setProgress(audioElement.current.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audioElement.current.duration);
            setLoadingTrack(false);
            // Reset retry counter on successful load
            playbackRetries.current = 0;
        };

        const handleEnded = () => {
            handleTrackEnd();
        };

        const handleError = (e) => {
            console.error('Audio error:', e);

            if (playbackRetries.current < maxRetries) {
                // Automatically retry a few times
                playbackRetries.current += 1;
                console.log(`Retrying playback (${playbackRetries.current}/${maxRetries})...`);

                // Short delay before retry
                setTimeout(() => {
                    if (audioElement.current && currentTrack) {
                        audioElement.current.load();
                        audioElement.current.play().catch(err => {
                            console.error('Retry failed:', err);
                            if (playbackRetries.current >= maxRetries) {
                                setError(`Failed to play "${currentTrack.name}". The track may be unavailable.`);
                                setIsPlaying(false);
                                setLoadingTrack(false);
                            }
                        });
                    }
                }, 1000);
            } else {
                setError(`Failed to play "${currentTrack?.name}". Try another track.`);
                setIsPlaying(false);
                setLoadingTrack(false);
            }
        };

        const handleCanPlay = () => {
            // If we were waiting for the track to be ready and it's supposed to be playing
            if (loadingTrack && isPlaying) {
                audioElement.current.play().catch(error => {
                    console.error('Error during canplay handler:', error);
                });
            }
        };

        audioElement.current.addEventListener('timeupdate', handleTimeUpdate);
        audioElement.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.current.addEventListener('ended', handleEnded);
        audioElement.current.addEventListener('error', handleError);
        audioElement.current.addEventListener('canplay', handleCanPlay);

        return () => {
            if (audioElement.current) {
                audioElement.current.pause();
                audioElement.current.src = '';
                audioElement.current.removeEventListener('timeupdate', handleTimeUpdate);
                audioElement.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audioElement.current.removeEventListener('ended', handleEnded);
                audioElement.current.removeEventListener('error', handleError);
                audioElement.current.removeEventListener('canplay', handleCanPlay);
            }
        };
    }, []);

    // Update volume when it changes
    useEffect(() => {
        if (audioElement.current) {
            audioElement.current.volume = volume;
        }
    }, [volume]);

    // Handle track changes
    useEffect(() => {
        if (!currentTrack) return;

        setError(null);
        setLoadingTrack(true);
        playbackRetries.current = 0;

        if (audioElement.current) {
            // Use download_url for tracks
            if (currentTrack.download_url) {
                // Add a cache-busting parameter to avoid caching issues
                const cacheBuster = `?cb=${Date.now()}`;
                audioElement.current.src = `${currentTrack.download_url}${cacheBuster}`;
                audioElement.current.load(); // Explicitly load the new source
                setProgress(0);
                setDuration(0);

                if (isPlaying) {
                    const playPromise = audioElement.current.play();

                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.error('Error playing audio:', error);

                            // Handle common autoplay restrictions
                            if (error.name === 'NotAllowedError') {
                                setError('Playback blocked by browser. Click play to continue.');
                                setIsPlaying(false);
                            } else {
                                setError(`Failed to play "${currentTrack.name}". The track may be unavailable.`);
                                setIsPlaying(false);
                            }
                            setLoadingTrack(false);
                        });
                    }
                }
            } else {
                setError(`No playable audio found for "${currentTrack.name}"`);
                setIsPlaying(false);
                setLoadingTrack(false);
            }
        }
    }, [currentTrack]);

    // Handle play/pause state changes
    useEffect(() => {
        if (audioElement.current) {
            if (isPlaying) {
                const playPromise = audioElement.current.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Error playing audio:', error);

                        // Better handling of different error types
                        if (error.name === 'NotAllowedError') {
                            setError('Browser blocked autoplay. Click play to continue.');
                        } else {
                            setError('Playback failed. Try again or select another track.');
                        }
                        setIsPlaying(false);
                    });
                }
            } else {
                audioElement.current.pause();
            }
        }
    }, [isPlaying]);

    // Play a track function
    const playTrack = useCallback((track) => {
        // Clear any previous errors
        setError(null);

        if (!track.download_url) {
            setError(`Cannot play "${track.name}" - No audio available`);
            console.warn('Cannot play track - no URL available:', track.name);

            // If there are tracks in queue, try to play the next one
            if (queue.length > 0) {
                const nextTrack = queue[0];
                const newQueue = queue.slice(1);
                setQueue(newQueue);

                // Recursively try to play the next track
                playTrack(nextTrack);
                return;
            }
            return;
        }

        if (currentTrack) {
            // Add current track to history before changing
            setHistory(prev => [currentTrack, ...prev].slice(0, 20)); // Keep last 20 tracks
        }

        setCurrentTrack(track);
        setIsPlaying(true);
        setLoadingTrack(true);
    }, [currentTrack, queue]);

    const pauseTrack = () => {
        setIsPlaying(false);
    };

    const resumeTrack = () => {
        if (currentTrack && currentTrack.download_url) {
            setIsPlaying(true);
        } else if (currentTrack) {
            setError(`Cannot resume "${currentTrack.name}" - No audio available`);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            resumeTrack();
        }
    };

    const seekTo = (time) => {
        if (audioElement.current) {
            audioElement.current.currentTime = time;
            setProgress(time);
        }
    };

    const handleTrackEnd = () => {
        if (repeat === 'one' && currentTrack) {
            // Repeat the current track
            audioElement.current.currentTime = 0;
            audioElement.current.play().catch(error => {
                console.error('Error replaying track:', error);
                setIsPlaying(false);
                setError('Failed to repeat track. Try playing it again.');
            });
            return;
        }

        if (queue.length > 0) {
            // Play next track from queue
            const nextTrack = queue[0];
            const newQueue = queue.slice(1);
            setQueue(newQueue);
            playTrack(nextTrack);
        } else if (repeat === true && currentTrack) {
            // Add current track back to queue if repeat all is enabled
            setHistory(prev => [currentTrack, ...prev].slice(0, 20));
            setCurrentTrack(currentTrack);
            audioElement.current.currentTime = 0;
            audioElement.current.play().catch(error => {
                console.error('Error replaying track:', error);
                setIsPlaying(false);
                setError('Failed to repeat playlist. Try playing again.');
            });
        } else {
            setIsPlaying(false);
            setProgress(0);
        }
    };

    const addToQueue = (track) => {
        setQueue(prev => [...prev, track]);
    };

    // Add a track to be played next
    const addNextInQueue = (track) => {
        setQueue(prev => [track, ...prev]);
    };

    const removeFromQueue = (index) => {
        setQueue(prev => prev.filter((_, i) => i !== index));
    };

    const skipNext = () => {
        if (queue.length > 0) {
            const nextTrack = queue[0];
            const newQueue = queue.slice(1);

            if (currentTrack) {
                setHistory(prev => [currentTrack, ...prev].slice(0, 20));
            }

            setQueue(newQueue);
            playTrack(nextTrack);
        }
    };

    const skipPrevious = () => {
        if (history.length > 0) {
            const prevTrack = history[0];
            const newHistory = history.slice(1);

            if (currentTrack) {
                setQueue(prev => [currentTrack, ...prev]);
            }

            setHistory(newHistory);
            playTrack(prevTrack);
        } else if (audioElement.current && progress > 3) {
            // If no history but playing for more than 3 seconds, restart the current track
            audioElement.current.currentTime = 0;
            setProgress(0);
        }
    };

    const clearQueue = () => {
        setQueue([]);
    };

    const toggleRepeat = () => {
        // Toggle between three states: false -> true -> 'one' -> false
        if (repeat === false) {
            setRepeat(true);
        } else if (repeat === true) {
            setRepeat('one');
        } else {
            setRepeat(false);
        }
    };

    const toggleShuffle = () => {
        setShuffle(!shuffle);

        if (!shuffle && queue.length > 1) {
            // Shuffle the queue
            const shuffledQueue = [...queue];
            for (let i = shuffledQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
            }
            setQueue(shuffledQueue);
        }
    };

    const retryPlayback = () => {
        if (currentTrack && currentTrack.download_url) {
            setError(null);
            setIsPlaying(true);
            setLoadingTrack(true);
            playbackRetries.current = 0;

            // Try to reload and play the current track
            audioElement.current.load();
            audioElement.current.play().catch(error => {
                console.error('Error during retry:', error);
                setIsPlaying(false);
                setError('Still unable to play this track. Try another song.');
                setLoadingTrack(false);
            });
        }
    };

    const setAudioVolume = (newVolume) => {
        setVolume(newVolume);
    };

    // Calculate progress percentage for UI elements
    const calculateProgressPercentage = () => {
        if (!duration || !progress) return 0;
        return (progress / duration) * 100;
    };

    // Format time in mm:ss for UI display
    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                queue,
                history,
                volume,
                progress,
                duration,
                repeat,
                shuffle,
                loadingTrack,
                error,
                playbackQuality,
                playTrack,
                pauseTrack,
                resumeTrack,
                togglePlayPause,
                seekTo,
                addToQueue,
                addNextInQueue,
                removeFromQueue,
                skipNext,
                skipPrevious,
                clearQueue,
                setVolume: setAudioVolume,
                toggleRepeat,
                toggleShuffle,
                retryPlayback,
                setPlaybackQuality,
                calculateProgressPercentage,
                formatTime,
                currentTrackIndex: queue.findIndex(track => track?.id === currentTrack?.id)
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

// Export a more specific Queue context hook for components that only need queue operations
export const useQueue = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('useQueue must be used within a PlayerProvider');
    }
    return context;
};

export default PlayerProvider;