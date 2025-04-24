import { useState } from 'react';
import { usePlaylist } from '../context/PlaylistContext';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import { PlayCircle, Edit2, Trash2, Music, Plus, Calendar } from 'lucide-react';
import PlaylistModal from './PlaylistModal';

function Playlists() {
    const { playlists, activePlaylist, viewPlaylist, deletePlaylist, updatePlaylist } = usePlaylist();
    const { playTracklist } = useQueue();
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [playlistNameEdit, setPlaylistNameEdit] = useState('');

    // Format date to readable string
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    // Start editing a playlist
    const startEditingPlaylist = (playlist) => {
        setEditingPlaylist(playlist.id);
        setPlaylistNameEdit(playlist.name);
    };

    // Save playlist name edit
    const savePlaylistEdit = (playlistId) => {
        if (playlistNameEdit.trim()) {
            updatePlaylist(playlistId, { name: playlistNameEdit });
        }
        setEditingPlaylist(null);
    };

    // Cancel playlist name edit
    const cancelPlaylistEdit = () => {
        setEditingPlaylist(null);
    };

    // Play all songs in a playlist
    const playPlaylist = (playlist) => {
        if (playlist.tracks.length > 0) {
            playTracklist(playlist.tracks);
        }
    };

    // Get playlist date to display
    const getPlaylistDate = (playlist) => {
        if (playlist.tracks.length === 0) {
            return `Created on ${formatDate(playlist.createdAt)}`;
        }
        return `Updated on ${formatDate(playlist.updatedAt)}`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Music className="text-indigo-500" size={20} />
                    <span>Your Playlists</span>
                </h2>

                <button
                    onClick={() => setIsCreatingPlaylist(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">New Playlist</span>
                </button>
            </div>

            {playlists.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <Music size={28} className="text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        No playlists yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create your first playlist to organize your favorite songs
                    </p>
                    <button
                        onClick={() => setIsCreatingPlaylist(true)}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Plus size={16} />
                        Create a Playlist
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map(playlist => (
                        <motion.div
                            key={playlist.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                            whileHover={{ y: -2 }}
                        >
                            <div className="h-28 bg-gradient-to-r from-indigo-500/60 to-purple-500/60 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Music size={20} className="text-white" />
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    {editingPlaylist === playlist.id ? (
                                        <input
                                            type="text"
                                            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={playlistNameEdit}
                                            onChange={(e) => setPlaylistNameEdit(e.target.value)}
                                            onBlur={() => savePlaylistEdit(playlist.id)}
                                            onKeyPress={(e) => e.key === 'Enter' && savePlaylistEdit(playlist.id)}
                                            autoFocus
                                        />
                                    ) : (
                                        <h3
                                            className="text-lg font-semibold text-gray-800 dark:text-gray-200 cursor-pointer truncate"
                                            onClick={() => viewPlaylist(playlist.id)}
                                            title={playlist.name}
                                        >
                                            {playlist.name}
                                        </h3>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        {editingPlaylist !== playlist.id && (
                                            <>
                                                <button
                                                    onClick={() => startEditingPlaylist(playlist)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
                                                    title="Edit name"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deletePlaylist(playlist.id)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"
                                                    title="Delete playlist"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <Calendar size={12} className="mr-1.5" />
                                    {getPlaylistDate(playlist)}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                                    </span>

                                    {playlist.tracks.length > 0 && (
                                        <button
                                            onClick={() => playPlaylist(playlist)}
                                            className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            <PlayCircle size={16} />
                                            Play All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            <PlaylistModal
                isOpen={isCreatingPlaylist}
                onClose={() => setIsCreatingPlaylist(false)}
                mode="create"
            />
        </div>
    );
}

export default Playlists;