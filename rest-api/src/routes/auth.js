const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Usuário fixo só para fins acadêmicos/demonstração do fluxo de auth
const USUARIO_VALIDO = { usuario: 'admin', senha: '1234' };

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               senha:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login efetuado, token retornado
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', (req, res) => {
  const { usuario, senha } = req.body || {};

  if (usuario !== USUARIO_VALIDO.usuario || senha !== USUARIO_VALIDO.senha) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

module.exports = router;
