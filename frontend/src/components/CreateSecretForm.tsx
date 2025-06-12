import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
interface CreateSecretFormProps {
  onSecretCreated: (secretId: string) => void;
}
const CreateSecretForm: React.FC<CreateSecretFormProps> = ({
  onSecretCreated,
}) => {
  const [content, setContent] = useState<string>('');
  const [expiresInMinutes, setExpiresInMinutes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSecretId, setCreatedSecretId] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [passwordCopied, setPasswordCopied] = useState<boolean>(false);
  const [passwordLength, setPasswordLength] = useState<number>(16);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const apiBaseUrlFromEnv = import.meta.env.VITE_API_BASE_URL;
  const handlePasswordLengthChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const length = parseInt(e.target.value, 10);
    if (length > 0 && length <= 128) {
      setPasswordLength(length);
    } else if (e.target.value === '') {
      setPasswordLength(0);
    }
  };
  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
  };
  const copyToClipboardInternal = (
    textToCopy: string,
    successMessage: string
  ) => {
    setError(null);
    if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          showFeedback(successMessage);
          if (textToCopy === generatedPassword) setPasswordCopied(true);
        })
        .catch((err: unknown) => {
          setError('Fehler beim Kopieren. Bitte manuell kopieren.');
          console.error('Kopierfehler:', err);
        });
    } else {
      setError('Clipboard API wird nicht unterstützt. Bitte manuell kopieren.');
    }
  };
  const generatePassword = () => {
    if (passwordLength <= 0) {
      setError('Bitte eine gültige Passwortlänge eingeben (z.B. 8-128).');
      setGeneratedPassword('');
      return;
    }
    setError(null);
    setFeedbackMessage('');
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let newPassword = '';
    for (let i = 0, n = charset.length; i < passwordLength; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    setGeneratedPassword(newPassword);
    setPasswordCopied(false);
    copyToClipboardInternal(newPassword, 'Passwort kopiert!');
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedSecretId(null);
    setFeedbackMessage('');
    if (!content.trim()) {
      setError('Der Inhalt des Geheimnisses darf nicht leer sein.');
      setIsLoading(false);
      return;
    }
    try {
      const body: { content: string; expiresInMinutes?: number } = { content };
      const parsedMinutes = parseInt(expiresInMinutes, 10);
      if (expiresInMinutes) {
        if (isNaN(parsedMinutes) || parsedMinutes <= 0) {
          setError(
            'Wenn angegeben, muss "Ablauf in Minuten" eine positive Zahl sein.'
          );
          setIsLoading(false);
          return;
        }
        body.expiresInMinutes = parsedMinutes;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const response = await fetch(`${apiBaseUrlFromEnv}/secrets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Fehler beim Erstellen des Geheimnisses: ${response.statusText}`
        );
      }
      const result = await response.json();
      setCreatedSecretId(result.id);
      onSecretCreated(result.id);
      setContent('');
      setExpiresInMinutes('');
      setGeneratedPassword('');
      setPasswordCopied(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (createdSecretId) {
    const secretUrl = `${window.location.origin}/secret/${createdSecretId}`;
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-green-400 mb-4">
          Geheimnis erstellt!
        </h2>
        <p className="mb-2 text-gray-300">
          Teilen Sie diesen Link (er funktioniert nur einmal):
        </p>
        <input
          type="text"
          value={secretUrl}
          readOnly
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white mb-4 focus:ring-indigo-500 focus:border-indigo-500"
          onFocus={(e) => {
            e.target.select();
          }}
        />
        <div className="my-4 flex justify-center">
          <QRCodeSVG
            value={secretUrl}
            size={128}
            bgColor={'#ffffff'}
            fgColor={'#1f2937'}
            level={'L'}
            marginSize={0}
          />
        </div>
        <button
          onClick={() => {
            copyToClipboardInternal(secretUrl, 'Link kopiert!');
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out mr-2 mb-2 sm:mb-0"
        >
          Link kopieren
        </button>
        <button
          onClick={() => {
            setCreatedSecretId(null);
            setFeedbackMessage('');
            setError(null);
          }}
          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Ein weiteres Geheimnis erstellen
        </button>
      </div>
    );
  }
  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-gray-800 rounded-lg shadow-md"
    >
      <div>
        <label
          htmlFor="secretContent"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Ihr Geheimnisinhalt
        </label>
        <textarea
          id="secretContent"
          name="secretContent"
          rows={6}
          className="w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
          placeholder="Geben Sie hier Ihre geheime Nachricht ein... oder klicken Sie auf generieren."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          disabled={isLoading}
          required
        />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center space-x-2">
            <label
              htmlFor="passwordLength"
              className="text-xs text-gray-400 whitespace-nowrap"
            >
              Länge:
            </label>
            <input
              type="number"
              id="passwordLength"
              value={passwordLength === 0 ? '' : passwordLength}
              onChange={handlePasswordLengthChange}
              min="8"
              max="128"
              className="w-16 p-1 text-xs border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={generatePassword}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white py-1.5 px-3 rounded whitespace-nowrap"
          >
            Passwort generieren & Kopieren
          </button>
        </div>
        {generatedPassword && (
          <div className="mt-2 text-xs text-green-400">
            <p className="break-all">
              Generiert:{' '}
              <span className="font-mono bg-gray-700 p-1 rounded">
                {generatedPassword}
              </span>
              {passwordCopied
                ? ' (Kopiert!)'
                : ' (Manuell kopieren, falls nötig)'}
            </p>
            <button
              type="button"
              onClick={() => {
                setContent(generatedPassword);
              }}
              className="mt-1 text-xs underline hover:text-green-300"
            >
              Dieses Passwort verwenden
            </button>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="expiresInMinutes"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Ablauf in (Minuten, optional)
        </label>
        <input
          id="expiresInMinutes"
          name="expiresInMinutes"
          type="number"
          min="1"
          className="w-full p-3 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
          placeholder="z.B. 60 für 1 Stunde"
          value={expiresInMinutes}
          onChange={(e) => {
            setExpiresInMinutes(e.target.value);
          }}
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="p-3 bg-red-700 border border-red-900 text-red-100 rounded-md my-4">
          <p>{error}</p>
        </div>
      )}
      {feedbackMessage && !error && (
        <div className="p-3 bg-green-700 border border-green-900 text-green-100 rounded-md my-4">
          <p>{feedbackMessage}</p>
        </div>
      )}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:opacity-50 transition duration-150 ease-in-out"
        >
          {isLoading ? 'Erstelle...' : 'Geheimnis erstellen & Link erhalten'}
        </button>
      </div>
    </form>
  );
};
export default CreateSecretForm;
