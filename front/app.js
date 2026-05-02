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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user)) {
            msg.className = "msg is-danger";
            msg.innerHTML = "Digite um e-mail válido no campo de login.";
            msg.style.display = "flex";
            return;
        }

        if (pass.length < 6) {
            msg.className = "msg is-danger";
            msg.innerHTML = "A senha deve ter no mínimo 6 caracteres.";
            msg.style.display = "flex";
            return;
        }

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
                msg.innerHTML = dados.message || "Erro ao cadastrar.";
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

    const carregarUsuarios = async () => {
        try {
            const resposta = await fetch(`${API_URL}/api/usuarios`);
            const texto = await resposta.text();
            let dados;
            try {
                dados = JSON.parse(texto);
            } catch (_) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);">O servidor est\u00e1 reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
                return;
            }
            tbody.innerHTML = "";
            dados.forEach((user, index) => {
                const tr = document.createElement("tr");
                tr.dataset.login = user.login;
                tr.innerHTML = `
                    <td><input type="checkbox" data-login="${user.login}"></td>
                    <td>${index + 1}</td>
                    <td>${user.nome}</td>
                    <td>${user.login}</td>
                    <td>Usu\u00e1rio</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (erro) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);">O servidor est\u00e1 reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
        }
    };

    await carregarUsuarios();

    const btnIncluir = $("#btnIncluir");
    const btnEditar = $("#btnEditar");
    const btnExcluir = $("#btnExcluir");
    const btnImprimir = $("#btnImprimir");
    const modal = $("#modalEditar");
    const editNome = $("#editNome");
    const editLogin = $("#editLogin");
    const editSenha = $("#editSenha");
    const editMsg = $("#editMsg");
    const btnModalCancelar = $("#btnModalCancelar");
    const btnModalSalvar = $("#btnModalSalvar");

    const fecharModal = () => {
        if (modal) modal.classList.remove("is-open");
        if (editSenha) editSenha.value = "";
        if (editMsg) editMsg.style.display = "none";
    };

    if (btnModalCancelar) {
        btnModalCancelar.addEventListener("click", fecharModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) fecharModal();
        });
    }

    if (btnModalSalvar) {
        btnModalSalvar.addEventListener("click", async () => {
            const nome = editNome.value.trim();
            const login = editLogin.value.trim();
            const senha = editSenha.value.trim();
            if (!nome) {
                editMsg.className = "msg is-danger";
                editMsg.innerHTML = "O nome n\u00e3o pode ficar em branco.";
                editMsg.style.display = "flex";
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(login)}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, senha })
                });
                const dados = await res.json();
                if (dados.success) {
                    fecharModal();
                    await carregarUsuarios();
                } else {
                    editMsg.className = "msg is-danger";
                    editMsg.innerHTML = dados.message || "Erro ao salvar.";
                    editMsg.style.display = "flex";
                }
            } catch (_) {
                editMsg.className = "msg is-danger";
                editMsg.innerHTML = "Servidor offline.";
                editMsg.style.display = "flex";
            }
        });
    }

    if (btnIncluir) {
        btnIncluir.addEventListener("click", () => {
            window.location.href = "cadastro.html";
        });
    }

    if (btnImprimir) {
        btnImprimir.addEventListener("click", () => {
            window.print();
        });
    }

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            const selecionados = document.querySelectorAll('#usuariosBody input[type="checkbox"]:checked');
            if (selecionados.length === 0) {
                alert("Por favor, selecione um usu\u00e1rio na lista.");
                return;
            }
            if (selecionados.length > 1) {
                alert("Selecione apenas um usu\u00e1rio para editar.");
                return;
            }
            const cb = selecionados[0];
            const tr = cb.closest("tr");
            const cells = tr.querySelectorAll("td");
            editNome.value = cells[2].textContent.trim();
            editLogin.value = cells[3].textContent.trim();
            editSenha.value = "";
            editMsg.style.display = "none";
            modal.classList.add("is-open");
        });
    }

    if (btnExcluir) {
        btnExcluir.addEventListener("click", async () => {
            const selecionados = document.querySelectorAll('#usuariosBody input[type="checkbox"]:checked');
            if (selecionados.length === 0) {
                alert("Por favor, selecione um usu\u00e1rio na lista.");
                return;
            }
            const nomes = Array.from(selecionados).map(cb => cb.dataset.login).join(", ");
            const confirmado = confirm(`Excluir os usu\u00e1rios: ${nomes}?`);
            if (!confirmado) return;
            const erros = [];
            for (const cb of selecionados) {
                try {
                    const res = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(cb.dataset.login)}`, {
                        method: "DELETE"
                    });
                    const dados = await res.json();
                    if (!dados.success) erros.push(cb.dataset.login);
                } catch (_) {
                    erros.push(cb.dataset.login);
                }
            }
            if (erros.length > 0) {
                alert(`Falha ao excluir: ${erros.join(", ")}`);
            } else {
                alert("Usu\u00e1rio(s) exclu\u00eddo(s) com sucesso.");
            }
            await carregarUsuarios();
        });
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