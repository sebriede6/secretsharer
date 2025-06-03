import pg from 'pg';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const { Pool } = pg;

logger.info('db.js: Script loaded.');
logger.debug(
  `db.js: DATABASE_URL from env: ${process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED'}`
);
logger.debug(`db.js: NODE_ENV from env: ${process.env.NODE_ENV}`);

let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });
  logger.info('db.js: PostgreSQL Pool created.');

  pool.on('connect', (_client) => {
    logger.info('DB Pool Event: Client connected.');
    _client.on('error', (err) => {
      logger.error(`DB Pool Event: Error on connected client: ${err.message}`, {
        stack: err.stack,
      });
    });
  });

  pool.on('error', (err, _client) => {
    logger.error(
      `DB Pool Event: Unexpected error on idle client. Error: ${err.message}`,
      { stack: err.stack }
    );
    if (process.env.NODE_ENV !== 'test') {
      logger.error('DB Pool Event: Exiting process due to pool error.');
      process.exit(-1);
    } else {
      // intentionally empty
    }
  });

  pool.on('acquire', (_client) => {
    logger.debug('DB Pool Event: Client acquired from pool.');
  });

  pool.on('remove', (_client) => {
    logger.debug('DB Pool Event: Client removed from pool.');
  });
} catch (error) {
  logger.error(
    `db.js: Failed to create PostgreSQL Pool. Error: ${error.message}`,
    { stack: error.stack }
  );
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  } else {
    throw error;
  }
}

const query = async (text, params) => {
  if (!pool) {
    logger.error('db.js query: Pool is not initialized!');
    throw new Error('Database pool not initialized.');
  }
  const start = Date.now();
  logger.debug(
    `db.js query: Attempting to execute query: ${text.substring(0, 100)}...`
  );
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(
      `db.js query: Executed successfully. Duration: ${duration}ms Rows: ${res.rowCount}`
    );
    return res;
  } catch (error) {
    logger.error(
      `db.js query: Error executing query: ${text.substring(0, 100)}... Error: ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

const initializeDB = async () => {
  logger.info('initializeDB: Attempting to create/check secrets table...');
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS secrets (
      id UUID PRIMARY KEY,
      encrypted_content TEXT NOT NULL,
      iv TEXT NOT NULL,
      auth_tag TEXT NOT NULL,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      one_time_view BOOLEAN DEFAULT TRUE
    );
  `;
  try {
    await query(createTableQuery);
    logger.info('initializeDB: Secrets table checked/created successfully.');
  } catch (error) {
    logger.error(
      `initializeDB: Error creating/checking secrets table: ${error.message}`,
      { stack: error.stack }
    );
    throw error;
  }
};

if (pool && process.env.NODE_ENV !== 'test') {
  pool
    .connect()
    .then((client) => {
      logger.info(
        'db.js: Successfully connected to PostgreSQL on module load for a quick test.'
      );
      client.release();
    })
    .catch((err) => {
      logger.error(
        `db.js: Failed to connect to PostgreSQL on module load for a quick test. Error: ${err.message}`,
        { stack: err.stack }
      );
    });
}

export { query, initializeDB, pool };
