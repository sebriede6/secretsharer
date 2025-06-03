import { Routes, Route, Link } from 'react-router-dom'; // Importiere Routes, Route und Link
import CreateSecretForm from './components/CreateSecretForm';
import ViewSecret from './components/ViewSecret'; // Importiere die neue Komponente

function App() {
  const handleSecretCreated = (secretId: string) => {
    console.log('App.tsx: Secret created with ID (for potential navigation):', secretId);
    // Mit react-router können wir hier programmgesteuert navigieren,
    // aber das Formular zeigt den Link ja schon an.
    // Für den Moment ist die Navigation durch den Benutzer gedacht, der den Link anklickt.
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <header className="w-full max-w-2xl py-8">
        {/* Link zur Startseite/Erstellungsseite */}
        <Link to="/" className="text-decoration-none">
          <h1 className="text-4xl font-bold text-center text-indigo-400 hover:text-indigo-300 transition-colors">
            Ephemeral Secret Sharer
          </h1>
        </Link>
      </header>
      <main className="w-full max-w-2xl">
        <Routes> {/* Definiert den Bereich, in dem Routen gematcht und gerendert werden */}
          <Route
            path="/"
            element={<CreateSecretForm onSecretCreated={handleSecretCreated} />}
          />
          <Route path="/secret/:secretId" element={<ViewSecret />} />
          {/* Fallback-Route für nicht gefundene Pfade (optional) */}
          <Route path="*" element={
            <div className="text-center py-10">
              <h2 className="text-2xl text-red-500">404 - Page Not Found</h2>
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
                Go to Homepage
              </Link>
            </div>
          } />
        </Routes>
      </main>
      <footer className="w-full max-w-2xl py-8 mt-auto">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Secret Sharer Inc.
        </p>
      </footer>
    </div>
  );
}

export default App;