const soap = require('soap');

const WSDL_URL = 'http://localhost:8000/estatisticas?wsdl';

async function main() {
  console.log(`Conectando ao WSDL: ${WSDL_URL}\n`);
  const client = await soap.createClientAsync(WSDL_URL);

  console.log('--- ContarMusicasPorDecada(1980) ---');
  const [contagem] = await client.ContarMusicasPorDecadaAsync({ decada: 1980 });
  console.log(contagem, '\n');

  console.log('--- CalcularMediaDuracaoPorDecada(1990) ---');
  const [media] = await client.CalcularMediaDuracaoPorDecadaAsync({ decada: 1990 });
  console.log(media, '\n');

  console.log('--- DecadaComMaisMusicas() ---');
  const [decadaTop] = await client.DecadaComMaisMusicasAsync({});
  console.log(decadaTop, '\n');
}

main().catch((err) => {
  console.error('Erro ao chamar o serviço SOAP:', err.message);
  process.exit(1);
});
