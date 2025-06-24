const express = require('express');
const path = require('path');

const app = express();

// Cambia 'mi-app-angular' por el nombre de la carpeta dist que genera Angular
const distDir = path.join(__dirname, 'dist/prisma-frontend');

app.use(express.static(distDir));

app.get('/*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});