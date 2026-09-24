const request = require('supertest');
const app = require('../src/app');

describe('API de Músicas - integração', () => {
  let token;

  test('GET /musicas retorna 200 e uma lista', async () => {
    const res = await request(app).get('/musicas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /musicas/decada/1990 retorna apenas músicas dos anos 90', async () => {
    const res = await request(app).get('/musicas/decada/1990');
    expect(res.statusCode).toBe(200);
    res.body.forEach((m) => expect(m.ano).toBeGreaterThanOrEqual(1990));
  });

  test('GET /musicas/:id inexistente retorna 404', async () => {
    const res = await request(app).get('/musicas/999999');
    expect(res.statusCode).toBe(404);
  });

  test('POST /musicas SEM token retorna 401 (evidência de segurança)', async () => {
    const res = await request(app)
      .post('/musicas')
      .send({ titulo: 'Teste', artista: 'Teste', ano: 2024 });
    expect(res.statusCode).toBe(401);
  });

  test('POST /auth/login com credenciais válidas retorna token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ usuario: 'admin', senha: '1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('POST /auth/login com credenciais inválidas retorna 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ usuario: 'admin', senha: 'errada' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /musicas COM token válido retorna 201 (evidência de segurança)', async () => {
    const res = await request(app)
      .post('/musicas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Música de Teste', artista: 'Artista Teste', ano: 2024, genero: 'Teste', duracaoSegundos: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();

    // limpa o dado criado para não sujar a base
    const del = await request(app)
      .delete(`/musicas/${res.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(204);
  });

  test('PUT /musicas/:id sem token retorna 401', async () => {
    const res = await request(app).put('/musicas/1').send({ titulo: 'Alterado' });
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /musicas/:id sem token retorna 401', async () => {
    const res = await request(app).delete('/musicas/1');
    expect(res.statusCode).toBe(401);
  });
});
