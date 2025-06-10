import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CreateSecretFormProps {
  onSecretCreated: (secretId: string) => void;
}

const CreateSecretForm: React.FC<CreateSecretFormProps> = ({ onSecretCreated }) => {
  const [content, setContent] = useState<string>('');
  const [expiresInMinutes, setExpiresInMinutes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecretId, setCreatedSecretId] = useState<string | null>(null);

  const apiBaseUrlFromEnv = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedSecretId(null);

    if (typeof apiBaseUrlFromEnv !== 'string' || !apiBaseUrlFromEnv) {
      setError('API configuration error: Base URL is missing.');
      setIsLoading(false);
      return;
    }
    const apiUrl: string = apiBaseUrlFromEnv;

    if (!content.trim()) {
      setError('Secret content cannot be empty.');
      setIsLoading(false);
      return;
    }

    try {
      const body: { content: string; expiresInMinutes?: number } = { content };
      const parsedMinutes = parseInt(expiresInMinutes, 10);

      if (expiresInMinutes) {
        if (isNaN(parsedMinutes) || parsedMinutes <= 0) {
          setError('If provided, "Expires in Minutes" must be a positive number.');
          setIsLoading(false);
          return;
        }
        body.expiresInMinutes = parsedMinutes;
      }

      const response = await fetch(`${apiUrl}/secrets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create secret: ${response.statusText}`);
      }

      const result = await response.json();
      setCreatedSecretId(result.id);
      onSecretCreated(result.id);
      setContent('');
      setExpiresInMinutes('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    handleSubmit(event).catch((err) => {
      console.error(err);
    });
  }

  if (createdSecretId) {
    if (typeof apiBaseUrlFromEnv !== 'string' || !apiBaseUrlFromEnv) {
        return <div className="p-3 bg-red-700 text-red-100 rounded-md"><p>Configuration error.</p></div>;
    }
    const secretUrl = `${window.location.origin}/secret/${createdSecretId}`;
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-green-400 mb-4">Secret Created!</h2>
        <p className="mb-2 text-gray-300">Share this link (it will only work once):</p>
        <input
          type="text"
          value={secretUrl}
          readOnly
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white mb-4 focus:ring-indigo-500 focus:border-indigo-500"
          onFocus={(e) => { e.target.select(); }}
        />
        <div className="my-4 flex justify-center">
          <QRCodeSVG
            value={secretUrl}
            size={128}
            bgColor={"#ffffff"}
            fgColor={"#1f2937"}
            level={"L"}
            marginSize={0}
          />
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(secretUrl); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out mr-2 mb-2 sm:mb-0"
        >
          Copy Link
        </button>
        <button
          onClick={() => { setCreatedSecretId(null); }}
          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Create Another Secret
        </button>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form
      onSubmit={handleSubmit}
    >
      <div>
        <button type="submit">
          Create Another Secret
        </button>
      </div>
    </form>
  );}