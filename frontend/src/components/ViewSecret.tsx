import React, { useEffect, useState, useRef } from 'react'; // useRef hinzufügen
import { useParams } from 'react-router-dom';

const ViewSecret: React.FC = () => {
  const { secretId } = useParams<{ secretId: string }>();
  const [secretContent, setSecretContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false); // Neuer State, um erfolgreichen Fetch zu markieren

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchAttemptedRef = useRef(false); // Verhindert mehrfache Fetches durch StrictMode

  useEffect(() => {
    if (!secretId) {
      setError('No secret ID provided.');
      setIsLoading(false);
      return;
    }

    // Nur einmal fetchen, auch im StrictMode
    if (fetchAttemptedRef.current) {
        return;
    }
    fetchAttemptedRef.current = true;

    const fetchSecret = async () => {
      setIsLoading(true);
      setError(null); // Fehler vor jedem echten Versuch zurücksetzen
      try {
        const response = await fetch(`${apiBaseUrl}/secrets/${secretId}`);
        if (response.status === 404) {
          // Wenn wir schon erfolgreich gefetched hatten, diesen Fehler ignorieren
          // (passiert durch den zweiten StrictMode Aufruf, nachdem das Secret schon weg ist)
          if (hasFetched) {
            setIsLoading(false); // Wichtig, um aus dem Ladezustand rauszukommen
            return;
          }
          throw new Error('Secret not found, already viewed, or expired.');
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch secret: ${response.statusText}`);
        }
        const data = await response.json();
        setSecretContent(data.content);
        setHasFetched(true); // Markieren, dass wir erfolgreich waren
      } catch (err) {
        // Fehler nur setzen, wenn wir noch nicht erfolgreich waren
        if (!hasFetched) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred while fetching the secret.');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecret();

  }, [secretId, apiBaseUrl, hasFetched]); // hasFetched als Dependency hinzugefügt

  if (isLoading && !hasFetched) { // Nur laden anzeigen, wenn noch kein erfolgreicher Fetch
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <p className="text-xl text-gray-300">Loading secret...</p>
      </div>
    );
  }

  // Wenn wir erfolgreich gefetched haben, zeige immer den Inhalt, ignoriere spätere Fehler (vom StrictMode)
  if (secretContent) { // hasFetched ist hier implizit true
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-indigo-400 mb-4 text-center">Your Secret:</h2>
        <div className="p-4 bg-gray-700 rounded whitespace-pre-wrap break-words">
          <p className="text-gray-200">{secretContent}</p>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          This secret has now been deleted from the server.
        </p>
      </div>
    );
  }

  // Fehler nur anzeigen, wenn wir *noch nie* erfolgreich waren
  if (error) {
    return (
      <div className="p-6 bg-red-800 border border-red-700 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-red-300 mb-3">Error</h2>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <p className="text-xl text-gray-300">No secret to display.</p>
    </div>
  );
};

export default ViewSecret;