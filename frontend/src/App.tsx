import { Routes, Route, Link } from 'react-router-dom';
import CreateSecretForm from './components/CreateSecretForm';
import ViewSecret from './components/ViewSecret';

function App() {
  const handleSecretCreated = (secretId: string) => {
    console.log(secretId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="w-full bg-gray-800 shadow-md"> {/* Beispiel für einen Header-Hintergrund über volle Breite */}
        <div className="container mx-auto max-w-4xl px-4 py-6"> {/* Zentrierter Inhaltscontainer für Header */}
          <Link to="/" className="text-decoration-none">
            <h1 className="text-4xl font-bold text-center text-indigo-400 hover:text-indigo-300 transition-colors">
              Ephemeral Secret Sharer
            </h1>
          </Link>
        </div>
      </header>

      <main className="w-full flex-grow flex justify-center py-8 px-4"> {/* Hauptbereich füllt Platz und zentriert Inhalt */}
        <div className="w-full max-w-2xl"> {/* Maximale Breite für den Hauptinhalt */}
          <Routes>
            <Route
              path="/"
              element={<CreateSecretForm onSecretCreated={handleSecretCreated} />}
            />
            <Route path="/secret/:secretId" element={<ViewSecret />} />
            <Route
              path="*"
              element={
                <div className="text-center py-10">
                  <h2 className="text-2xl text-red-500">404 - Page Not Found</h2>
                  <Link
                    to="/"
                    className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block"
                  >
                    Go to Homepage
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </main>

      <footer className="w-full bg-gray-800 shadow-md mt-auto"> {/* Beispiel für einen Footer-Hintergrund über volle Breite */}
        <div className="container mx-auto max-w-4xl px-4 py-6"> {/* Zentrierter Inhaltscontainer für Footer */}
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Secret Sharer Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;