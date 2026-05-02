const sessionKey = "controle_publicidade_session_v1";
const $ = (sel, root = document) => root.querySelector(sel);

const API_URL = "https://trabalhodevcorp.onrender.com"; 

const isLoggedIn = () => {
    return !!localStorage.getItem(sessionKey);
};

const setSession = (user) => {
    localStorage.setItem(sessionKey, JSON.stringify({ user, at: Date.now() }));
};

const clearSession = () => {
    localStorage.removeItem(sessionKey);
};

const guard = (page) => {
    if ((page === "login" || page === "cadastro") && isLoggedIn()) {
        window.location.href = "dashboard.html";
        return false;
    }
    if (page !== "login" && page !== "cadastro" && !isLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }
    return true;
};

const initLogin = () => {
    const form = $("#loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = form.user.value.trim();
        const pass = form.pass.value.trim();
        const msg = $("#loginMsg");

        try {
            const resposta = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: user, senha: pass })
            });

            const dados = await resposta.json();

            if (dados.success) {
                setSession(user);
                window.location.href = "dashboard.html";
            } else {
                msg.className = "msg is-danger";
                msg.innerHTML = dados.message;
                msg.style.display = "flex";
            }
        } catch (erro) {
            msg.className = "msg is-danger";
            msg.innerHTML = "Erro: Servidor fora do ar.";
            msg.style.display = "flex";
        }
    });
};

const initCadastro = () => {
    const form = $("#registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = form.nome.value.trim();
        const user = form.user.value.trim();
        const pass = form.pass.value.trim();
        const confirmPass = form.confirmPass.value.trim();
        const msg = $("#registerMsg");

        if (pass !== confirmPass) {
            msg.className = "msg is-danger";
            msg.innerHTML = "As senhas não coincidem.";
            msg.style.display = "flex";
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, login: user, senha: pass })
            });

            const dados = await resposta.json();

            if (dados.success) {
                alert("Usuário criado com sucesso!");
                window.location.href = "login.html";
            } else {
                msg.className = "msg is-danger";
                msg.innerHTML = "Erro ao cadastrar.";
                msg.style.display = "flex";
            }
        } catch (erro) {
            msg.className = "msg is-danger";
            msg.innerHTML = "Servidor offline.";
            msg.style.display = "flex";
        }
    });
};

const initCadastros = async () => {
    const tbody = $("#usuariosBody");
    if (!tbody) return;
    try {
        const resposta = await fetch(`${API_URL}/api/usuarios`);
        const texto = await resposta.text();
        let dados;
        try {
            dados = JSON.parse(texto);
        } catch (_) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);">O servidor está reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
            return;
        }
        tbody.innerHTML = "";
        dados.forEach((user, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${index + 1}</td>
                <td>${user.nome}</td>
                <td>${user.login}</td>
                <td>Usuário</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);">O servidor está reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
    }
};

const initLogout = () => {
    const btn = $("#btnLogout");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            clearSession();
            window.location.href = "login.html";
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page || "";
    if (!guard(page)) return;
    if (page === "login") initLogin();
    if (page === "cadastro") initCadastro();
    if (page === "cadastros") initCadastros();
    initLogout();
});