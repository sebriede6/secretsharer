import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const COUNTDOWN_SECONDS = 30;

const ViewSecret: React.FC = () => {
  const { secretId } = useParams<{ secretId: string }>();
  const [secretContent, setSecretContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAttemptedRef = useRef(false);

  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [isBurned, setIsBurned] = useState<boolean>(false);
  const timerIdRef = useRef<number | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!secretId) {
      setError('No secret ID provided.');
      setIsLoading(false);
      return;
    }

    if (fetchAttemptedRef.current) {
      return;
    }
    fetchAttemptedRef.current = true;

    const fetchSecret = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const response = await fetch(`${apiBaseUrl}/secrets/${secretId}`);
        if (response.status === 404) {
          throw new Error('Secret not found, already viewed, or expired.');
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch secret: ${response.statusText}`
          );
        }
        const data = await response.json();
        setSecretContent(data.content);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching the secret.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSecret();
  }, [secretId, apiBaseUrl]);

  useEffect(() => {
    if (secretContent && !isBurned) {
      setCountdown(COUNTDOWN_SECONDS);
      timerIdRef.current = window.setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
      }
    }
    return () => {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
      }
    };
  }, [secretContent, isBurned]);

  useEffect(() => {
    if (countdown <= 0 && secretContent && !isBurned) {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
      }
      setIsBurned(true);
      setSecretContent(null);
    }
  }, [countdown, secretContent, isBurned]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <p className="text-xl text-gray-300">Loading secret...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-800 border border-red-700 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-red-300 mb-3">Error</h2>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  if (isBurned) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-orange-400 mb-4">
          Secret Burned
        </h2>
        <p className="text-gray-300">
          This secret has been displayed and is now gone.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          It has also been deleted from the server.
        </p>
      </div>
    );
  }

  if (secretContent) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-indigo-400">
            Your Secret:
          </h2>
          <div className="text-sm text-yellow-400 tabular-nums">
            Self-destructs in: {countdown}s
          </div>
        </div>
        <div className="p-4 bg-gray-700 rounded whitespace-pre-wrap break-words min-h-[100px]">
          <p className="text-gray-200">{secretContent}</p>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          This secret has now been deleted from the server.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
      <p className="text-xl text-gray-300">
        No secret to display or already burned.
      </p>
    </div>
  );
};

export default ViewSecret;
