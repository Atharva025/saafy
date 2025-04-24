import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
    // Store all user playlists
    const [playlists, setPlaylists] = useState(() => {
        // Load playlists from localStorage on startup
        const savedPlaylists = localStorage.getItem('saafy_playlists');
        return savedPlaylists ? JSON.parse(savedPlaylists) : [];
    });

    // Currently selected playlist for viewing
    const [activePlaylist, setActivePlaylist] = useState(null);

    // Save playlists to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('saafy_playlists', JSON.stringify(playlists));
    }, [playlists]);

    // Create a new playlist
    const createPlaylist = (name, description = '') => {
        // Generate a unique ID
        const id = Date.now().toString();

        const newPlaylist = {
            id,
            name,
            description,
            tracks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setPlaylists(prev => [...prev, newPlaylist]);
        toast.success(`Playlist "${name}" created!`, {
            className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        });

        return id; // Return the ID for immediate use if needed
    };

    // Delete a playlist
    const deletePlaylist = (playlistId) => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        setPlaylists(prev => prev.filter(p => p.id !== playlistId));

        // If active playlist is being deleted, clear it
        if (activePlaylist?.id === playlistId) {
            setActivePlaylist(null);
        }

        toast.success(`Playlist "${playlist.name}" deleted`, {
            className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        });
    };

    // Update playlist details
    const updatePlaylist = (playlistId, updates) => {
        setPlaylists(prev => prev.map(playlist => {
            if (playlist.id === playlistId) {
                return {
                    ...playlist,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
            }
            return playlist;
        }));

        // Update active playlist if it's being edited
        if (activePlaylist?.id === playlistId) {
            setActivePlaylist(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    // Add a track to playlist
    const addTrackToPlaylist = (playlistId, track) => {
        // First check if track already exists in this playlist
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        if (playlist.tracks.some(t => t.id === track.id)) {
            toast.error(`"${track.name}" is already in this playlist`, {
                className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            });
            return;
        }

        // Add track to playlist
        setPlaylists(prev => prev.map(p => {
            if (p.id === playlistId) {
                return {
                    ...p,
                    tracks: [...p.tracks, track],
                    updatedAt: new Date().toISOString()
                };
            }
            return p;
        }));

        // If this is the active playlist, update it too
        if (activePlaylist?.id === playlistId) {
            setActivePlaylist(prev => ({
                ...prev,
                tracks: [...prev.tracks, track]
            }));
        }

        toast.success(`Added "${track.name}" to ${playlist.name}`, {
            className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        });
    };

    // Remove a track from playlist
    const removeTrackFromPlaylist = (playlistId, trackId) => {
        setPlaylists(prev => prev.map(p => {
            if (p.id === playlistId) {
                return {
                    ...p,
                    tracks: p.tracks.filter(t => t.id !== trackId),
                    updatedAt: new Date().toISOString()
                };
            }
            return p;
        }));

        // If this is the active playlist, update it too
        if (activePlaylist?.id === playlistId) {
            setActivePlaylist(prev => ({
                ...prev,
                tracks: prev.tracks.filter(t => t.id !== trackId)
            }));
        }
    };

    // Set the active playlist for viewing
    const viewPlaylist = (playlistId) => {
        const playlist = playlists.find(p => p.id === playlistId);
        setActivePlaylist(playlist || null);
    };

    return (
        <PlaylistContext.Provider value={{
            playlists,
            activePlaylist,
            setActivePlaylist,
            createPlaylist,
            deletePlaylist,
            updatePlaylist,
            addTrackToPlaylist,
            removeTrackFromPlaylist,
            viewPlaylist
        }}>
            {children}
        </PlaylistContext.Provider>
    );
}

export const usePlaylist = () => useContext(PlaylistContext);

export default PlaylistProvider;