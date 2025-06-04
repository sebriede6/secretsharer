import { Routes, Route, Link } from 'react-router-dom';
import CreateSecretForm from './components/CreateSecretForm';
import ViewSecret from './components/ViewSecret';

function App() {
  const handleSecretCreated = (secretId: string) => {
    console.log(secretId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <header className="w-full max-w-2xl py-8">
        <Link to="/" className="text-decoration-none">
          <h1 className="text-4xl font-bold text-center text-indigo-400 hover:text-indigo-300 transition-colors">
            Ephemeral Secret Sharer
          </h1>
        </Link>
      </header>
      <main className="w-full max-w-2xl">
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
