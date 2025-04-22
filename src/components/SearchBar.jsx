import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Music, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchBar({ onSearchResults }) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const inputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }, [recentSearches]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Save to recent searches
        const trimmedQuery = query.trim();
        if (!recentSearches.includes(trimmedQuery)) {
            const updatedSearches = [trimmedQuery, ...recentSearches].slice(0, 5);
            setRecentSearches(updatedSearches);
        }

        setIsLoading(true);
        try {
            const response = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(trimmedQuery)}`);

            if (response.data && response.data.data && response.data.data.results) {
                const formattedSongs = response.data.data.results.map(song => ({
                    id: song.id,
                    name: song.name,
                    artists: song.artists && song.artists.primary
                        ? song.artists.primary.map(artist => ({
                            id: artist.id,
                            name: artist.name,
                            url: artist.url,
                            image: artist.image && artist.image.length > 1
                                ? artist.image[1].url
                                : artist.image && artist.image.length > 0
                                    ? artist.image[0].url
                                    : ''
                        }))
                        : [{ name: 'Unknown Artist' }],
                    album: {
                        name: song.album?.name || 'Unknown Album',
                        images: song.image ? [
                            { url: song.image[2]?.url || '' },
                            { url: song.image[1]?.url || '' },
                            { url: song.image[0]?.url || '' }
                        ] : [{ url: '' }, { url: '' }, { url: '' }]
                    },
                    duration_ms: song.duration * 1000 || 0,
                    download_url: song.downloadUrl && song.downloadUrl.length > 0
                        ? song.downloadUrl[song.downloadUrl.length - 1].url
                        : null,
                }));

                onSearchResults(formattedSongs);
            } else {
                onSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching:', error);
            onSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    const handleRecentSearchClick = (searchTerm) => {
        setQuery(searchTerm);
        setTimeout(() => {
            handleSearch({ preventDefault: () => { } });
        }, 10);
    };

    const removeRecentSearch = (e, searchTerm) => {
        e.stopPropagation();
        const updatedSearches = recentSearches.filter(term => term !== searchTerm);
        setRecentSearches(updatedSearches);
    };

    return (
        <div className="relative max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <Search size={18} />
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setHasFocus(true)}
                        onBlur={() => setTimeout(() => setHasFocus(false), 200)}
                        placeholder="Search for songs, artists, or albums..."
                        className="w-full text-white bg-white dark:bg-gray-800 py-3 pl-11 pr-24 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 shadow-sm"
                    />

                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <AnimatePresence>
                            {query && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    type="button"
                                    onClick={handleClear}
                                    className="text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-1.5 px-4 rounded-md transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader size={14} className="animate-spin" />
                                    <span>Searching</span>
                                </div>
                            ) : (
                                <span>Search</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <AnimatePresence>
                {hasFocus && recentSearches.length > 0 && !query && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 px-2 pb-1">
                                Recent Searches
                            </div>

                            <ul>
                                {recentSearches.map((search, index) => (
                                    <motion.li
                                        key={search}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group"
                                        onClick={() => handleRecentSearchClick(search)}
                                    >
                                        <Music size={14} className="text-indigo-500 dark:text-indigo-400 mr-2" />
                                        <span className="flex-1 text-sm truncate text-gray-700 dark:text-gray-300">{search}</span>
                                        <button
                                            onClick={(e) => removeRecentSearch(e, search)}
                                            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-all"
                                            aria-label="Remove from recent searches"
                                        >
                                            <X size={12} />
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SearchBar;