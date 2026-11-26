
import { supabase } from './supabase.js';

const form = document.querySelector('#formConteudo');
const status = document.querySelector('#statusConteudo');
const lista = document.querySelector('#listaConteudos');
const mensagens = document.querySelector('#listaMensagens');

function escapar(texto = '') {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caractere]);
}

async function verificarAdministrador() {
    const { data: sessao } = await supabase.auth.getSession();

    if (!sessao.session) {
        window.location.href = 'login.html';
        return false;
    }

    const { data, error } = await supabase
        .from('administradores')
        .select('id')
        .eq('id', sessao.session.user.id)
        .maybeSingle();

    if (error || !data) {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

document.querySelector('#sair').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    status.textContent = 'Salvando conteúdo...';

    const titulo = document.querySelector('#titulo').value.trim();
    const slug = document.querySelector('#slug').value.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '');

    const categoria = document.querySelector('#categoria').value;
    const resumo = document.querySelector('#resumo').value.trim();
    const descricao = document.querySelector('#descricao').value.trim();
    const arquivo = document.querySelector('#imagem').files[0];
    const publicado = document.querySelector('#publicado').checked;

    let urlImagem = null;

    if (arquivo) {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

        if (!tiposPermitidos.includes(arquivo.type)) {
            status.textContent = 'Escolha uma imagem JPG, PNG ou WebP.';
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            status.textContent = 'A imagem deve ter no máximo 5 MB.';
            return;
        }

        const nomeArquivo = `${crypto.randomUUID()}-${arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

        const { error: erroUpload } = await supabase.storage
            .from('imagens-cidade')
            .upload(nomeArquivo, arquivo, {
                contentType: arquivo.type,
                upsert: false
            });

        if (erroUpload) {
            console.error(erroUpload);
            status.textContent = 'Erro ao enviar imagem.';
            return;
        }

        const { data: imagemPublica } = supabase.storage
            .from('imagens-cidade')
            .getPublicUrl(nomeArquivo);

        urlImagem = imagemPublica.publicUrl;
    }

    const { error } = await supabase
        .from('conteudos')
        .insert({
            titulo,
            slug,
            categoria,
            resumo,
            descricao,
            imagem: urlImagem,
            publicado
        });

    if (error) {
        console.error(error);
        status.textContent = 'Erro ao salvar. Confira se o slug já existe.';
        return;
    }

    form.reset();
    status.textContent = 'Conteúdo cadastrado com sucesso!';
    await carregarConteudos();
});

async function carregarConteudos() {
    const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .order('criado_em', { ascending: false });

    if (error) {
        lista.textContent = 'Não foi possível carregar os conteúdos.';
        return;
    }

    if (!data.length) {
        lista.textContent = 'Nenhum conteúdo cadastrado.';
        return;
    }

    lista.innerHTML = data.map(item => `
        <div class="admin-row">
            <div>
                <strong>${escapar(item.titulo)}</strong>
                <p>${escapar(item.categoria)} • ${item.publicado ? 'Publicado' : 'Rascunho'}</p>
            </div>
            <button class="btn-danger" data-excluir="${item.id}">Excluir</button>
        </div>
    `).join('');

    lista.querySelectorAll('[data-excluir]').forEach(botao => {
        botao.addEventListener('click', () => excluirConteudo(botao.dataset.excluir));
    });
}

async function excluirConteudo(id) {
    if (!confirm('Deseja realmente excluir este conteúdo?')) return;

    const { error } = await supabase
        .from('conteudos')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Não foi possível excluir o conteúdo.');
        return;
    }

    await carregarConteudos();
}

async function carregarMensagens() {
    const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .order('criado_em', { ascending: false });

    if (error) {
        mensagens.textContent = 'Não foi possível carregar as mensagens.';
        return;
    }

    if (!data.length) {
        mensagens.textContent = 'Nenhuma mensagem recebida.';
        return;
    }

    mensagens.innerHTML = data.map(item => `
        <article class="content-item">
            <h3>${escapar(item.nome)}</h3>
            <p><strong>E-mail:</strong> ${escapar(item.email)}</p>
            <p><strong>Assunto:</strong> ${escapar(item.assunto || 'Não informado')}</p>
            <p>${escapar(item.mensagem)}</p>
            <p><small>${item.lida ? 'Lida' : 'Não lida'}</small></p>
            <button class="btn-secondary btn" data-lida="${item.id}">
                Marcar como lida
            </button>
        </article>
    `).join('');

    mensagens.querySelectorAll('[data-lida]').forEach(botao => {
        botao.addEventListener('click', async () => {
            const { error } = await supabase
                .from('mensagens')
                .update({ lida: true })
                .eq('id', botao.dataset.lida);

            if (error) {
                alert('Não foi possível atualizar a mensagem.');
                return;
            }

            await carregarMensagens();
        });
    });
}

if (await verificarAdministrador()) {
    await carregarConteudos();
    await carregarMensagens();
}

