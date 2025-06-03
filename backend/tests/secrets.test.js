import request from 'supertest';
import app, { startApp, stopApp } from '../server.js';
import { query, pool as dbPool } from '../config/db.js'; // pool importieren

describe('Secrets API', () => {
  beforeAll(async () => {
    try {
      await startApp(); // Stellt sicher, dass initializeDB aufgerufen wird
      // Tabelle vor jedem Testlauf leeren (nachdem initializeDB sie ggf. erstellt hat)
      await query('TRUNCATE TABLE secrets RESTART IDENTITY CASCADE;', []);
    } catch (error) {
      // Wenn startApp fehlschlägt, wird der Fehler hier geworfen
      // und die Testsuite sollte fehlschlagen.
      console.error('Error during test setup (beforeAll):', error);
      throw error; // Fehler weiterwerfen, um den Test fehlschlschlagen zu lassen
    }
  });

  afterAll(async () => {
    await stopApp(); // Den Express-Server stoppen (falls er lief)
    await dbPool.end(); // Den Datenbank-Pool schließen
  });

  let secretId;

  it('POST /api/secrets - should create a new secret', async () => {
    const res = await request(app)
      .post('/api/secrets')
      .send({ content: 'My test secret', expiresInMinutes: 5 });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    secretId = res.body.id;
  });

  it('POST /api/secrets - should fail with missing content', async () => {
    const res = await request(app)
      .post('/api/secrets')
      .send({ expiresInMinutes: 5 });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Content is required and must be a non-empty string.');
  });

  it('GET /api/secrets/:id - should retrieve and delete the secret', async () => {
    // Erstelle zuerst ein Secret für diesen Test, da es nach jedem Test gelöscht wird
    const creationRes = await request(app)
      .post('/api/secrets')
      .send({ content: 'A temporary secret for retrieval test', expiresInMinutes: 1 });
    expect(creationRes.statusCode).toEqual(201);
    const tempSecretId = creationRes.body.id;

    const res = await request(app).get(`/api/secrets/${tempSecretId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('content', 'A temporary secret for retrieval test');

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