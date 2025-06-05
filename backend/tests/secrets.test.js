import request from 'supertest';
import app, { startApp, stopApp } from '../server.js';
import { query, pool as dbPool } from '../config/db.js';

describe('Secrets API', () => {
  beforeAll(async () => {
    try {
      // Ensure we're using test database and correct credentials
      process.env.NODE_ENV = 'test';
      // Use CI environment variables if running in CI, otherwise use local test env
      if (process.env.CI) {
        process.env.DATABASE_USER = 'testuser';
        process.env.DATABASE_PASSWORD = 'testpassword';
        process.env.DATABASE_NAME = 'testdb_ci';
      }

      await startApp();
      // Create fresh table for tests with all required columns
      await query('DROP TABLE IF EXISTS secrets;', []);
      await query(
        `
        CREATE TABLE secrets (
          id UUID PRIMARY KEY,
          encrypted_content TEXT NOT NULL,
          iv TEXT NOT NULL,
          auth_tag TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE,
          accessed BOOLEAN DEFAULT FALSE,
          one_time_view BOOLEAN DEFAULT TRUE
        );
      `,
        []
      );
    } catch (error) {
      console.error('Error during test setup (beforeAll):', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await query('DROP TABLE IF EXISTS secrets;', []);
      await stopApp();
      await dbPool.end();
    } catch (error) {
      console.error('Error during test cleanup (afterAll):', error);
    }
  });

  let _secretId;

  it('POST /api/secrets - should create a new secret', async () => {
    const res = await request(app)
      .post('/api/secrets')
      .send({ content: 'My test secret', expiresInMinutes: 5 });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    _secretId = res.body.id;
  });

  it('POST /api/secrets - should fail with missing content', async () => {
    const res = await request(app)
      .post('/api/secrets')
      .send({ expiresInMinutes: 5 });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      'error',
      'Content is required and must be a non-empty string.'
    );
  });

  it('GET /api/secrets/:id - should retrieve and delete the secret', async () => {
    const creationRes = await request(app).post('/api/secrets').send({
      content: 'A temporary secret for retrieval test',
      expiresInMinutes: 1,
    });
    expect(creationRes.statusCode).toEqual(201);
    const tempSecretId = creationRes.body.id;

    const res = await request(app).get(`/api/secrets/${tempSecretId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      'content',
      'A temporary secret for retrieval test'
    );

    const resAfter = await request(app).get(`/api/secrets/${tempSecretId}`);
    expect(resAfter.statusCode).toEqual(404);
  });

  it('GET /api/secrets/:id - should return 404 for non-existent secret', async () => {
    const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
    const res = await request(app).get(`/api/secrets/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
  });

  it('GET /api/secrets/:id - should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';
    const res = await request(app).get(`/api/secrets/${invalidId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid secret ID format.');
  });
});
