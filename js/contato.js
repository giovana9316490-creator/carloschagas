
import { supabase } from './supabase.js';

const formulario = document.querySelector('#formContato');
const status = document.querySelector('#statusContato');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const dados = new FormData(formulario);

    const mensagem = {
        nome: dados.get('nome').trim(),
        email: dados.get('email').trim(),
        assunto: dados.get('assunto').trim(),
        mensagem: dados.get('mensagem').trim()
    };

    status.textContent = 'Enviando mensagem...';

    const { error } = await supabase
        .from('mensagens')
        .insert(mensagem);

    if (error) {
        console.error(error);
        status.textContent = 'Não foi possível enviar. Tente novamente.';
        return;
    }

    formulario.reset();
    status.textContent = 'Mensagem enviada com sucesso!';
});

