const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
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

const dbErr = (err, res) => res.status(500).json({ success: false, message: err.sqlMessage || err.message || 'Erro interno no banco de dados.' });

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco PubliADS (Aiven) com sucesso!');
  db.query('CREATE TABLE IF NOT EXISTS tbClientes (id INT AUTO_INCREMENT PRIMARY KEY, razao_social VARCHAR(150) NOT NULL, cpf_cnpj VARCHAR(20) NOT NULL, contato VARCHAR(50) NOT NULL)', (err) => {
    if (err) console.error('Erro ao criar tbClientes:', err.sqlMessage);
  });
  db.query('DROP TABLE IF EXISTS tbPessoas', () => {
    db.query('CREATE TABLE tbPessoas (pessoa_id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(200) NOT NULL, cpf VARCHAR(14) NOT NULL, nascimento DATE, telefone VARCHAR(20), pessoa_tipo_id INT, atualizado_por INT, atualizado_em DATE)', (err) => {
      if (err) console.error('Erro ao criar tbPessoas:', err.sqlMessage);
    });
  });
});

app.post('/api/login', (req, res) => {
  const { login, senha } = req.body;
  const query = 'SELECT * FROM tbUsuarios WHERE login = ? AND senha = ?';
  db.query(query, [login, senha], (err, results) => {
    if (err) return dbErr(err, res);
    if (results.length > 0) {
      res.json({ success: true, message: 'Acesso liberado' });
    } else {
      res.json({ success: false, message: 'Login ou senha incorretos' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { nome, login, senha } = req.body;
  const checkQuery = 'SELECT * FROM tbUsuarios WHERE login = ?';
  db.query(checkQuery, [login], (err, results) => {
    if (err) return dbErr(err, res);
    if (results.length > 0) {
      return res.json({ success: false, message: 'Este usuário já está em uso.' });
    }
    const insertQuery = 'INSERT INTO tbUsuarios (nome, login, senha) VALUES (?, ?, ?)';
    db.query(insertQuery, [nome, login, senha], (err) => {
      if (err) return dbErr(err, res);
      res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
    });
  });
});

app.get('/api/usuarios', (req, res) => {
  db.query('SELECT nome, login FROM tbUsuarios', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.delete('/api/usuarios/:login', (req, res) => {
  const { login } = req.params;
  db.query('DELETE FROM tbUsuarios WHERE login = ?', [login], (err, result) => {
    if (err) return dbErr(err, res);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuário não encontrado.' });
    res.json({ success: true, message: 'Usuário excluído com sucesso.' });
  });
});

app.put('/api/usuarios/:login', (req, res) => {
  const { login } = req.params;
  const { nome, senha } = req.body;
  if (senha && senha.trim() !== '') {
    db.query('UPDATE tbUsuarios SET nome = ?, senha = ? WHERE login = ?', [nome, senha, login], (err, result) => {
      if (err) return dbErr(err, res);
      if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuário não encontrado.' });
      res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    });
  } else {
    db.query('UPDATE tbUsuarios SET nome = ? WHERE login = ?', [nome, login], (err, result) => {
      if (err) return dbErr(err, res);
      if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuário não encontrado.' });
      res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    });
  }
});

app.get('/api/clientes', (req, res) => {
  db.query('SELECT * FROM tbClientes', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.post('/api/clientes', (req, res) => {
  const { razao_social, cpf_cnpj, contato } = req.body;
  db.query('INSERT INTO tbClientes (razao_social, cpf_cnpj, contato) VALUES (?, ?, ?)', [razao_social, cpf_cnpj, contato], (err, result) => {
    if (err) return dbErr(err, res);
    res.json({ success: true, message: 'Cliente cadastrado com sucesso!', id: result.insertId });
  });
});

app.delete('/api/clientes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tbClientes WHERE id = ?', [id], (err, result) => {
    if (err) return dbErr(err, res);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'Cliente não encontrado.' });
    res.json({ success: true, message: 'Cliente excluído com sucesso.' });
  });
});

app.get('/api/pessoas', (req, res) => {
  db.query('SELECT pessoa_id, nome, cpf, nascimento, telefone FROM tbPessoas', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.post('/api/pessoas', (req, res) => {
  const { nome, cpf, nascimento, telefone } = req.body;
  db.query('INSERT INTO tbPessoas (nome, cpf, nascimento, telefone) VALUES (?, ?, ?, ?)', [nome, cpf, nascimento || null, telefone || null], (err, result) => {
    if (err) return dbErr(err, res);
    res.json({ success: true, message: 'Pessoa cadastrada com sucesso!', id: result.insertId });
  });
});

app.delete('/api/pessoas/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tbPessoas WHERE pessoa_id = ?', [id], (err, result) => {
    if (err) return dbErr(err, res);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'Pessoa não encontrada.' });
    res.json({ success: true, message: 'Pessoa excluída com sucesso.' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});