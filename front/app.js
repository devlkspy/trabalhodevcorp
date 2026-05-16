const sessionKey = "controle_publicidade_session_v1";
const $ = (sel, root = document) => root.querySelector(sel);

const API_URL = "https://trabalhodevcorp.onrender.com"; 

const isLoggedIn = () => {
    return !!localStorage.getItem(sessionKey);
};

const setSession = (user, usuario_id) => {
    localStorage.setItem(sessionKey, JSON.stringify({ user, usuario_id, at: Date.now() }));
};

const clearSession = () => {
    localStorage.removeItem(sessionKey);
};

const getSession = () => {
    const raw = localStorage.getItem(sessionKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
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
                setSession(user, dados.usuario_id);
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
    const inclTipoPessoa = $("#inclTipoPessoa");
    const inclPessoaMsg = $("#inclPessoaMsg");
    const btnInclPessoaCancelar = $("#btnInclPessoaCancelar");
    const btnInclPessoaSalvar = $("#btnInclPessoaSalvar");

    if (inclTipoPessoa) {
        try {
            const resTipos = await fetch(`${API_URL}/api/tipos-pessoa`);
            const tipos = await resTipos.json();
            if (Array.isArray(tipos)) {
                tipos.forEach((t) => {
                    const opt = document.createElement("option");
                    opt.value = t.pessoa_tipo_id;
                    opt.textContent = t.descricao;
                    inclTipoPessoa.appendChild(opt);
                });
            }
        } catch (err) {
            console.error("Erro ao carregar tipos de pessoa:", err);
        }
    }

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
        if (inclTipoPessoa) inclTipoPessoa.value = "";
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
            const pessoaTipoId = inclTipoPessoa ? inclTipoPessoa.value : "";
            const sessao = getSession();
            const atu_por = sessao ? sessao.usuario_id : null;
            if (!nome) {
                inclPessoaMsg.className = "msg is-danger";
                inclPessoaMsg.innerHTML = "O nome não pode ficar em branco.";
                inclPessoaMsg.style.display = "flex";
                return;
            }
            if (!cpf || cpf.replace(/\D/g, "").length !== 11) {
                inclPessoaMsg.className = "msg is-danger";
                inclPessoaMsg.innerHTML = "Digite um CPF válido com 11 dígitos.";
                inclPessoaMsg.style.display = "flex";
                return;
            }
            if (nascimento) {
                const dataNasc = new Date(nascimento);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const anoMinimo = new Date(hoje.getFullYear() - 120, hoje.getMonth(), hoje.getDate());
                if (dataNasc > hoje) {
                    inclPessoaMsg.className = "msg is-danger";
                    inclPessoaMsg.innerHTML = "A data de nascimento não pode ser futura.";
                    inclPessoaMsg.style.display = "flex";
                    return;
                }
                if (dataNasc < anoMinimo) {
                    inclPessoaMsg.className = "msg is-danger";
                    inclPessoaMsg.innerHTML = "Data de nascimento inválida (máximo 120 anos atrás).";
                    inclPessoaMsg.style.display = "flex";
                    return;
                }
            }
            try {
                const res = await fetch(`${API_URL}/api/pessoas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, cpf, nascimento: nascimento || null, telefone: telefone || null, pessoa_tipo_id: pessoaTipoId || null, atualizado_por: atu_por })
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
            if (inclNascimentoPessoa) {
                const hoje = new Date();
                const maxDate = hoje.toISOString().split("T")[0];
                const minDate = new Date(hoje.getFullYear() - 120, hoje.getMonth(), hoje.getDate()).toISOString().split("T")[0];
                inclNascimentoPessoa.max = maxDate;
                inclNascimentoPessoa.min = minDate;
            }
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

const initAnuncios = async () => {
    const tbody = $("#anunciosBody");
    if (!tbody) return;

    const formatarData = (valor) => {
        if (!valor) return "-";
        const d = new Date(valor);
        if (isNaN(d)) return valor;
        return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    };

    const formatarValor = (valor) => {
        if (valor === null || valor === undefined) return "-";
        return parseFloat(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const popularSelect = async (selectEl, url, valorCampo, textoCampo) => {
        try {
            const res = await fetch(url);
            const dados = await res.json();
            dados.forEach((item) => {
                const opt = document.createElement("option");
                opt.value = item[valorCampo];
                opt.textContent = item[textoCampo];
                selectEl.appendChild(opt);
            });
        } catch (_) {}
    };

    const carregarAnuncios = async () => {
        try {
            const resposta = await fetch(`${API_URL}/api/anuncios`);
            const texto = await resposta.text();
            let dados;
            try {
                dados = JSON.parse(texto);
            } catch (_) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted);">O servidor está reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
                return;
            }
            tbody.innerHTML = "";
            dados.forEach((a) => {
                const tr = document.createElement("tr");
                tr.dataset.id = a.anuncio_id;
                tr.innerHTML = `
                    <td><input type="checkbox" data-id="${a.anuncio_id}"></td>
                    <td>${a.anuncio_id}</td>
                    <td>${a.titulo}</td>
                    <td>${formatarValor(a.valor)}</td>
                    <td>${formatarData(a.data_inico)}</td>
                    <td>${formatarData(a.data_fim)}</td>
                    <td>${a.cliente_nome || "-"}</td>
                    <td>${a.plataforma_nome || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (_) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted);">O servidor está reiniciando. Aguarde cerca de 2 minutos e aperte F5.</td></tr>`;
        }
    };

    await carregarAnuncios();

    const inclClienteSel = $("#inclClienteAnuncio");
    const inclPlataformaSel = $("#inclPlataformaAnuncio");
    const editClienteSel = $("#editClienteAnuncio");
    const editPlataformaSel = $("#editPlataformaAnuncio");

    if (inclClienteSel) await popularSelect(inclClienteSel, `${API_URL}/api/pessoas`, "pessoa_id", "nome");
    if (inclPlataformaSel) await popularSelect(inclPlataformaSel, `${API_URL}/api/plataformas`, "plataforma_id", "descricao");
    if (editClienteSel) await popularSelect(editClienteSel, `${API_URL}/api/pessoas`, "pessoa_id", "nome");
    if (editPlataformaSel) await popularSelect(editPlataformaSel, `${API_URL}/api/plataformas`, "plataforma_id", "descricao");

    const btnIncluir = $("#btnIncluirAnuncio");
    const btnEditar = $("#btnEditarAnuncio");
    const btnExcluir = $("#btnExcluirAnuncio");
    const btnImprimir = $("#btnImprimirAnuncio");

    const modalIncluir = $("#modalIncluirAnuncio");
    const inclTitulo = $("#inclTituloAnuncio");
    const inclDescricao = $("#inclDescricaoAnuncio");
    const inclValor = $("#inclValorAnuncio");
    const inclDataInicio = $("#inclDataInicioAnuncio");
    const inclDataFim = $("#inclDataFimAnuncio");
    const inclMsg = $("#inclAnuncioMsg");
    const btnInclCancelar = $("#btnInclAnuncioCancelar");
    const btnInclSalvar = $("#btnInclAnuncioSalvar");

    const modalEditar = $("#modalEditarAnuncio");
    const editId = $("#editIdAnuncio");
    const editTitulo = $("#editTituloAnuncio");
    const editDescricao = $("#editDescricaoAnuncio");
    const editValor = $("#editValorAnuncio");
    const editDataInicio = $("#editDataInicioAnuncio");
    const editDataFim = $("#editDataFimAnuncio");
    const editMsg = $("#editAnuncioMsg");
    const btnEditCancelar = $("#btnEditAnuncioCancelar");
    const btnEditSalvar = $("#btnEditAnuncioSalvar");

    let maskInclValor = null;
    let maskEditValor = null;

    const inclValorEl = $("#inclValorAnuncio");
    const editValorEl = $("#editValorAnuncio");
    const inclTituloHint = $("#inclTituloHint");
    const inclTituloErr = $("#inclTituloErr");
    const inclDescricaoHint = $("#inclDescricaoHint");
    const inclDescricaoErr = $("#inclDescricaoErr");
    const editTituloHint = $("#editTituloHint");
    const editTituloErr = $("#editTituloErr");
    const editDescricaoHint = $("#editDescricaoHint");
    const editDescricaoErr = $("#editDescricaoErr");

    const maskOpts = {
        mask: "R$ num",
        blocks: {
            num: {
                mask: Number,
                scale: 2,
                thousandsSeparator: ".",
                padFractionalZeros: true,
                normalizeZeros: true,
                radix: ",",
                mapToRadix: ["."]
            }
        }
    };

    if (inclValorEl && typeof IMask !== "undefined") maskInclValor = IMask(inclValorEl, maskOpts);
    if (editValorEl && typeof IMask !== "undefined") maskEditValor = IMask(editValorEl, maskOpts);

    const setupCharCounter = (inputEl, hintEl, errEl, min, max, minMsg) => {
        if (!inputEl || !hintEl) return;
        const update = () => {
            const len = inputEl.value.length;
            hintEl.textContent = len + "/" + max;
            if (errEl) {
                if (len > 0 && len < min) {
                    errEl.textContent = minMsg;
                    errEl.style.display = "block";
                } else {
                    errEl.style.display = "none";
                }
            }
        };
        inputEl.addEventListener("input", update);
        update();
    };

    setupCharCounter(inclTitulo, inclTituloHint, inclTituloErr, 5, 100, "Mínimo de 5 caracteres.");
    setupCharCounter(inclDescricao, inclDescricaoHint, inclDescricaoErr, 15, 200, "Mínimo de 15 caracteres.");
    setupCharCounter(editTitulo, editTituloHint, editTituloErr, 5, 100, "Mínimo de 5 caracteres.");
    setupCharCounter(editDescricao, editDescricaoHint, editDescricaoErr, 15, 200, "Mínimo de 15 caracteres.");

    const limparModalIncluir = () => {
        if (inclTitulo) { inclTitulo.value = ""; if (inclTituloHint) inclTituloHint.textContent = "0/100"; if (inclTituloErr) inclTituloErr.style.display = "none"; }
        if (inclDescricao) { inclDescricao.value = ""; if (inclDescricaoHint) inclDescricaoHint.textContent = "0/200"; if (inclDescricaoErr) inclDescricaoErr.style.display = "none"; }
        if (maskInclValor) maskInclValor.unmaskedValue = ""; else if (inclValorEl) inclValorEl.value = "";
        if (inclDataInicio) inclDataInicio.value = "";
        if (inclDataFim) inclDataFim.value = "";
        if (inclClienteSel) inclClienteSel.value = "";
        if (inclPlataformaSel) inclPlataformaSel.value = "";
        if (inclMsg) inclMsg.style.display = "none";
    };

    const fecharModalIncluir = () => {
        if (modalIncluir) modalIncluir.classList.remove("is-open");
        limparModalIncluir();
    };

    const fecharModalEditar = () => {
        if (modalEditar) modalEditar.classList.remove("is-open");
        if (editMsg) editMsg.style.display = "none";
    };

    if (btnInclCancelar) btnInclCancelar.addEventListener("click", fecharModalIncluir);
    if (modalIncluir) modalIncluir.addEventListener("click", (e) => { if (e.target === modalIncluir) fecharModalIncluir(); });
    if (btnEditCancelar) btnEditCancelar.addEventListener("click", fecharModalEditar);
    if (modalEditar) modalEditar.addEventListener("click", (e) => { if (e.target === modalEditar) fecharModalEditar(); });

    const validarCampos = (titulo, descricao, valorNum, dataInicio, dataFim, msgEl) => {
        if (!titulo || titulo.length < 5) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "O título deve ter no mínimo 5 caracteres.";
            msgEl.style.display = "flex";
            return false;
        }
        if (titulo.length > 100) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "O título deve ter no máximo 100 caracteres.";
            msgEl.style.display = "flex";
            return false;
        }
        if (!descricao || descricao.length < 15) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "A descrição deve ter no mínimo 15 caracteres.";
            msgEl.style.display = "flex";
            return false;
        }
        if (descricao.length > 200) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "A descrição deve ter no máximo 200 caracteres.";
            msgEl.style.display = "flex";
            return false;
        }
        if (isNaN(valorNum) || valorNum <= 0) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "Informe um valor válido maior que zero.";
            msgEl.style.display = "flex";
            return false;
        }
        if (!dataInicio) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "Informe a data de início.";
            msgEl.style.display = "flex";
            return false;
        }
        if (!dataFim) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "Informe a data de fim.";
            msgEl.style.display = "flex";
            return false;
        }
        if (new Date(dataFim) < new Date(dataInicio)) {
            msgEl.className = "msg is-danger";
            msgEl.innerHTML = "A data de fim não pode ser anterior à data de início.";
            msgEl.style.display = "flex";
            return false;
        }
        return true;
    };

    if (btnInclSalvar) {
        btnInclSalvar.addEventListener("click", async () => {
            const titulo = inclTitulo ? inclTitulo.value.trim() : "";
            const descricao = inclDescricao ? inclDescricao.value.trim() : "";
            const valorNum = maskInclValor ? parseFloat(maskInclValor.unmaskedValue) / 100 : NaN;
            const dataInicio = inclDataInicio ? inclDataInicio.value : "";
            const dataFim = inclDataFim ? inclDataFim.value : "";
            const clienteId = inclClienteSel ? inclClienteSel.value : "";
            const plataformaId = inclPlataformaSel ? inclPlataformaSel.value : "";
            if (!validarCampos(titulo, descricao, valorNum, dataInicio, dataFim, inclMsg)) return;
            const sessao = getSession();
            try {
                const res = await fetch(`${API_URL}/api/anuncios`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        titulo,
                        descricao,
                        valor: valorNum,
                        data_inico: dataInicio,
                        data_fim: dataFim,
                        cliente_id: clienteId || null,
                        plataforma_id: plataformaId || null,
                        atualizado_por: sessao ? sessao.usuario_id : null
                    })
                });
                let dados;
                try { dados = await res.json(); } catch (_) {
                    inclMsg.className = "msg is-danger";
                    inclMsg.innerHTML = "O servidor não respondeu corretamente.";
                    inclMsg.style.display = "flex";
                    return;
                }
                if (dados.success) {
                    fecharModalIncluir();
                    await carregarAnuncios();
                } else {
                    inclMsg.className = "msg is-danger";
                    inclMsg.innerHTML = dados.message || "Erro ao cadastrar.";
                    inclMsg.style.display = "flex";
                }
            } catch (_) {
                inclMsg.className = "msg is-danger";
                inclMsg.innerHTML = "Servidor offline ou sem conexão.";
                inclMsg.style.display = "flex";
            }
        });
    }

    if (btnEditSalvar) {
        btnEditSalvar.addEventListener("click", async () => {
            const id = editId ? editId.value : "";
            const titulo = editTitulo ? editTitulo.value.trim() : "";
            const descricao = editDescricao ? editDescricao.value.trim() : "";
            const valorNum = maskEditValor ? parseFloat(maskEditValor.unmaskedValue) / 100 : NaN;
            const dataInicio = editDataInicio ? editDataInicio.value : "";
            const dataFim = editDataFim ? editDataFim.value : "";
            const clienteId = editClienteSel ? editClienteSel.value : "";
            const plataformaId = editPlataformaSel ? editPlataformaSel.value : "";
            if (!validarCampos(titulo, descricao, valorNum, dataInicio, dataFim, editMsg)) return;
            const sessao = getSession();
            try {
                const res = await fetch(`${API_URL}/api/anuncios/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        titulo,
                        descricao,
                        valor: valorNum,
                        data_inico: dataInicio,
                        data_fim: dataFim,
                        cliente_id: clienteId || null,
                        plataforma_id: plataformaId || null,
                        atualizado_por: sessao ? sessao.usuario_id : null
                    })
                });
                let dados;
                try { dados = await res.json(); } catch (_) {
                    editMsg.className = "msg is-danger";
                    editMsg.innerHTML = "O servidor não respondeu corretamente.";
                    editMsg.style.display = "flex";
                    return;
                }
                if (dados.success) {
                    fecharModalEditar();
                    await carregarAnuncios();
                } else {
                    editMsg.className = "msg is-danger";
                    editMsg.innerHTML = dados.message || "Erro ao salvar.";
                    editMsg.style.display = "flex";
                }
            } catch (_) {
                editMsg.className = "msg is-danger";
                editMsg.innerHTML = "Servidor offline ou sem conexão.";
                editMsg.style.display = "flex";
            }
        });
    }

    if (btnIncluir) {
        btnIncluir.addEventListener("click", () => {
            limparModalIncluir();
            if (modalIncluir) modalIncluir.classList.add("is-open");
        });
    }

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            const selecionados = document.querySelectorAll('#anunciosBody input[type="checkbox"]:checked');
            if (selecionados.length === 0) {
                alert("Por favor, selecione um anúncio na lista.");
                return;
            }
            if (selecionados.length > 1) {
                alert("Selecione apenas um anúncio para editar.");
                return;
            }
            const cb = selecionados[0];
            const tr = cb.closest("tr");
            const cells = tr.querySelectorAll("td");
            if (editId) editId.value = cells[1].textContent.trim();
            if (editTitulo) editTitulo.value = cells[2].textContent.trim();
            if (editMsg) editMsg.style.display = "none";
            fetch(`${API_URL}/api/anuncios/${cells[1].textContent.trim()}`)
                .then(r => r.json())
                .then(anuncio => {
                    if (editDescricao) {
                        editDescricao.value = anuncio.descricao || "";
                        editDescricao.dispatchEvent(new Event("input"));
                    }
                    if (maskEditValor && anuncio.valor != null) {
                        const cents = Math.round(parseFloat(anuncio.valor) * 100).toString();
                        maskEditValor.unmaskedValue = cents;
                    }
                    if (editDataInicio) editDataInicio.value = anuncio.data_inico ? anuncio.data_inico.split("T")[0] : "";
                    if (editDataFim) editDataFim.value = anuncio.data_fim ? anuncio.data_fim.split("T")[0] : "";
                    if (editClienteSel) editClienteSel.value = anuncio.cliente_id || "";
                    if (editPlataformaSel) editPlataformaSel.value = anuncio.plataforma_id || "";
                    if (editTitulo) editTitulo.dispatchEvent(new Event("input"));
                    if (modalEditar) modalEditar.classList.add("is-open");
                })
                .catch(() => {
                    alert("Erro ao carregar dados do anúncio.");
                });
        });
    }

    if (btnImprimir) {
        btnImprimir.addEventListener("click", () => {
            window.print();
        });
    }

    if (btnExcluir) {
        btnExcluir.addEventListener("click", async () => {
            const selecionados = document.querySelectorAll('#anunciosBody input[type="checkbox"]:checked');
            if (selecionados.length === 0) {
                alert("Por favor, selecione um anúncio na lista.");
                return;
            }
            const ids = Array.from(selecionados).map(cb => cb.dataset.id).join(", ");
            const confirmado = confirm(`Excluir os anúncios com ID: ${ids}?`);
            if (!confirmado) return;
            const erros = [];
            for (const cb of selecionados) {
                try {
                    const res = await fetch(`${API_URL}/api/anuncios/${cb.dataset.id}`, { method: "DELETE" });
                    const dados = await res.json();
                    if (!dados.success) erros.push(cb.dataset.id);
                } catch (_) {
                    erros.push(cb.dataset.id);
                }
            }
            if (erros.length > 0) {
                alert(`Falha ao excluir IDs: ${erros.join(", ")}`);
            } else {
                alert("Anúncio(s) excluído(s) com sucesso.");
            }
            await carregarAnuncios();
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
    if (page === "anuncios") initAnuncios();
    initLogout();
});