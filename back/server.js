const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const db = mysql.createConnection({
  host: 'mysql-3a673102-lucasmenezes08-cd1d.l.aivencloud.com',
  user: 'avnadmin',
  password: process.env.DB_PASSWORD, 
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
  const checkQuery = 'SELECT * FROM tbUsuarios WHERE login = ?';

  db.query(checkQuery, [login], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0) {
      return res.send({ success: false, message: 'Este usuário já está em uso.' });
    }

    const insertQuery = 'INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)';
    
    db.query(insertQuery, [nome, login, senha], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ success: true, message: 'Usuário cadastrado com sucesso!' });
    });
  });
});

app.get('/api/usuarios', (req, res) => {
  const query = 'SELECT nome, login FROM tbUsuarios';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.delete('/api/usuarios/:login', (req, res) => {
  const { login } = req.params;
  const query = 'DELETE FROM tbUsuarios WHERE login = ?';
  db.query(query, [login], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.send({ success: false, message: 'Usuário não encontrado.' });
    res.send({ success: true, message: 'Usuário excluído com sucesso.' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});