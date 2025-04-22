import { Toaster } from 'react-hot-toast';
import { QueueProvider } from './context/QueueContext';
import MusicPlayer from './components/MusicPlayer';

function App() {
  return (
    <QueueProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">



        <MusicPlayer />

        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!bg-white !dark:bg-gray-800 !text-gray-800 !dark:text-gray-200 !border !border-gray-200 !dark:border-gray-700",
            success: {
              className: "!border-green-100 !dark:border-green-900/30",
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              },
            },
            error: {
              className: "!border-red-100 !dark:border-red-900/30",
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
            loading: {
              className: "!border-indigo-100 !dark:border-indigo-900/30",
            },
            duration: 3000,
          }}
        />
      </div>
    </QueueProvider>
  );
}

export default App;