const fs = require('fs');
const path = require('path');

// Lê os MESMOS dados usados pela API REST (mesma fonte, os dois serviços são complementares)
const DATA_PATH = path.join(__dirname, '..', 'rest-api', 'src', 'data', 'musicas.json');

function carregarMusicas() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function calcularDecada(ano) {
  return Math.floor(ano / 10) * 10;
}

function normalizarDecada(decada) {
  let d = Number(decada);
  if (d < 100) {
    d = d >= 50 ? 1900 + d : 2000 + d;
  }
  return d;
}

function contarMusicasPorDecada(decadaEntrada) {
  const decada = normalizarDecada(decadaEntrada);
  const musicas = carregarMusicas();
  const quantidade = musicas.filter((m) => calcularDecada(m.ano) === decada).length;
  return { decada, quantidade };
}

function calcularMediaDuracaoPorDecada(decadaEntrada) {
  const decada = normalizarDecada(decadaEntrada);
  const musicas = carregarMusicas().filter((m) => calcularDecada(m.ano) === decada);

  if (musicas.length === 0) {
    return { decada, mediaSegundos: 0, quantidadeMusicas: 0 };
  }

  const totalSegundos = musicas.reduce((soma, m) => soma + (m.duracaoSegundos || 0), 0);
  const mediaSegundos = Math.round((totalSegundos / musicas.length) * 100) / 100;

  return { decada, mediaSegundos, quantidadeMusicas: musicas.length };
}

function decadaComMaisMusicas() {
  const musicas = carregarMusicas();
  const contagemPorDecada = {};

  musicas.forEach((m) => {
    const decada = calcularDecada(m.ano);
    contagemPorDecada[decada] = (contagemPorDecada[decada] || 0) + 1;
  });

  let decadaVencedora = null;
  let maiorQuantidade = -1;

  Object.entries(contagemPorDecada).forEach(([decada, quantidade]) => {
    if (quantidade > maiorQuantidade) {
      maiorQuantidade = quantidade;
      decadaVencedora = Number(decada);
    }
  });

  return { decada: decadaVencedora, quantidade: maiorQuantidade };
}

module.exports = {
  calcularDecada,
  normalizarDecada,
  contarMusicasPorDecada,
  calcularMediaDuracaoPorDecada,
  decadaComMaisMusicas,
};
