import { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Play, ListPlus, PlusCircle, Share, Heart } from 'lucide-react';
import PlaylistModal from './PlaylistModal';

function TrackActions({ track, onClose }) {
    const { playTrack, addToQueue, addNextInQueue } = useQueue();
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    const handlePlay = () => {
        playTrack(track);
        onClose && onClose();
    };

    const handleAddToQueue = () => {
        addToQueue(track);
        onClose && onClose();
    };

    const handlePlayNext = () => {
        addNextInQueue(track);
        onClose && onClose();
    };

    const handleAddToPlaylist = () => {
        setShowPlaylistModal(true);
    };

    return (
        <div className="py-1">
            <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handlePlay}
            >
                <Play size={16} className="mr-3" />
                Play
            </button>
            <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleAddToQueue}
            >
                <PlusCircle size={16} className="mr-3" />
                Add to Queue
            </button>
            <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handlePlayNext}
            >
                <ListPlus size={16} className="mr-3" />
                Play Next
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleAddToPlaylist}
            >
                <Heart size={16} className="mr-3" />
                Add to Playlist
            </button>

            {/* Playlist Modal */}
            <PlaylistModal
                isOpen={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                track={track}
                mode="add"
            />
        </div>
    );
}

export default TrackActions;