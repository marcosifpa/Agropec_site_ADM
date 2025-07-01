import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kqbtymyfczqqqxnpipmh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnR5bXlmY3pxcXF4bnBpcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjEzODQsImV4cCI6MjA2NjA5NzM4NH0.fr-VLhj1B94t9u9mbwn7eoWxJW0RnAxybCYpJ3TmHes';
const supabase = createClient(supabaseUrl, supabaseKey);

let patrocinadores = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarPatrocinadores();

  const form = document.getElementById('form-patrocinador');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome-patrocinador').value.trim();
    const logo = document.getElementById('logo-patrocinador').value.trim();
    const nivel = document.getElementById('nivel-patrocinador').value.trim();
    const link = document.getElementById('link-patrocinador').value.trim();
    const idOculto = form.dataset.id;

    if (!nome || !nivel) {
      alert('Preencha pelo menos o nome e nível do patrocinador.');
      return;
    }

    let error;

    if (idOculto) {
      // Atualizar
      ({ error } = await supabase
        .from('patrocinadores')
        .update({ nome, logo_url: logo, nivel, link })
        .eq('id', idOculto));
    } else {
      // Inserir novo
      ({ error } = await supabase
        .from('patrocinadores')
        .insert([{ nome, logo_url: logo, nivel, link }]));
    }

    if (error) {
      alert('Erro ao salvar patrocinador');
      console.error(error);
    } else {
      alert('Patrocinador salvo com sucesso!');
      form.reset();
      delete form.dataset.id;
      carregarPatrocinadores();
    }
  });

  document.querySelector('#tabela-patrocinadores tbody').addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    const id = row.dataset.id;

    if (e.target.classList.contains('edit-btn')) {
      const pat = patrocinadores.find(p => p.id == id);
      if (!pat) return;

      document.getElementById('nome-patrocinador').value = pat.nome || '';
      document.getElementById('logo-patrocinador').value = pat.logo_url || '';
      document.getElementById('nivel-patrocinador').value = pat.nivel || '';
      document.getElementById('link-patrocinador').value = pat.link || '';
      document.getElementById('form-patrocinador').dataset.id = pat.id;
    }

    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Deseja excluir este patrocinador?')) {
        const { error } = await supabase.from('patrocinadores').delete().eq('id', id);
        if (error) {
          alert('Erro ao excluir patrocinador');
          console.error(error);
        } else {
          alert('Excluído com sucesso!');
          carregarPatrocinadores();
        }
      }
    }
  });
});

async function carregarPatrocinadores() {
  const { data, error } = await supabase.from('patrocinadores').select('*').order('id');

  if (error) {
    console.error('Erro ao carregar patrocinadores:', error);
    return;
  }

  patrocinadores = data;

  const tbody = document.querySelector('#tabela-patrocinadores tbody');
  tbody.innerHTML = '';

  patrocinadores.forEach(pat => {
    const tr = document.createElement('tr');
    tr.dataset.id = pat.id;

    tr.innerHTML = `
      <td>${pat.nome}</td>
      <td><img src="${pat.logo_url || 'https://via.placeholder.com/50x20?text=Logo'}" alt="Logo" style="width:50px;height:20px;"></td>
      <td>${pat.nivel}</td>
      <td class="action-buttons">
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
