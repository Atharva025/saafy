import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import TrackList from './TrackList';
import FeaturedTracks from './FeaturedTracks';
import PlayerControls from './PlayerControls';
import Queue from './Queue';
import VolumeControl from './VolumeControl';
import { Music, Settings, Headphones, Search, Clock, Sparkles, X } from 'lucide-react';

function MusicPlayer() {
    const [searchResults, setSearchResults] = useState([]);
    const [artistTracks, setArtistTracks] = useState([]);
    const [currentArtist, setCurrentArtist] = useState(null);
    const [artistsList, setArtistsList] = useState([]);
    const [trendingTracks, setTrendingTracks] = useState([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);
    const [isLoadingArtistTracks, setIsLoadingArtistTracks] = useState(false);
    const [activeCategory, setActiveCategory] = useState('english');
    const [focusMode, setFocusMode] = useState(false);
    const [showQueue, setShowQueue] = useState(false);

    // Categories for music selection
    const categories = [
        { id: 'hindi', name: 'Hindi' },
        { id: 'english', name: 'English', icon: '🌟' },
        { id: 'punjabi', name: 'Punjabi' },
        { id: 'tamil', name: 'Tamil' },
        { id: 'telugu', name: 'Telugu' }
    ];

    // Format songs from API response
    const formatSongs = (songs) => {
        return songs.map(song => ({
            id: song.id,
            name: song.name,
            artists: song.artists && song.artists.primary
                ? song.artists.primary.map(artist => ({
                    id: artist.id,
                    name: artist.name,
                    url: artist.url,
                    image: artist.image && artist.image.length > 0 ? artist.image[1]?.url : ''
                }))
                : song.primaryArtists
                    ? song.primaryArtists.split(',').map(name => ({ name: name.trim() }))
                    : [{ name: 'Unknown Artist' }],
            album: {
                name: song.album?.name || 'Unknown Album',
                images: song.image ? [
                    { url: song.image[2]?.link || song.image[2]?.url || '' },
                    { url: song.image[1]?.link || song.image[1]?.url || '' },
                    { url: song.image[0]?.link || song.image[0]?.url || '' }
                ] : [{ url: '' }, { url: '' }, { url: '' }]
            },
            duration_ms: song.duration * 1000 || 0,
            download_url: song.downloadUrl && song.downloadUrl.length > 0
                ? song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url
                : null
        }));
    };

    // Load trending tracks on component mount or category change
    useEffect(() => {
        const loadTrendingTracks = async () => {
            try {
                setIsLoadingTrending(true);

                const searchTerms = {
                    hindi: 'bollywood hits',
                    english: 'pop hits',
                    punjabi: 'punjabi bhangra',
                    tamil: 'tamil hits',
                    telugu: 'telugu hits'
                };

                const searchTerm = searchTerms[activeCategory] || 'popular songs';
                const response = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(searchTerm)}`);

                if (response.data && response.data.data && response.data.data.results) {
                    const formattedSongs = formatSongs(response.data.data.results);
                    const playableTracks = formattedSongs.filter(track => track.download_url);
                    setTrendingTracks(playableTracks);
                } else {
                    setTrendingTracks([]);
                }
            } catch (error) {
                console.error('Error loading trending tracks:', error);
                setTrendingTracks([]);
            } finally {
                setIsLoadingTrending(false);
            }
        };

        loadTrendingTracks();
    }, [activeCategory]);

    // Extract unique artists from search results
    useEffect(() => {
        if (searchResults.length === 0) {
            setArtistsList([]);
            return;
        }

        const allArtists = searchResults.flatMap(track => track.artists)
            .filter(artist => artist.id && artist.image);

        const uniqueArtists = [];
        const artistIds = new Set();

        for (const artist of allArtists) {
            if (!artistIds.has(artist.id)) {
                artistIds.add(artist.id);
                uniqueArtists.push(artist);
            }
        }

        setArtistsList(uniqueArtists);
    }, [searchResults]);

    // Load artist tracks when currentArtist changes
    useEffect(() => {
        const loadArtistTracks = async () => {
            if (!currentArtist || !currentArtist.id) {
                setIsLoadingArtistTracks(false);
                setArtistTracks([]);
                return;
            }

            try {
                setIsLoadingArtistTracks(true);

                const response = await axios.get(`https://saavn.dev/api/artists/${currentArtist.id}/songs`);

                if (response.data && response.data.data && response.data.data.songs) {
                    const formattedSongs = formatSongs(response.data.data.songs);
                    const searchResultIds = searchResults.map(track => track.id);
                    const playableTracks = formattedSongs
                        .filter(track => track.download_url && !searchResultIds.includes(track.id))
                        .slice(0, 10);

                    setArtistTracks(playableTracks);
                } else {
                    setArtistTracks([]);
                }
            } catch (error) {
                console.error(`Error loading tracks for artist ${currentArtist.name}:`, error);
                setArtistTracks([]);
            } finally {
                setIsLoadingArtistTracks(false);
            }
        };

        if (currentArtist) {
            loadArtistTracks();
        }
    }, [currentArtist, searchResults]);

    const selectArtist = (artist) => {
        setCurrentArtist(artist);
    };

    const handleSearchResults = (results) => {
        setArtistTracks([]);
        setCurrentArtist(null);
        const playableTracks = results.filter(track => track.download_url);
        setSearchResults(playableTracks);
    };

    const toggleFocusMode = () => {
        setFocusMode(!focusMode);
    };

    const toggleQueue = () => {
        setShowQueue(!showQueue);
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${focusMode ? 'pb-24' : 'pb-36'}`}>
            <div className={`max-w-7xl mx-auto ${focusMode ? 'opacity-75 dark:opacity-60' : ''} transition-opacity duration-300`}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <header className="py-6 sm:py-8 relative">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center"
                            >
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">
                                    Saafy
                                </h1>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto mb-8"
                        >
                            <SearchBar onSearchResults={handleSearchResults} />
                        </motion.div>

                        {/* Elegant wave background element */}
                        <motion.div
                            className="absolute -z-10 top-0 right-0 opacity-10 text-indigo-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20,100 Q150,-50 300,120 T600,100" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M20,150 Q150,0 300,170 T600,150" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M20,200 Q150,50 300,220 T600,200" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </motion.div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-8">
                            {searchResults.length === 0 && (
                                <section>
                                    <motion.div
                                        className="mb-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category, index) => (
                                                <motion.button
                                                    key={category.id}
                                                    onClick={() => setActiveCategory(category.id)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category.id
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                >
                                                    {category.icon && <span className="mr-2">{category.icon}</span>}
                                                    {category.name}
                                                </motion.button>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center mt-8 mb-4">
                                            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Sparkles className="text-teal-400" size={20} />
                                                <span>
                                                    {categories.find(c => c.id === activeCategory)?.name || ''} Trending
                                                </span>
                                            </h2>
                                        </div>
                                    </motion.div>

                                    <AnimatePresence mode="wait">
                                        {isLoadingTrending ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col items-center justify-center min-h-[200px]"
                                            >
                                                <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
                                                <p className="text-indigo-500 dark:text-indigo-400">Discovering trending tracks...</p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="content"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {trendingTracks.length > 0 ? (
                                                    <div className="space-y-8">
                                                        <FeaturedTracks tracks={trendingTracks.slice(0, 3)} />

                                                        {trendingTracks.length > 3 && (
                                                            <div className="mt-6">
                                                                <div className="flex items-center mb-4">
                                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">More Tracks</h3>
                                                                    <div className="ml-auto">
                                                                        <div className="h-[1px] w-16 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                                                    </div>
                                                                </div>
                                                                <TrackList tracks={trendingTracks.slice(3)} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center">
                                                        <Music size={40} className="mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                                                        <p className="text-gray-600 dark:text-gray-400 mb-2">No tracks found.</p>
                                                        <p className="text-gray-500 dark:text-gray-500 text-sm">Try a different category or search for something specific.</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>
                            )}

                            {searchResults.length > 0 && (
                                <AnimatePresence>
                                    <motion.section
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        <div>
                                            <div className="flex items-center mb-4">
                                                <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                                    <Search className="text-teal-400" size={20} />
                                                    <span>Search Results</span>
                                                </h2>
                                                <div className="ml-4 text-indigo-500 dark:text-indigo-400 text-sm">
                                                    {searchResults.length} tracks found
                                                </div>
                                                <div className="ml-auto">
                                                    <button
                                                        className="text-indigo-500 dark:text-indigo-400 text-sm flex items-center hover:underline"
                                                        onClick={() => setSearchResults([])}
                                                    >
                                                        Clear results
                                                    </button>
                                                </div>
                                            </div>
                                            <TrackList tracks={searchResults} />
                                        </div>

                                        {artistsList.length > 0 && (
                                            <motion.div
                                                className="mt-10"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <div className="flex items-center mb-4">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                                        <Headphones size={18} className="text-teal-400" />
                                                        Artists
                                                    </h3>
                                                    <div className="ml-auto">
                                                        <div className="h-[1px] w-16 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                                    {artistsList.map((artist, index) => (
                                                        <motion.div
                                                            key={artist.id}
                                                            className={`rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all ${currentArtist?.id === artist.id
                                                                ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                                                                : ''
                                                                }`}
                                                            onClick={() => selectArtist(artist)}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.1 + index * 0.05 }}
                                                            whileHover={{ y: -4 }}
                                                        >
                                                            <div className="aspect-square overflow-hidden">
                                                                {artist.image ? (
                                                                    <img
                                                                        src={artist.image}
                                                                        alt={artist.name}
                                                                        className="w-full h-full object-cover rounded-t-lg"
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-indigo-500 text-3xl font-bold">
                                                                        {artist.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h4 className="font-medium mt-2 text-center p-2 text-gray-800 dark:text-gray-200">
                                                                {artist.name}
                                                            </h4>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {currentArtist && (
                                            <motion.div
                                                className="mt-10"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <div className="flex items-center mb-5">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        More from {currentArtist.name}
                                                    </h3>
                                                    <div className="ml-auto">
                                                        <div className="h-[1px] w-16 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                                    </div>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {isLoadingArtistTracks ? (
                                                        <motion.div
                                                            key="loading"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col items-center justify-center min-h-[100px]"
                                                        >
                                                            <div className="w-6 h-6 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-3"></div>
                                                            <p className="text-indigo-500 dark:text-indigo-400 text-sm">Loading artist tracks...</p>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="content"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            {artistTracks.length > 0 ? (
                                                                <TrackList tracks={artistTracks} />
                                                            ) : (
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                                                                    <p className="text-gray-600 dark:text-gray-400">No additional tracks found for this artist.</p>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </motion.section>
                                </AnimatePresence>
                            )}
                        </div>

                        <AnimatePresence>
                            <motion.div
                                key="queue-sidebar"
                                className={`lg:block ${showQueue ? 'fixed inset-0 z-50 bg-black bg-opacity-30 lg:bg-opacity-0 lg:static' : 'hidden'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className={`h-full max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 lg:bg-transparent dark:lg:bg-transparent p-4 lg:p-0 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none overflow-hidden ${showQueue ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                                    }`}>
                                    <div className="sticky top-0">
                                        <div className="flex justify-between items-center lg:hidden mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Queue</h3>
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                onClick={toggleQueue}
                                                aria-label="Close queue"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Queue />

                                            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                                <VolumeControl />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <PlayerControls focusMode={focusMode} toggleQueue={toggleQueue} />
        </div>
    );
}

export default MusicPlayer;