const path = require('path');
const express = require('express');
const app = express();
const port = 8082;

// Diretório onde estão os arquivos estáticos (ex: html, css, js)

app.use(express.static(path.join(__dirname, '../public')));


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});