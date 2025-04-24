import { useState, useEffect } from 'react';
import { usePlaylist } from '../context/PlaylistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';

function PlaylistModal({ isOpen, onClose, track = null, mode = 'create' }) {
    const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylist();

    // Form state
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(mode === 'create');

    // Reset form state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPlaylistName('');
            setPlaylistDescription('');
            setSelectedPlaylistId(playlists.length > 0 ? playlists[0].id : '');
            setIsCreatingNew(mode === 'create');
        }
    }, [isOpen, playlists, mode]);

    // Handle creating new playlist
    const handleCreatePlaylist = () => {
        if (!playlistName.trim()) {
            return; // Don't create empty named playlists
        }

        const newPlaylistId = createPlaylist(playlistName, playlistDescription);

        // If we're adding a track immediately, do that
        if (track) {
            addTrackToPlaylist(newPlaylistId, track);
        }

        // Close modal after creation
        onClose();
    };

    // Handle adding to existing playlist
    const handleAddToPlaylist = () => {
        if (!selectedPlaylistId) return;

        addTrackToPlaylist(selectedPlaylistId, track);
        onClose();
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isCreatingNew) {
            handleCreatePlaylist();
        } else if (track) {
            handleAddToPlaylist();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="flex items-center justify-center min-h-screen">
                        <motion.div
                            className="fixed inset-0 bg-black/50"
                            onClick={onClose}
                        />

                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative z-10"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                    {isCreatingNew
                                        ? 'Create Playlist'
                                        : track
                                            ? `Add "${track.name}" to Playlist`
                                            : 'Playlists'}
                                </h2>
                                <button
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    onClick={onClose}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {track && !isCreatingNew && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Playlist
                                        </label>

                                        {playlists.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                                                {playlists.map(playlist => (
                                                    <div
                                                        key={playlist.id}
                                                        className={`p-3 rounded-lg cursor-pointer transition border ${selectedPlaylistId === playlist.id
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                            }`}
                                                        onClick={() => setSelectedPlaylistId(playlist.id)}
                                                    >
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                                            {playlist.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {playlist.tracks.length} tracks
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                                No playlists yet. Create one!
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            className="flex items-center text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            onClick={() => setIsCreatingNew(true)}
                                        >
                                            <Plus size={16} className="mr-1" />
                                            Create new playlist
                                        </button>
                                    </div>
                                )}

                                {isCreatingNew && (
                                    <>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="playlist-name"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Playlist Name
                                            </label>
                                            <input
                                                id="playlist-name"
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={playlistName}
                                                onChange={(e) => setPlaylistName(e.target.value)}
                                                placeholder="My Awesome Mix"
                                                required
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <label
                                                htmlFor="playlist-description"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                            >
                                                Description (optional)
                                            </label>
                                            <textarea
                                                id="playlist-description"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={playlistDescription}
                                                onChange={(e) => setPlaylistDescription(e.target.value)}
                                                placeholder="A collection of my favorite songs"
                                                rows="3"
                                            />
                                        </div>

                                        {!track && !isCreatingNew && (
                                            <button
                                                type="button"
                                                className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4 flex items-center"
                                                onClick={() => setIsCreatingNew(false)}
                                            >
                                                Back to playlist selection
                                            </button>
                                        )}
                                    </>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 flex items-center"
                                        disabled={isCreatingNew ? !playlistName : !selectedPlaylistId}
                                    >
                                        <Save size={16} className="mr-2" />
                                        {isCreatingNew ? 'Create' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default PlaylistModal;