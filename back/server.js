const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const db = mysql.createConnection({
  host: 'mysql-3a673102-lucasmenezes08-cd1d.l.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_G8-nByggXykaPj18Yw0',
  database: 'defaultdb',
  port: 15971,
  ssl: {
      rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco PubliADS (Aiven) com sucesso!');
});

app.post('/api/login', (req, res) => {
  const { login, senha } = req.body;
  const query = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';

  db.query(query, [login, senha], (err, results) => {
    if (err) return res.status(500).send(err);
    
    if (results.length > 0) {
      res.send({ success: true, message: 'Acesso liberado' });
    } else {
      res.send({ success: false, message: 'Login ou senha incorretos' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { nome, login, senha } = req.body;
  const query = 'INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)';

  db.query(query, [nome, login, senha], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ success: true, message: 'Usuário cadastrado com sucesso!' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});