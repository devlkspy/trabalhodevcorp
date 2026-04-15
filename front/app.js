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
        window.location.href = "dashboard";
        return false;
    }
    if (page !== "login" && page !== "cadastro" && !isLoggedIn()) {
        window.location.href = "login";
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
                window.location.href = "dashboard";
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
        const msg = $("#registerMsg");

        try {
            const resposta = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, login: user, senha: pass })
            });

            const dados = await resposta.json();

            if (dados.success) {
                alert("Usuário criado com sucesso!");
                window.location.href = "login";
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

const initLogout = () => {
    const btn = $("#btnLogout");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            clearSession();
            window.location.href = "login";
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page || "";
    if (!guard(page)) return;
    if (page === "login") initLogin();
    if (page === "cadastro") initCadastro();
    initLogout();
});