import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import TrackList from './TrackList';
import FeaturedTracks from './FeaturedTracks';
import PlayerControls from './PlayerControls';
import Queue from './Queue';
import VolumeControl from './VolumeControl';
import Playlists from './Playlists';
import PlaylistDetail from './PlaylistDetail';
import { usePlaylist } from '../context/PlaylistContext';
import { Music, Settings, Headphones, Search, Clock, Sparkles, X, ListMusic } from 'lucide-react';

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
    const { activePlaylist } = usePlaylist();

    // Categories for music selection - now includes playlists
    const categories = [
        { id: 'hindi', name: 'Hindi' },
        { id: 'english', name: 'English' },
        { id: 'punjabi', name: 'Punjabi' },
        { id: 'tamil', name: 'Tamil' },
        { id: 'telugu', name: 'Telugu' },
        { id: 'playlists', name: 'My Playlists', icon: <ListMusic size={16} className="mr-1" /> }
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
            // Skip loading tracks when in playlists category
            if (activeCategory === 'playlists') {
                setIsLoadingTrending(false);
                return;
            }

            try {
                setIsLoadingTrending(true);

                // Predefined playlist URLs for each category
                const playlistUrls = {
                    hindi: 'https://www.jiosaavn.com/featured/trending-hits/GVABefAdtVAZNLR,rP3WSg__',
                    english: 'https://www.jiosaavn.com/featured/english-viral-hits/pm49jiq,CNs_',
                    punjabi: 'https://www.jiosaavn.com/featured/punjabi-trending-hits/vInkpyiMhI6qKl4yv5iIvA__',
                    tamil: 'https://www.jiosaavn.com/featured/trending-pop-tamil/5z8vKjNnhmIGSw2I1RxdhQ__',
                    telugu: 'https://www.jiosaavn.com/featured/-trending-tracks/FWB5iMCkujuQbUI04mhbCA__'
                };

                // Get playlist URL for active category
                const playlistUrl = playlistUrls[activeCategory];

                if (playlistUrl) {
                    console.log(`Fetching trending ${activeCategory} songs from playlist:`, playlistUrl);

                    // English playlist needs special handling
                    if (activeCategory === 'english') {
                        // For English, use a more reliable fixed playlist token instead of the URL
                        const playlistId = 'pm49jiq,CNs_';

                        try {
                            // First try to get a better playlist ID through search
                            const searchResponse = await axios.get(`https://saafy-api.vercel.app/api/search?query=${encodeURIComponent('english popular hits')}`);

                            if (searchResponse.data?.success && searchResponse.data.data?.topQuery?.results) {
                                const topQueryResults = searchResponse.data.data.topQuery.results;
                                const relevantPlaylist = topQueryResults.find(item =>
                                    item.type === 'playlist' &&
                                    item.title.toLowerCase().includes('english')
                                );

                                if (relevantPlaylist) {
                                    console.log('Found English playlist from search:', relevantPlaylist.title);

                                    // Extract the token from the URL
                                    const playlistUrlParts = relevantPlaylist.url.split('/');
                                    const playlistToken = playlistUrlParts[playlistUrlParts.length - 1];

                                    const idResponse = await axios.get(`https://saafy-api.vercel.app/api/playlists?id=${playlistToken}`);

                                    if (idResponse.data?.data?.songs) {
                                        console.log('English playlist songs found:', idResponse.data.data.songs.length);
                                        const formattedSongs = formatSongs(idResponse.data.data.songs);

                                        // Apply additional English filter
                                        const playableTracks = formattedSongs.filter(track =>
                                            track.download_url &&
                                            /^[a-zA-Z0-9\s\W]+$/.test(track.name)
                                        );

                                        if (playableTracks.length > 0) {
                                            console.log('English playable tracks:', playableTracks.length);
                                            setTrendingTracks(playableTracks);
                                            setIsLoadingTrending(false);
                                            return;
                                        }
                                    }
                                }
                            }

                            // If dynamic method fails, fall back to a known working English playlist ID
                            const backupResponse = await axios.get('https://saafy-api.vercel.app/api/playlists?id=1083318977');

                            if (backupResponse.data?.data?.songs) {
                                console.log('Backup English playlist songs found:', backupResponse.data.data.songs.length);
                                const formattedSongs = formatSongs(backupResponse.data.data.songs);
                                const playableTracks = formattedSongs.filter(track => track.download_url);

                                if (playableTracks.length > 0) {
                                    setTrendingTracks(playableTracks);
                                    setIsLoadingTrending(false);
                                    return;
                                }
                            }
                        } catch (error) {
                            console.error('Error with English playlist:', error);
                        }
                    } else {
                        // For non-English playlists, first try the link approach
                        try {
                            const encodedUrl = encodeURIComponent(playlistUrl);
                            const playlistResponse = await axios.get(`https://saafy-api.vercel.app/api/playlists?link=${encodedUrl}`);

                            if (playlistResponse.data?.data?.songs && playlistResponse.data.data.songs.length > 0) {
                                console.log('Playlist songs found:', playlistResponse.data.data.songs.length);
                                const formattedSongs = formatSongs(playlistResponse.data.data.songs);
                                const playableTracks = formattedSongs.filter(track => track.download_url);

                                if (playableTracks.length > 0) {
                                    setTrendingTracks(playableTracks);
                                    setIsLoadingTrending(false);
                                    return;
                                }
                            }
                        } catch (error) {
                            console.error('Error with direct playlist URL:', error);
                        }

                        // If link approach fails, try the ID approach
                        try {
                            const urlParts = playlistUrl.split('/');
                            const rawPlaylistId = urlParts[urlParts.length - 1];

                            const idResponse = await axios.get(`https://saafy-api.vercel.app/api/playlists?id=${rawPlaylistId}`);

                            if (idResponse.data?.data?.songs) {
                                console.log('Playlist songs found using ID:', idResponse.data.data.songs.length);
                                const formattedSongs = formatSongs(idResponse.data.data.songs);
                                const playableTracks = formattedSongs.filter(track => track.download_url);

                                if (playableTracks.length > 0) {
                                    setTrendingTracks(playableTracks);
                                    setIsLoadingTrending(false);
                                    return;
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching by ID:', error);
                        }
                    }
                }

                // If we're still here, all playlist approaches failed
                // Use a last resort language-specific search
                console.log('All playlist methods failed, trying language-specific search');

                try {
                    // Last resort approach with language in the query
                    const languageTerms = {
                        hindi: 'hindi songs trending',
                        english: 'english songs popular',
                        punjabi: 'punjabi songs latest',
                        tamil: 'tamil songs trending',
                        telugu: 'telugu songs hits'
                    };

                    const finalResponse = await axios.get(`https://saafy-api.vercel.app/api/search/songs?query=${encodeURIComponent(languageTerms[activeCategory])}`);

                    if (finalResponse.data?.data?.results) {
                        console.log('Language-specific search found:', finalResponse.data.data.results.length);
                        const formattedSongs = formatSongs(finalResponse.data.data.results);

                        // Apply language filter for English
                        const playableTracks = activeCategory === 'english'
                            ? formattedSongs.filter(track =>
                                track.download_url &&
                                /^[a-zA-Z0-9\s\W]+$/.test(track.name))
                            : formattedSongs.filter(track => track.download_url);

                        console.log('Final playable tracks:', playableTracks.length);
                        setTrendingTracks(playableTracks);
                    } else {
                        setTrendingTracks([]);
                    }
                } catch (error) {
                    console.error('Error in final fallback approach:', error);
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

                const response = await axios.get(`https://saafy-api.vercel.app/api/artists/${currentArtist.id}/songs`);

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
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${activeCategory === category.id
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                >
                                                    {category.icon}
                                                    {category.name}
                                                </motion.button>
                                            ))}
                                        </div>

                                        {activeCategory !== 'playlists' && (
                                            <div className="flex justify-between items-center mt-8 mb-4">
                                                <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                                    <Sparkles className="text-teal-400" size={20} />
                                                    <span>
                                                        {categories.find(c => c.id === activeCategory)?.name || ''} Trending
                                                    </span>
                                                </h2>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Show playlists when that category is selected */}
                                    {activeCategory === 'playlists' ? (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key="playlists"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {activePlaylist ? <PlaylistDetail /> : <Playlists />}
                                            </motion.div>
                                        </AnimatePresence>
                                    ) : (
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
                                    )}
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
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-10"
                                            >
                                                <div className="flex items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                                        <Music size={18} className="text-teal-400 mr-2" />
                                                        {currentArtist.name} Tracks
                                                    </h3>
                                                    <div className="ml-auto">
                                                        <button
                                                            className="text-indigo-500 dark:text-indigo-400 text-sm hover:underline"
                                                            onClick={() => setCurrentArtist(null)}
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </div>

                                                {isLoadingArtistTracks ? (
                                                    <div className="flex items-center justify-center py-10">
                                                        <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
                                                    </div>
                                                ) : artistTracks.length > 0 ? (
                                                    <TrackList tracks={artistTracks} />
                                                ) : (
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                                                        <p className="text-gray-600 dark:text-gray-400">No additional tracks found for this artist.</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.section>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Right sidebar with Queue */}
                        <div className={`lg:block ${showQueue ? 'block fixed inset-0 z-30 bg-gray-900/50 lg:bg-transparent lg:static' : 'hidden'}`}>
                            <div className="h-full lg:h-auto p-4 lg:p-0">
                                <div className="bg-white dark:bg-gray-800 h-full lg:h-auto rounded-lg shadow relative max-w-md mx-auto lg:mx-0 overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Playing Queue</h3>
                                        <button
                                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                            onClick={toggleQueue}
                                        >
                                            <X size={18} className="text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        <Queue />
                                    </div>

                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                        <VolumeControl />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Controls - Fixed at the bottom */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-20"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="max-w-7xl mx-auto">
                    <PlayerControls
                        onToggleFocusMode={toggleFocusMode}
                        focusMode={focusMode}
                        onToggleQueue={toggleQueue}
                        showQueue={showQueue}
                    />
                </div>
            </motion.div>
        </div>
    );
}

export default MusicPlayer;