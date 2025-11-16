const express = require('express');
const path = require('path');
const app = express();

const distDir = path.join(__dirname, 'dist', 'prisma-frontend', 'browser');

app.use(express.static(distDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
