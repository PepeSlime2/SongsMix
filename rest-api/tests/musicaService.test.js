const musicaService = require('../src/services/musicaService');

describe('musicaService - unitário', () => {
  test('calcularDecada calcula corretamente a década a partir do ano', () => {
    expect(musicaService.calcularDecada(1987)).toBe(1980);
    expect(musicaService.calcularDecada(2003)).toBe(2000);
    expect(musicaService.calcularDecada(1959)).toBe(1950);
    expect(musicaService.calcularDecada(2024)).toBe(2020);
  });

  test('buscarPorDecada retorna apenas músicas da década informada (formato completo)', () => {
    const resultado = musicaService.buscarPorDecada(1980);
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((musica) => {
      expect(musicaService.calcularDecada(musica.ano)).toBe(1980);
    });
  });

  test('buscarPorDecada aceita atalho de 2 dígitos (ex: 90 -> 1990)', () => {
    const resultadoCompleto = musicaService.buscarPorDecada(1990);
    const resultadoAtalho = musicaService.buscarPorDecada(90);
    expect(resultadoAtalho.length).toBe(resultadoCompleto.length);
  });

  test('buscarPorDecada retorna array vazio para década sem músicas cadastradas', () => {
    const resultado = musicaService.buscarPorDecada(1900);
    expect(resultado).toEqual([]);
  });

  test('buscarPorId retorna a música correta', () => {
    const musica = musicaService.buscarPorId(1);
    expect(musica).toBeDefined();
    expect(musica.titulo).toBe('Rock Around the Clock');
  });

  test('buscarPorId retorna undefined para id inexistente', () => {
    const musica = musicaService.buscarPorId(99999);
    expect(musica).toBeUndefined();
  });
});
