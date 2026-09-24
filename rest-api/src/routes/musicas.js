const express = require('express');
const musicaService = require('../services/musicaService');
const { autenticarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Musica:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: "Blinding Lights"
 *         artista:
 *           type: string
 *           example: "The Weeknd"
 *         ano:
 *           type: integer
 *           example: 2020
 *         genero:
 *           type: string
 *           example: "Synth-pop"
 *         duracaoSegundos:
 *           type: integer
 *           example: 200
 */

/**
 * @swagger
 * /musicas:
 *   get:
 *     summary: Lista todas as músicas do catálogo
 *     tags: [Músicas]
 *     parameters:
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *         description: Filtra músicas por gênero (busca parcial)
 *     responses:
 *       200:
 *         description: Lista de músicas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Musica'
 */
router.get('/', (req, res) => {
  const { genero } = req.query;
  const musicas = genero ? musicaService.buscarPorGenero(genero) : musicaService.listarTodas();
  res.json(musicas);
});

/**
 * @swagger
 * /musicas/decada/{decada}:
 *   get:
 *     summary: Lista músicas de uma década específica
 *     tags: [Músicas]
 *     parameters:
 *       - in: path
 *         name: decada
 *         required: true
 *         schema:
 *           type: integer
 *         description: Década desejada (ex 1980, 1990, 2000...)
 *     responses:
 *       200:
 *         description: Lista de músicas da década informada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Musica'
 */
router.get('/decada/:decada', (req, res) => {
  const musicas = musicaService.buscarPorDecada(req.params.decada);
  res.json(musicas);
});

/**
 * @swagger
 * /musicas/{id}:
 *   get:
 *     summary: Busca uma música pelo ID
 *     tags: [Músicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Música encontrada
 *       404:
 *         description: Música não encontrada
 */
router.get('/:id', (req, res) => {
  const musica = musicaService.buscarPorId(req.params.id);
  if (!musica) return res.status(404).json({ erro: 'Música não encontrada.' });
  res.json(musica);
});

/**
 * @swagger
 * /musicas:
 *   post:
 *     summary: Cadastra uma nova música (requer autenticação)
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Musica'
 *     responses:
 *       201:
 *         description: Música criada
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Token inválido
 */
router.post('/', autenticarToken, (req, res) => {
  const { titulo, artista, ano, genero, duracaoSegundos } = req.body || {};
  if (!titulo || !artista || !ano) {
    return res.status(400).json({ erro: 'Campos obrigatórios: titulo, artista, ano.' });
  }
  const novaMusica = musicaService.criar({ titulo, artista, ano, genero, duracaoSegundos });
  res.status(201).json(novaMusica);
});

/**
 * @swagger
 * /musicas/{id}:
 *   put:
 *     summary: Atualiza uma música existente (requer autenticação)
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Musica'
 *     responses:
 *       200:
 *         description: Música atualizada
 *       404:
 *         description: Música não encontrada
 */
router.put('/:id', autenticarToken, (req, res) => {
  const atualizada = musicaService.atualizar(req.params.id, req.body || {});
  if (!atualizada) return res.status(404).json({ erro: 'Música não encontrada.' });
  res.json(atualizada);
});

/**
 * @swagger
 * /musicas/{id}:
 *   delete:
 *     summary: Remove uma música (requer autenticação)
 *     tags: [Músicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Música removida com sucesso
 *       404:
 *         description: Música não encontrada
 */
router.delete('/:id', autenticarToken, (req, res) => {
  const removida = musicaService.remover(req.params.id);
  if (!removida) return res.status(404).json({ erro: 'Música não encontrada.' });
  res.status(204).send();
});

module.exports = router;
