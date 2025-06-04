import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { query, initializeDB } from './config/db.js';
import { encrypt, decrypt } from './utils/cryptoUtils.js';
import logger from './config/logger.js';

dotenv.config();
logger.info('server.js: Script loaded. dotenv.config() called.');

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

logger.debug(
  `server.js: PORT=${PORT}, NODE_ENV=${NODE_ENV}, FRONTEND_URL=${FRONTEND_URL}`
);
logger.debug(
  `server.js: SECRET_KEY_CRYPTO is ${process.env.SECRET_KEY_CRYPTO ? 'set' : 'NOT SET'}`
);

const app = express();
logger.info('server.js: Express app initialized.');

app.use(cors({ origin: FRONTEND_URL }));
logger.info(`server.js: CORS configured for origin: ${FRONTEND_URL}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
logger.info(
  'server.js: express.json and express.urlencoded middleware configured.'
);

app.get('/health', (req, res) => {
  logger.info('server.js: GET /health called');
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
logger.info('server.js: /health route configured.');

app.post('/api/secrets', async (req, res) => {
  logger.info('server.js: POST /api/secrets called');
  const { content, expiresInMinutes } = req.body;
  logger.debug(
    `server.js: POST /api/secrets payload: content present - ${!!content}, expiresInMinutes - ${expiresInMinutes}`
  );

  if (!content || typeof content !== 'string' || content.trim() === '') {
    logger.warn(
      'server.js: POST /api/secrets - Validation failed: Content missing or invalid.'
    );
    return res
      .status(400)
      .json({ error: 'Content is required and must be a non-empty string.' });
  }
  if (content.length > 10000) {
    logger.warn(
      'server.js: POST /api/secrets - Validation failed: Content too long.'
    );
    return res
      .status(400)
      .json({ error: 'Content is too long (max 10000 characters).' });
  }

  let expiresAt = null;
  if (expiresInMinutes) {
    const minutes = parseInt(expiresInMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      logger.warn(
        'server.js: POST /api/secrets - Validation failed: Invalid expiresInMinutes.'
      );
      return res.status(400).json({ error: 'Invalid expiresInMinutes value.' });
    }
    expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    logger.debug(
      `server.js: POST /api/secrets - Secret will expire at: ${expiresAt.toISOString()}`
    );
  }

  try {
    const secretId = uuidv4();
    const { iv, encryptedData, authTag } = encrypt(content);
    logger.debug(
      `server.js: POST /api/secrets - Content encrypted for ID: ${secretId}`
    );

    const insertQueryText = `
      INSERT INTO secrets (id, encrypted_content, iv, auth_tag, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const result = await query(insertQueryText, [
      secretId,
      encryptedData,
      iv,
      authTag,
      expiresAt,
    ]);
    logger.info(
      `server.js: POST /api/secrets - Secret created successfully with ID: ${result.rows[0].id}`
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    logger.error(
      `server.js: POST /api/secrets - Error creating secret: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({ error: 'Failed to create secret.' });
  }
});
logger.info('server.js: POST /api/secrets route configured.');

app.get('/api/secrets/:id', async (req, res) => {
  const { id } = req.params;
  logger.info(`server.js: GET /api/secrets/${id} called.`);

  if (
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      id
    )
  ) {
    logger.warn(`server.js: GET /api/secrets/${id} - Invalid ID format.`);
    return res.status(400).json({ error: 'Invalid secret ID format.' });
  }

  try {
    const selectQueryText = `
      SELECT encrypted_content, iv, auth_tag, expires_at, one_time_view FROM secrets WHERE id = $1;
    `;
    const result = await query(selectQueryText, [id]);

    if (result.rows.length === 0) {
      logger.warn(`server.js: GET /api/secrets/${id} - Secret not found.`);
      return res
        .status(404)
        .json({ error: 'Secret not found or already viewed/expired.' });
    }

    const secretData = result.rows[0];

    if (secretData.expires_at && new Date(secretData.expires_at) < new Date()) {
      logger.info(
        `server.js: GET /api/secrets/${id} - Secret expired. Deleting.`
      );
      await query('DELETE FROM secrets WHERE id = $1;', [id]);
      return res
        .status(404)
        .json({ error: 'Secret not found or already viewed/expired.' });
    }

    const decryptedContent = decrypt(
      secretData.encrypted_content,
      secretData.iv,
      secretData.auth_tag
    );
    logger.debug(`server.js: GET /api/secrets/${id} - Content decrypted.`);

    if (secretData.one_time_view) {
      logger.info(
        `server.js: GET /api/secrets/${id} - One-time secret. Deleting after retrieval.`
      );
      await query('DELETE FROM secrets WHERE id = $1;', [id]);
    }

    res.status(200).json({ content: decryptedContent });
  } catch (error) {
    if (
      error.message.includes('Unsupported state or unable to authenticate data')
    ) {
      logger.error(
        `server.js: GET /api/secrets/${id} - Decryption failed (tampered/wrong key?): ${error.message}`,
        { stack: error.stack }
      );
      return res.status(500).json({
        error:
          'Failed to decrypt secret. It might be corrupted or tampered with.',
      });
    }
    logger.error(
      `server.js: GET /api/secrets/${id} - Error retrieving secret: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({ error: 'Failed to retrieve secret.' });
  }
});
logger.info('server.js: GET /api/secrets/:id route configured.');

let serverInstance;

const startApp = async () => {
  logger.info(`startApp: Initializing application in ${NODE_ENV} mode...`);
  try {
    logger.info('startApp: Attempting to initialize database...');
    await initializeDB();
    logger.info('startApp: Database initialization completed.');

    if (NODE_ENV !== 'test') {
      logger.info(`startApp: Attempting to start server on port ${PORT}...`);
      serverInstance = app.listen(PORT, () => {
        logger.info(`Backend server IS RUNNING on http://localhost:${PORT}`);
        logger.info(`Current NODE_ENV is: ${NODE_ENV}`);
      });

      serverInstance.on('listening', () => {
        logger.info('startApp: Server emitted "listening" event.');
      });

      serverInstance.on('error', (error) => {
        logger.error(
          `startApp: Server 'error' event. Message: ${error.message}`,
          { stack: error.stack }
        );
        if (error.syscall !== 'listen') {
          throw error;
        }
        const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
        switch (error.code) {
          case 'EACCES':
            logger.error(`startApp: ${bind} requires elevated privileges.`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(`startApp: ${bind} is already in use.`);
            process.exit(1);
            break;
          default:
            throw error;
        }
      });
      logger.info(
        'startApp: Express app.listen() called. Server should be starting.'
      );
    } else {
      logger.info(
        'startApp: Running in test mode, server not started by app.listen().'
      );
    }
  } catch (error) {
    logger.error(
      `startApp: CRITICAL - Failed to initialize application or start server: ${error.message}`,
      { stack: error.stack }
    );
    if (NODE_ENV !== 'test') {
      logger.info(
        'startApp: Exiting process due to critical initialization error.'
      );
      process.exit(1);
    } else {
      throw error;
    }
  }
};

const stopApp = async () => {
  return new Promise((resolve, reject) => {
    if (serverInstance) {
      logger.info('stopApp: Attempting to stop server...');
      serverInstance.close((err) => {
        if (err) {
          logger.error(`stopApp: Error stopping server: ${err.message}`, {
            stack: err.stack,
          });
          return reject(err);
        }
        logger.info('stopApp: Server stopped successfully.');
        resolve();
      });
    } else {
      logger.info('stopApp: No server instance to stop.');
      resolve();
    }
  });
};

const esMain = (metaUrl) => {
  if (!metaUrl || !metaUrl.startsWith('file:')) {
    return false;
  }
  const modulePath = new URL(metaUrl).pathname;
  const modulePathNormalized =
    process.platform === 'win32' ? modulePath.substring(1) : modulePath;

  const scriptPath = process.argv[1];

  const normalizePath = (p) => p.toLowerCase().replace(/\\/g, '/');

  const normalizedModulePath = normalizePath(modulePathNormalized);
  const normalizedScriptPath = normalizePath(scriptPath);

  const moduleFilename = normalizedModulePath.substring(
    normalizedModulePath.lastIndexOf('/') + 1
  );
  if (normalizedScriptPath.endsWith(moduleFilename)) {
    return true;
  }
  return normalizedScriptPath === normalizedModulePath;
};

const isMainModule = esMain(import.meta.url);

if (isMainModule) {
  logger.info(
    'server.js is being run directly as the main module, calling startApp().'
  );
  startApp().catch((err) => {
    logger.error(
      `server.js: Unhandled error during startApp() execution: ${err.message}`,
      { stack: err.stack }
    );
    if (NODE_ENV !== 'test') {
      process.exit(1);
    }
  });
} else {
  logger.info(
    'server.js is being imported or run in a way that isMainModule is false, not calling startApp() automatically.'
  );
  logger.debug(`  For debugging isMainModule:`);
  logger.debug(`    import.meta.url: ${import.meta.url}`);
  if (import.meta.url && import.meta.url.startsWith('file:')) {
    const modulePath = new URL(import.meta.url).pathname;
    const modulePathNormalized =
      process.platform === 'win32' ? modulePath.substring(1) : modulePath;
    logger.debug(`    Derived modulePath: ${modulePathNormalized}`);
  }
  logger.debug(`    process.argv[0] (node executable): ${process.argv[0]}`);
  logger.debug(`    process.argv[1] (script being run): ${process.argv[1]}`);
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Global: Unhandled Rejection at:', {
    promise,
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Global: Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  if (NODE_ENV !== 'test') {
    process.exit(1);
  }
});

export default app;
export { startApp, stopApp };
