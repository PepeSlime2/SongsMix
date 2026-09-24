const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'musicas.json');

function carregarMusicas() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function salvarMusicas(musicas) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(musicas, null, 2), 'utf-8');
}

/**
 * Calcula a década (ex: 1987 -> 1980) a partir do ano.
 */
function calcularDecada(ano) {
  return Math.floor(ano / 10) * 10;
}

function listarTodas() {
  return carregarMusicas();
}

function buscarPorId(id) {
  const musicas = carregarMusicas();
  return musicas.find((m) => m.id === Number(id));
}

/**
 * Busca todas as músicas de uma década específica.
 * Aceita tanto "1980" quanto "80" como entrada (normaliza).
 */
function buscarPorDecada(decada) {
  let decadaNum = Number(decada);
  if (decadaNum < 100) {
    // permite atalho tipo "80" -> 1980 (assume 1900/2000 conforme faixa)
    decadaNum = decadaNum >= 50 ? 1900 + decadaNum : 2000 + decadaNum;
  }
  const musicas = carregarMusicas();
  return musicas.filter((m) => calcularDecada(m.ano) === decadaNum);
}

function buscarPorGenero(genero) {
  const musicas = carregarMusicas();
  return musicas.filter(
    (m) => m.genero.toLowerCase().includes(String(genero).toLowerCase())
  );
}

function criar(dadosMusica) {
  const musicas = carregarMusicas();
  const novoId = musicas.length > 0 ? Math.max(...musicas.map((m) => m.id)) + 1 : 1;
  const novaMusica = { id: novoId, ...dadosMusica };
  musicas.push(novaMusica);
  salvarMusicas(musicas);
  return novaMusica;
}

function atualizar(id, dadosAtualizados) {
  const musicas = carregarMusicas();
  const index = musicas.findIndex((m) => m.id === Number(id));
  if (index === -1) return null;
  musicas[index] = { ...musicas[index], ...dadosAtualizados, id: Number(id) };
  salvarMusicas(musicas);
  return musicas[index];
}

function remover(id) {
  const musicas = carregarMusicas();
  const index = musicas.findIndex((m) => m.id === Number(id));
  if (index === -1) return false;
  musicas.splice(index, 1);
  salvarMusicas(musicas);
  return true;
}

module.exports = {
  calcularDecada,
  listarTodas,
  buscarPorId,
  buscarPorDecada,
  buscarPorGenero,
  criar,
  atualizar,
  remover,
};
