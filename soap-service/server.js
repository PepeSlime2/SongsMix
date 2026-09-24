const http = require('http');
const fs = require('fs');
const path = require('path');
const soap = require('soap');

const estatisticasService = require('./estatisticasService');

const PORT = process.env.SOAP_PORT || 8000;

// Implementação das operações, no formato exigido pelo pacote "soap"
const service = {
  EstatisticasMusicaisService: {
    EstatisticasMusicaisPort: {
      ContarMusicasPorDecada: function (args) {
        return estatisticasService.contarMusicasPorDecada(args.decada);
      },
      CalcularMediaDuracaoPorDecada: function (args) {
        return estatisticasService.calcularMediaDuracaoPorDecada(args.decada);
      },
      DecadaComMaisMusicas: function () {
        return estatisticasService.decadaComMaisMusicas();
      },
    },
  },
};

const wsdlXml = fs.readFileSync(path.join(__dirname, 'estatisticas.wsdl'), 'utf-8');

const server = http.createServer((req, res) => {
  res.end('Serviço SOAP de Estatísticas Musicais. Acesse /estatisticas?wsdl para ver o WSDL.');
});

server.listen(PORT, () => {
  soap.listen(server, '/estatisticas', service, wsdlXml);
  console.log(`Serviço SOAP rodando em http://localhost:${PORT}/estatisticas`);
  console.log(`WSDL disponível em http://localhost:${PORT}/estatisticas?wsdl`);
});
