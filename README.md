# Catálogo de Músicas por Década — REST + SOAP

## 0. Frontend anos 90

Com a API REST rodando, abra outro terminal e execute:

```bash
cd frontend
npm start
```

- Interface: http://localhost:5173
- O frontend consome `GET http://localhost:3000/musicas`.
- Inclui busca por título/artista, filtros por década e gênero, favoritos locais e player visual.

Trabalho: duas aplicações complementares sobre o mesmo catálogo de músicas (anos 50 até hoje).

- **API REST** (`rest-api/`): CRUD do catálogo, com autenticação JWT, CORS, documentação Swagger/OpenAPI e testes Jest + Supertest.
- **Serviço SOAP** (`soap-service/`): estatísticas calculadas em cima do mesmo catálogo (média de duração por década, contagem por década, década com mais músicas), com WSDL e cliente de teste.

Os dois serviços leem a mesma base (`rest-api/src/data/musicas.json`), reforçando que são complementares.

## Nomes dos integrantes do grupo
> Preencher: Nome completo — RA/matrícula (Pessoa A e Pessoa B).

## 1. Rodando a API REST

```bash
cd rest-api
npm install
npm start
```

- API: http://localhost:3000
- Swagger UI: **http://localhost:3000/api-docs** (print isso pro relatório)
- Login (gera o token JWT): `POST http://localhost:3000/auth/login`
  ```json
  { "usuario": "admin", "senha": "1234" }
  ```

### Endpoints

| Método | Rota                        | Auth?  | Descrição                          |
|--------|-----------------------------|--------|-------------------------------------|
| GET    | `/musicas`                  | não    | lista tudo (aceita `?genero=`)      |
| GET    | `/musicas/decada/:decada`   | não    | filtra por década (ex: `1980`)      |
| GET    | `/musicas/:id`               | não    | busca por id                        |
| POST   | `/musicas`                  | **sim**| cria música                         |
| PUT    | `/musicas/:id`               | **sim**| atualiza música                     |
| DELETE | `/musicas/:id`               | **sim**| remove música                       |
| POST   | `/auth/login`               | não    | retorna JWT                         |

### Roteiro de evidência de segurança (pro relatório)
1. `POST /musicas` sem header `Authorization` → **401**.
2. `POST /auth/login` com `admin`/`1234` → recebe `token`.
3. `POST /musicas` com header `Authorization: Bearer <token>` → **201**.

No Postman/Insomnia: crie uma variável de ambiente `token`, salve o valor retornado no passo 2 e use `Bearer {{token}}` no passo 3.

### Testes

```bash
cd rest-api
npm test
```

Inclui:
- Testes **unitários** do service (`calcularDecada`, `buscarPorDecada`, `buscarPorId`).
- Testes de **integração** dos endpoints (200, 404, 401, 201, 204), incluindo o fluxo de login + rota protegida.

Printe o terminal com `npm test` passando (evidência pedida no enunciado).

## 2. Rodando o serviço SOAP

Em outro terminal:

```bash
cd soap-service
npm install
npm start
```

- WSDL: **http://localhost:8000/estatisticas?wsdl** (abra no navegador ou no SoapUI para importar)
- Endpoint SOAP: `http://localhost:8000/estatisticas`

### Operações disponíveis
- `ContarMusicasPorDecada(decada)` → `{ decada, quantidade }`
- `CalcularMediaDuracaoPorDecada(decada)` → `{ decada, mediaSegundos, quantidadeMusicas }`
- `DecadaComMaisMusicas()` → `{ decada, quantidade }`

### Cliente de teste (evidência de chamada/resposta)

Com o servidor SOAP rodando, em outro terminal:

```bash
cd soap-service
npm run client
```

Isso chama as três operações e imprime as respostas no terminal — printe essa saída pro relatório.

Se preferir usar o **SoapUI**: crie um projeto novo apontando para `http://localhost:8000/estatisticas?wsdl`, ele vai listar as três operações automaticamente; monte uma requisição de exemplo (ex: `<decada>1980</decada>`) e printe a resposta XML.

### Testes

```bash
cd soap-service
npm test
```

Testes unitários da lógica de cálculo (`estatisticasService.js`), independentes do transporte SOAP.

## 3. Checklist de evidências para o relatório

- [ ] API REST rodando (print do Postman/Insomnia batendo em `/musicas`)
- [ ] `POST /musicas` sem token → 401
- [ ] `POST /musicas` com token → 201 (ou 200 em outra rota protegida)
- [ ] Swagger UI aberto no navegador (`/api-docs`)
- [ ] Terminal com `npm test` passando (rest-api)
- [ ] SoapUI ou `npm run client` chamando o serviço SOAP e recebendo resposta
- [ ] Terminal com `npm test` passando (soap-service)
- [ ] Link do repositório no GitHub
- [ ] Nome dos integrantes do grupo

## 4. Divisão sugerida da dupla

- **Pessoa A** — API REST: rotas, JWT, Swagger, testes Jest/Supertest.
- **Pessoa B** — Serviço SOAP: WSDL, implementação das operações, cliente de teste, testes unitários.
- **Juntos**: dados compartilhados (`musicas.json`), este README, prints finais e (se pedido) vídeo de demonstração.

## 5. Estrutura do repositório

```
music-catalog/
├── rest-api/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/swagger.js
│   │   ├── data/musicas.json
│   │   ├── middleware/auth.js
│   │   ├── routes/auth.js
│   │   └── routes/musicas.js
│   ├── tests/
│   │   ├── musicaService.test.js
│   │   └── musicas.integration.test.js
│   └── package.json
├── soap-service/
│   ├── estatisticas.wsdl
│   ├── estatisticasService.js
│   ├── estatisticasService.test.js
│   ├── server.js
│   ├── client.js
│   └── package.json
└── README.md
```
