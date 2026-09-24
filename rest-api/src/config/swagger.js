const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Catálogo de Músicas por Década',
      version: '1.0.0',
      description:
        'API REST para consulta e gestão de um catálogo de músicas organizado por décadas ' +
        '(anos 50 até hoje). Trabalho acadêmico - Capítulo 12/13 (REST + segurança + documentação + testes).',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJSDoc(options);
