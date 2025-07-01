import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kqbtymyfczqqqxnpipmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnR5bXlmY3pxcXF4bnBpcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjEzODQsImV4cCI6MjA2NjA5NzM4NH0.fr-VLhj1B94t9u9mbwn7eoWxJW0RnAxybCYpJ3TmHes';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  carregarMensagens();

  document.getElementById('form-mensagem').addEventListener('submit', async (e) => {
    e.preventDefault();

    const remetente = document.getElementById('remetente-mensagem').value.trim();
    const conteudo = document.getElementById('conteudo-mensagem').value.trim();
    const dataEnvio = document.getElementById('data-envio-mensagem').value;

    if (!remetente || !conteudo || !dataEnvio) {
      alert('Preencha todos os campos.');
      return;
    }

    const { error } = await supabase.from('mensagens').insert([
      { remetente, conteudo, data_envio: dataEnvio }
    ]);

    if (error) {
      alert('Erro ao salvar mensagem');
      console.error(error);
    } else {
      alert('Mensagem enviada com sucesso!');
      e.target.reset();
      document.getElementById('data-envio-mensagem').value = new Date().toISOString().split('T')[0];
      carregarMensagens();
    }
  });

  document.querySelector('#tabela-mensagens tbody').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.dataset.id;
      if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
        const { error } = await supabase.from('mensagens').delete().eq('id', id);
        if (error) {
          alert('Erro ao excluir mensagem');
          console.error(error);
        } else {
          carregarMensagens();
        }
      }
    }
  });
});

async function carregarMensagens() {
  const { data: mensagens, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('data_envio', { ascending: false });

  const tbody = document.querySelector('#tabela-mensagens tbody');
  tbody.innerHTML = '';

  if (error) {
    console.error('Erro ao carregar mensagens:', error);
    return;
  }

  mensagens.forEach(msg => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${msg.remetente}</td>
      <td>${msg.conteudo}</td>
      <td>${msg.data_envio}</td>
      <td class="action-buttons">
        <button class="delete-btn" data-id="${msg.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
