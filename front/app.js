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

    const modalIncluir = $("#modalIncluir");
    const inclNome = $("#inclNome");
    const inclLogin = $("#inclLogin");
    const inclSenha = $("#inclSenha");
    const inclMsg = $("#inclMsg");
    const btnInclCancelar = $("#btnInclCancelar");
    const btnInclSalvar = $("#btnInclSalvar");

    const modal = $("#modalEditar");
    const editNome = $("#editNome");
    const editLogin = $("#editLogin");
    const editSenha = $("#editSenha");
    const editMsg = $("#editMsg");
    const btnModalCancelar = $("#btnModalCancelar");
    const btnModalSalvar = $("#btnModalSalvar");

    const fecharModalIncluir = () => {
        if (modalIncluir) modalIncluir.classList.remove("is-open");
        if (inclNome) inclNome.value = "";
        if (inclLogin) inclLogin.value = "";
        if (inclSenha) inclSenha.value = "";
        if (inclMsg) inclMsg.style.display = "none";
    };

    const fecharModal = () => {
        if (modal) modal.classList.remove("is-open");
        if (editSenha) editSenha.value = "";
        if (editMsg) editMsg.style.display = "none";
    };

    if (btnInclCancelar) {
        btnInclCancelar.addEventListener("click", fecharModalIncluir);
    }

    if (modalIncluir) {
        modalIncluir.addEventListener("click", (e) => {
            if (e.target === modalIncluir) fecharModalIncluir();
        });
    }

    if (btnInclSalvar) {
        btnInclSalvar.addEventListener("click", async () => {
            const nome = inclNome.value.trim();
            const login = inclLogin.value.trim();
            const senha = inclSenha.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!nome) {
                inclMsg.className = "msg is-danger";
                inclMsg.innerHTML = "O nome n\u00e3o pode ficar em branco.";
                inclMsg.style.display = "flex";
                return;
            }
            if (!emailRegex.test(login)) {
                inclMsg.className = "msg is-danger";
                inclMsg.innerHTML = "Digite um e-mail v\u00e1lido.";
                inclMsg.style.display = "flex";
                return;
            }
            if (senha.length < 6) {
                inclMsg.className = "msg is-danger";
                inclMsg.innerHTML = "A senha deve ter no m\u00ednimo 6 caracteres.";
                inclMsg.style.display = "flex";
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, login, senha })
                });
                const dados = await res.json();
                if (dados.success) {
                    fecharModalIncluir();
                    await carregarUsuarios();
                } else {
                    inclMsg.className = "msg is-danger";
                    inclMsg.innerHTML = dados.message || "Erro ao criar usu\u00e1rio.";
                    inclMsg.style.display = "flex";
                }
            } catch (_) {
                inclMsg.className = "msg is-danger";
                inclMsg.innerHTML = "Servidor offline.";
                inclMsg.style.display = "flex";
            }
        });
    }


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
            fecharModalIncluir();
            if (modalIncluir) modalIncluir.classList.add("is-open");
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

const initClientes = async () => {
    const tbody = $("#clientesBody");
    if (!tbody) return;

    const formatarData = (valor) => {
        if (!valor) return "-";
        const d = new Date(valor);
        if (isNaN(d)) return valor;
        return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    };

    const carregarClientes = async () => {
        try {
            const resposta = await fetch(`${API_URL}/api/pessoas`);
            const texto = await resposta.text();
            let dados;
            try {
                dados = JSON.parse(texto);
            } catch (_) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted);">O servidor est\u00e1 reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
                return;
            }
            tbody.innerHTML = "";
            dados.forEach((p) => {
                const tr = document.createElement("tr");
                tr.dataset.id = p.pessoa_id;
                tr.innerHTML = `
                    <td><input type="checkbox" data-id="${p.pessoa_id}"></td>
                    <td>${p.pessoa_id}</td>
                    <td>${p.nome}</td>
                    <td>${p.cpf}</td>
                    <td>${formatarData(p.nascimento)}</td>
                    <td>${p.telefone || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (erro) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted);">O servidor est\u00e1 reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
        }
    };

    await carregarClientes();

    const btnIncluirCliente = $("#btnIncluirCliente");
    const btnExcluirCliente = $("#btnExcluirCliente");
    const btnImprimirCliente = $("#btnImprimirCliente");

    const modalIncluirCliente = $("#modalIncluirCliente");
    const inclNomePessoa = $("#inclNomePessoa");
    const inclCpfPessoa = $("#inclCpfPessoa");
    const inclNascimentoPessoa = $("#inclNascimentoPessoa");
    const inclTelefonePessoa = $("#inclTelefonePessoa");
    const inclPessoaMsg = $("#inclPessoaMsg");
    const btnInclPessoaCancelar = $("#btnInclPessoaCancelar");
    const btnInclPessoaSalvar = $("#btnInclPessoaSalvar");

    let maskCpf = null;
    let maskTelefone = null;

    if (inclCpfPessoa && typeof IMask !== "undefined") {
        maskCpf = IMask(inclCpfPessoa, { mask: "000.000.000-00" });
    }

    if (inclTelefonePessoa && typeof IMask !== "undefined") {
        maskTelefone = IMask(inclTelefonePessoa, {
            mask: [
                { mask: "(00) 0000-0000" },
                { mask: "(00) 00000-0000" }
            ],
            dispatch: (appended, dynamicMasked) => {
                const number = (dynamicMasked.value + appended).replace(/\D/g, "");
                return number.length <= 10
                    ? dynamicMasked.compiledMasks[0]
                    : dynamicMasked.compiledMasks[1];
            }
        });
    }

    const fecharModalCliente = () => {
        if (modalIncluirCliente) modalIncluirCliente.classList.remove("is-open");
        if (inclNomePessoa) inclNomePessoa.value = "";
        if (maskCpf) maskCpf.unmaskedValue = "";
        else if (inclCpfPessoa) inclCpfPessoa.value = "";
        if (inclNascimentoPessoa) inclNascimentoPessoa.value = "";
        if (maskTelefone) maskTelefone.unmaskedValue = "";
        else if (inclTelefonePessoa) inclTelefonePessoa.value = "";
        if (inclPessoaMsg) inclPessoaMsg.style.display = "none";
    };

    if (btnInclPessoaCancelar) {
        btnInclPessoaCancelar.addEventListener("click", fecharModalCliente);
    }

    if (modalIncluirCliente) {
        modalIncluirCliente.addEventListener("click", (e) => {
            if (e.target === modalIncluirCliente) fecharModalCliente();
        });
    }

    if (btnInclPessoaSalvar) {
        btnInclPessoaSalvar.addEventListener("click", async () => {
            const nome = inclNomePessoa ? inclNomePessoa.value.trim() : "";
            const cpf = inclCpfPessoa ? inclCpfPessoa.value.trim() : "";
            const nascimento = inclNascimentoPessoa ? inclNascimentoPessoa.value : "";
            const telefone = inclTelefonePessoa ? inclTelefonePessoa.value.trim() : "";
            if (!nome) {
                inclPessoaMsg.className = "msg is-danger";
                inclPessoaMsg.innerHTML = "O nome n\u00e3o pode ficar em branco.";
                inclPessoaMsg.style.display = "flex";
                return;
            }
            if (!cpf) {
                inclPessoaMsg.className = "msg is-danger";
                inclPessoaMsg.innerHTML = "O CPF n\u00e3o pode ficar em branco.";
                inclPessoaMsg.style.display = "flex";
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/pessoas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, cpf, nascimento: nascimento || null, telefone: telefone || null })
                });
                let dados;
                try {
                    dados = await res.json();
                } catch (_) {
                    inclPessoaMsg.className = "msg is-danger";
                    inclPessoaMsg.innerHTML = "O servidor n\u00e3o respondeu corretamente. Verifique se o deploy foi atualizado.";
                    inclPessoaMsg.style.display = "flex";
                    return;
                }
                if (dados.success) {
                    fecharModalCliente();
                    await carregarClientes();
                } else {
                    inclPessoaMsg.className = "msg is-danger";
                    inclPessoaMsg.innerHTML = dados.message || "Erro ao cadastrar.";
                    inclPessoaMsg.style.display = "flex";
                }
            } catch (_) {
                inclPessoaMsg.className = "msg is-danger";
                inclPessoaMsg.innerHTML = "Servidor offline ou sem conex\u00e3o.";
                inclPessoaMsg.style.display = "flex";
            }
        });
    }

    if (btnIncluirCliente) {
        btnIncluirCliente.addEventListener("click", () => {
            fecharModalCliente();
            if (modalIncluirCliente) modalIncluirCliente.classList.add("is-open");
        });
    }

    if (btnImprimirCliente) {
        btnImprimirCliente.addEventListener("click", () => {
            window.print();
        });
    }

    if (btnExcluirCliente) {
        btnExcluirCliente.addEventListener("click", async () => {
            const selecionados = document.querySelectorAll('#clientesBody input[type="checkbox"]:checked');
            if (selecionados.length === 0) {
                alert("Por favor, selecione um cliente na lista.");
                return;
            }
            const ids = Array.from(selecionados).map(cb => cb.dataset.id).join(", ");
            const confirmado = confirm(`Excluir os clientes com ID: ${ids}?`);
            if (!confirmado) return;
            const erros = [];
            for (const cb of selecionados) {
                try {
                    const res = await fetch(`${API_URL}/api/pessoas/${cb.dataset.id}`, {
                        method: "DELETE"
                    });
                    const dados = await res.json();
                    if (!dados.success) erros.push(cb.dataset.id);
                } catch (_) {
                    erros.push(cb.dataset.id);
                }
            }
            if (erros.length > 0) {
                alert(`Falha ao excluir IDs: ${erros.join(", ")}`);
            } else {
                alert("Cliente(s) exclu\u00eddo(s) com sucesso.");
            }
            await carregarClientes();
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
    if (page === "clientes") initClientes();
    initLogout();
});