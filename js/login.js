
import { supabase } from './supabase.js';

const formulario = document.querySelector('#formLogin');
const status = document.querySelector('#statusLogin');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const email = document.querySelector('#email').value.trim();
    const senha = document.querySelector('#senha').value;

    status.textContent = 'Verificando acesso...';

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
    });

    if (error) {
        status.textContent = 'E-mail ou senha incorretos.';
        return;
    }

    const { data: administrador, error: erroAdmin } = await supabase
        .from('administradores')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

    if (erroAdmin || !administrador) {
        await supabase.auth.signOut();
        status.textContent = 'Este usuário não tem autorização administrativa.';
        return;
    }

    window.location.href = 'dashboard.html';
});

