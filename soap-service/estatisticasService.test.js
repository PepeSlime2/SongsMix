const estatisticasService = require('./estatisticasService');

describe('estatisticasService - unitário (SOAP)', () => {
  test('contarMusicasPorDecada retorna a contagem correta para 1980', () => {
    const resultado = estatisticasService.contarMusicasPorDecada(1980);
    expect(resultado.decada).toBe(1980);
    expect(resultado.quantidade).toBeGreaterThan(0);
  });

  test('calcularMediaDuracaoPorDecada calcula uma média maior que zero para década com músicas', () => {
    const resultado = estatisticasService.calcularMediaDuracaoPorDecada(1990);
    expect(resultado.mediaSegundos).toBeGreaterThan(0);
    expect(resultado.quantidadeMusicas).toBeGreaterThan(0);
  });

  test('calcularMediaDuracaoPorDecada retorna zero para década sem músicas', () => {
    const resultado = estatisticasService.calcularMediaDuracaoPorDecada(1900);
    expect(resultado.mediaSegundos).toBe(0);
    expect(resultado.quantidadeMusicas).toBe(0);
  });

  test('decadaComMaisMusicas retorna uma década válida com quantidade positiva', () => {
    const resultado = estatisticasService.decadaComMaisMusicas();
    expect(resultado.decada).not.toBeNull();
    expect(resultado.quantidade).toBeGreaterThan(0);
  });

  test('normalizarDecada converte atalho de 2 dígitos corretamente', () => {
    expect(estatisticasService.normalizarDecada(80)).toBe(1980);
    expect(estatisticasService.normalizarDecada(20)).toBe(2020);
    expect(estatisticasService.normalizarDecada(1980)).toBe(1980);
  });
});
