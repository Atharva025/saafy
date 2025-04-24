import { usePlaylist } from '../context/PlaylistContext';
import { useQueue } from '../context/QueueContext';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, Clock, Music, MoreHorizontal, Trash } from 'lucide-react';
import TrackList from './TrackList';

function PlaylistDetail() {
    const { activePlaylist, setActivePlaylist, removeTrackFromPlaylist } = usePlaylist();
    const { playTracklist, playTrack } = useQueue();

    // If no active playlist, don't render
    if (!activePlaylist) return null;

    // Format duration
    const formatDuration = (ms) => {
        if (!ms) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    // Calculate total duration
    const getTotalDuration = () => {
        if (activePlaylist.tracks.length === 0) return '0:00';

        const total = activePlaylist.tracks.reduce((sum, track) => sum + (track.duration_ms || 0), 0);
        const hours = Math.floor(total / 3600000);
        const minutes = Math.floor((total % 3600000) / 60000);

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
    };

    // Play all tracks in playlist
    const handlePlayAll = () => {
        playTracklist(activePlaylist.tracks);
    };

    // Go back to playlists view
    const goBack = () => {
        setActivePlaylist(null);
    };

    // Handle track actions - this is a custom handler for playlist tracks
    const handleTrackAction = (track, action) => {
        if (action === 'remove') {
            removeTrackFromPlaylist(activePlaylist.id, track.id);
        } else if (action === 'play') {
            playTrack(track);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center">
                <button
                    onClick={goBack}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                    <ChevronLeft size={20} />
                    <span className="ml-1">Back to Playlists</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center shadow-md">
                    <Music size={40} className="text-white/80" />
                </div>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {activePlaylist.name}
                    </h1>

                    {activePlaylist.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {activePlaylist.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                        <div>
                            {activePlaylist.tracks.length} {activePlaylist.tracks.length === 1 ? 'track' : 'tracks'}
                        </div>
                        <div>•</div>
                        <div>{getTotalDuration()}</div>
                    </div>

                    {activePlaylist.tracks.length > 0 && (
                        <button
                            onClick={handlePlayAll}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
                        >
                            <Play size={16} className="mr-2" />
                            Play All
                        </button>
                    )}
                </div>
            </div>

            {activePlaylist.tracks.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="hidden sm:flex items-center p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 text-center">#</div>
                        <div className="flex-1">Title</div>
                        <div className="w-32 text-right pr-8">
                            <Clock size={14} />
                        </div>
                        <div className="w-16"></div>
                    </div>

                    {activePlaylist.tracks.map((track, index) => (
                        <div
                            key={track.id}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-750 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                            <div className="w-10 text-center text-gray-400 dark:text-gray-500">
                                {index + 1}
                            </div>

                            <div className="flex-1 flex items-center">
                                <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 mr-3 overflow-hidden flex-shrink-0">
                                    {track.album?.images?.[0]?.url ? (
                                        <img
                                            src={track.album.images[0].url}
                                            alt={track.album.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                                            <Music size={16} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-gray-800 dark:text-gray-200 font-medium">
                                        {track.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {track.artists?.map(a => a.name).join(', ')}
                                    </div>
                                </div>
                            </div>

                            <div className="w-32 text-right text-gray-500 dark:text-gray-400 text-sm pr-4">
                                {formatDuration(track.duration_ms)}
                            </div>

                            <div className="w-16 flex justify-end">
                                <div className="relative group">
                                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                                        <MoreHorizontal size={16} />
                                    </button>

                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-10 hidden group-hover:block">
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            onClick={() => handleTrackAction(track, 'play')}
                                        >
                                            <Play size={14} className="mr-2" />
                                            Play
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                            onClick={() => handleTrackAction(track, 'remove')}
                                        >
                                            <Trash size={14} className="mr-2" />
                                            Remove from playlist
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                    <Music size={32} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-gray-800 dark:text-gray-200 mb-2">
                        This playlist is empty
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Add some songs to get started
                    </p>
                </div>
            )}
        </motion.div>
    );
}

export default PlaylistDetail;