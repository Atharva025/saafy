import { QueueProvider } from './context/QueueContext';
import { PlaylistProvider } from './context/PlaylistContext';
import MusicPlayer from './components/MusicPlayer';
// Other imports...

function App() {
  return (
    <QueueProvider>
      <PlaylistProvider>
        <MusicPlayer />
      </PlaylistProvider>
    </QueueProvider>
  );
}

export default App;