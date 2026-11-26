
import { supabase } from './supabase.js';

const areaConteudos = document.querySelector('#conteudos');
const areaDestaques = document.querySelector('#destaques');
const areaGaleria = document.querySelector('#galeria');

function escapar(texto = '') {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[caractere]);
}

function cardConteudo(item) {
    return `
        <article class="card reveal">
            ${item.imagem ? `<img src="${escapar(item.imagem)}" alt="${escapar(item.titulo)}">` : ''}
            <div class="card-content">
                <small>${escapar(item.categoria)}</small>
                <h3>${escapar(item.titulo)}</h3>
                <p>${escapar(item.resumo || '')}</p>
            </div>
        </article>
    `;
}

async function carregarConteudos() {
    if (!areaConteudos) return;

    const categoria = areaConteudos.dataset.categoria;

    let consulta = supabase
        .from('conteudos')
        .select('*')
        .eq('publicado', true)
        .order('criado_em', { ascending: false });

    if (categoria) {
        consulta = consulta.eq('categoria', categoria);
    }

    const { data, error } = await consulta;

    if (error) {
        areaConteudos.innerHTML = '<p>Não foi possível carregar os conteúdos.</p>';
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        areaConteudos.innerHTML = '<p>Novidades serão publicadas em breve.</p>';
        return;
    }

    areaConteudos.innerHTML = data.map(cardConteudo).join('');
}

async function carregarDestaques() {
    if (!areaDestaques) return;

    const { data, error } = await supabase
        .from('destaques')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    areaDestaques.innerHTML = (data || []).map(item => `
        <article class="card reveal">
            ${item.imagem ? `<img src="${escapar(item.imagem)}" alt="${escapar(item.titulo)}">` : ''}
            <div class="card-content">
                <h3>${escapar(item.titulo)}</h3>
                <p>${escapar(item.descricao || '')}</p>
                ${item.link ? `<a class="card-link" href="${escapar(item.link)}">Saiba mais →</a>` : ''}
            </div>
        </article>
    `).join('') || '<p>Em breve teremos destaques por aqui.</p>';
}

async function carregarGaleria() {
    if (!areaGaleria) return;

    const { data, error } = await supabase
        .from('galeria')
        .select('*')
        .eq('publicado', true)
        .order('criado_em', { ascending: false });

    if (error) {
        console.error(error);
        areaGaleria.innerHTML = '<p>Não foi possível carregar as fotografias.</p>';
        return;
    }

    areaGaleria.innerHTML = (data || []).map(item => `
        <figure class="reveal">
            <img src="${escapar(item.imagem)}" alt="${escapar(item.titulo)}" loading="lazy">
            <figcaption>${escapar(item.titulo)}</figcaption>
        </figure>
    `).join('') || '<p>A galeria será atualizada em breve.</p>';
}

carregarConteudos();
carregarDestaques();
carregarGaleria();

