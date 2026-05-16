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

  db.query('CREATE TABLE IF NOT EXISTS tbUsuarios (usuario_id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(200) NOT NULL, login VARCHAR(50) NOT NULL UNIQUE, senha VARCHAR(255) NOT NULL, atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, atualizado_por INT)', (err) => {
    if (err) console.error('Erro ao criar tbUsuarios:', err.sqlMessage);
  });

  db.query('CREATE TABLE IF NOT EXISTS tbPessoaTipo (pessoa_tipo_id INT AUTO_INCREMENT PRIMARY KEY, descricao VARCHAR(200) NOT NULL)', (err) => {
    if (err) console.error('Erro ao criar tbPessoaTipo:', err.sqlMessage);
    else {
      db.query("INSERT IGNORE INTO tbPessoaTipo (pessoa_tipo_id, descricao) VALUES (1, 'Física'), (2, 'Jurídica')", (err2) => {
        if (err2) console.error('Erro ao popular tbPessoaTipo:', err2.sqlMessage);
      });
    }
  });

  db.query('CREATE TABLE IF NOT EXISTS tbPessoas (pessoa_id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(200) NOT NULL, cpf VARCHAR(14) NOT NULL, nascimento DATE, telefone VARCHAR(20), pessoa_tipo_id INT, atualizado_por INT, atualizado_em DATE)', (err) => {
    if (err) console.error('Erro ao criar tbPessoas:', err.sqlMessage);
  });

  db.query('CREATE TABLE IF NOT EXISTS tbPlataforma (plataforma_id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100) NOT NULL)', (err) => {
    if (err) console.error('Erro ao criar tbPlataforma:', err.sqlMessage);
    else {
      db.query("INSERT IGNORE INTO tbPlataforma (plataforma_id, nome) VALUES (1,'Google Ads'),(2,'Meta Ads'),(3,'TikTok Ads'),(4,'LinkedIn Ads'),(5,'Twitter Ads'),(6,'YouTube Ads')", (err2) => {
        if (err2) console.error('Erro ao popular tbPlataforma:', err2.sqlMessage);
      });
    }
  });

  db.query('CREATE TABLE IF NOT EXISTS tbAnuncio (anuncio_id INT AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(100) NOT NULL, descricao VARCHAR(200) NOT NULL, valor DECIMAL(10,2) NOT NULL, data_inico DATE NOT NULL, data_fim DATE NOT NULL, cliente_id INT, plataforma_id INT, atualizado_por INT, atualizado_em DATETIME)', (err) => {
    if (err) console.error('Erro ao criar tbAnuncio:', err.sqlMessage);
  });

  db.query('CREATE TABLE IF NOT EXISTS tbClientes (id INT AUTO_INCREMENT PRIMARY KEY, razao_social VARCHAR(150) NOT NULL, cpf_cnpj VARCHAR(20) NOT NULL, contato VARCHAR(50) NOT NULL)', (err) => {
    if (err) console.error('Erro ao criar tbClientes:', err.sqlMessage);
  });
});

app.post('/api/login', (req, res) => {
  const { login, senha } = req.body;
  db.query('SELECT usuario_id, nome, login FROM tbUsuarios WHERE login = ? AND senha = ?', [login, senha], (err, results) => {
    if (err) return dbErr(err, res);
    if (results.length > 0) {
      res.json({ success: true, message: 'Acesso liberado', usuario_id: results[0].usuario_id, nome: results[0].nome, login: results[0].login });
    } else {
      res.json({ success: false, message: 'Login ou senha incorretos' });
    }
  });
});

app.post('/api/register', (req, res) => {
  const { nome, login, senha } = req.body;
  db.query('SELECT usuario_id FROM tbUsuarios WHERE login = ?', [login], (err, results) => {
    if (err) return dbErr(err, res);
    if (results.length > 0) return res.json({ success: false, message: 'Este usuário já está em uso.' });
    const atualizado_em = new Date();
    db.query('INSERT INTO tbUsuarios (nome, login, senha, atualizado_em) VALUES (?, ?, ?, ?)', [nome, login, senha, atualizado_em], (err) => {
      if (err) return dbErr(err, res);
      res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
    });
  });
});

app.get('/api/usuarios', (req, res) => {
  db.query('SELECT usuario_id, nome, login FROM tbUsuarios', (err, results) => {
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
  const atualizado_em = new Date();
  if (senha && senha.trim() !== '') {
    db.query('UPDATE tbUsuarios SET nome = ?, senha = ?, atualizado_em = ? WHERE login = ?', [nome, senha, atualizado_em, login], (err, result) => {
      if (err) return dbErr(err, res);
      if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuário não encontrado.' });
      res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    });
  } else {
    db.query('UPDATE tbUsuarios SET nome = ?, atualizado_em = ? WHERE login = ?', [nome, atualizado_em, login], (err, result) => {
      if (err) return dbErr(err, res);
      if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuário não encontrado.' });
      res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    });
  }
});

app.get('/api/pessoas', (req, res) => {
  db.query('SELECT pessoa_id, nome, cpf, nascimento, telefone, pessoa_tipo_id FROM tbPessoas', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.post('/api/pessoas', (req, res) => {
  const { nome, cpf, nascimento, telefone, pessoa_tipo_id, atualizado_por } = req.body;
  const atualizado_em = new Date();
  const resolverUid = (valor, cb) => {
    const num = parseInt(valor);
    if (!isNaN(num) && num > 0) return cb(num);
    if (valor && typeof valor === 'string' && valor.includes('@')) {
      return db.query('SELECT usuario_id FROM tbUsuarios WHERE login = ? LIMIT 1', [valor], (err, rows) => {
        if (!err && rows.length > 0) return cb(rows[0].usuario_id);
        return cb(1);
      });
    }
    return cb(1);
  };
  resolverUid(atualizado_por, (uid) => {
    db.query('INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id, atualizado_por, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?)', [nome, cpf, nascimento || null, telefone || null, pessoa_tipo_id || null, uid, atualizado_em], (err, result) => {
      if (err) return dbErr(err, res);
      res.json({ success: true, message: 'Pessoa cadastrada com sucesso!', id: result.insertId });
    });
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

app.get('/api/tipos-pessoa', (req, res) => {
  db.query('SELECT pessoa_tipo_id, descricao FROM tbPessoaTipo ORDER BY pessoa_tipo_id', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.get('/api/pessoatipos', (req, res) => {
  db.query('SELECT pessoa_tipo_id, descricao FROM tbPessoaTipo ORDER BY pessoa_tipo_id', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.get('/api/plataformas', (req, res) => {
  db.query('SELECT plataforma_id, nome FROM tbPlataforma ORDER BY nome', (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.get('/api/anuncios', (req, res) => {
  const sql = `SELECT a.anuncio_id, a.titulo, a.descricao, a.valor, a.data_inico, a.data_fim, a.cliente_id, a.plataforma_id, a.atualizado_por, a.atualizado_em, p.nome AS cliente_nome, pl.nome AS plataforma_nome FROM tbAnuncio a LEFT JOIN tbPessoas p ON a.cliente_id = p.pessoa_id LEFT JOIN tbPlataforma pl ON a.plataforma_id = pl.plataforma_id ORDER BY a.anuncio_id DESC`;
  db.query(sql, (err, results) => {
    if (err) return dbErr(err, res);
    res.json(results);
  });
});

app.get('/api/anuncios/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT a.anuncio_id, a.titulo, a.descricao, a.valor, a.data_inico, a.data_fim, a.cliente_id, a.plataforma_id, a.atualizado_por, a.atualizado_em, p.nome AS cliente_nome, pl.nome AS plataforma_nome FROM tbAnuncio a LEFT JOIN tbPessoas p ON a.cliente_id = p.pessoa_id LEFT JOIN tbPlataforma pl ON a.plataforma_id = pl.plataforma_id WHERE a.anuncio_id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return dbErr(err, res);
    if (results.length === 0) return res.json({ success: false, message: 'Anúncio não encontrado.' });
    res.json(results[0]);
  });
});

app.post('/api/anuncios', (req, res) => {
  const { titulo, descricao, valor, data_inico, data_fim, cliente_id, plataforma_id, atualizado_por } = req.body;
  const atualizado_em = new Date();
  const uid = parseInt(atualizado_por) || null;
  db.query('INSERT INTO tbAnuncio (titulo, descricao, valor, data_inico, data_fim, cliente_id, plataforma_id, atualizado_por, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [titulo, descricao, valor, data_inico, data_fim, cliente_id || null, plataforma_id || null, uid, atualizado_em], (err, result) => {
    if (err) return dbErr(err, res);
    res.json({ success: true, message: 'Anúncio cadastrado com sucesso!', id: result.insertId });
  });
});

app.put('/api/anuncios/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, valor, data_inico, data_fim, cliente_id, plataforma_id, atualizado_por } = req.body;
  const atualizado_em = new Date();
  const uid = parseInt(atualizado_por) || null;
  db.query('UPDATE tbAnuncio SET titulo = ?, descricao = ?, valor = ?, data_inico = ?, data_fim = ?, cliente_id = ?, plataforma_id = ?, atualizado_por = ?, atualizado_em = ? WHERE anuncio_id = ?', [titulo, descricao, valor, data_inico, data_fim, cliente_id || null, plataforma_id || null, uid, atualizado_em, id], (err, result) => {
    if (err) return dbErr(err, res);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'Anúncio não encontrado.' });
    res.json({ success: true, message: 'Anúncio atualizado com sucesso.' });
  });
});

app.delete('/api/anuncios/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tbAnuncio WHERE anuncio_id = ?', [id], (err, result) => {
    if (err) return dbErr(err, res);
    if (result.affectedRows === 0) return res.json({ success: false, message: 'Anúncio não encontrado.' });
    res.json({ success: true, message: 'Anúncio excluído com sucesso.' });
  });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});