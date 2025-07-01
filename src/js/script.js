import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://kqbtymyfczqqqxnpipmh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnR5bXlmY3pxcXF4bnBpcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjEzODQsImV4cCI6MjA2NjA5NzM4NH0.fr-VLhj1B94t9u9mbwn7eoWxJW0RnAxybCYpJ3TmHes'
);

let estandes = [];

async function carregarEstandes() {
  const { data, error } = await supabase.from('stands').select('*').order('id');
  if (error) {
    alert('Erro ao carregar estandes');
    console.error(error);
    return;
  }
  estandes = data;

  const tbody = document.querySelector('#tabela-estandes tbody');
  tbody.innerHTML = '';

  estandes.forEach(est => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${est.empresa || ''}</td>
      <td>${est.numero || ''}</td>
      <td>${est.setor || ''}</td>
      <td class="action-buttons">
        <button class="edit-stand" data-id="${est.id}">Editar</button>
        <button class="delete-stand" data-id="${est.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelector('#tabela-estandes tbody').addEventListener('click', async (event) => {
  const el = event.target;

  if (el.classList.contains('edit-stand')) {
    const id = Number(el.dataset.id);
    const est = estandes.find(e => e.id === id);
    if (!est) return;

    document.getElementById('estande-id').value = est.id;
    document.getElementById('nome-empresa-estande').value = est.empresa || '';
    document.getElementById('numero-estande').value = est.numero || '';
    document.getElementById('responsavel-estande').value = est.responsavel || '';
    document.getElementById('setor-estande').value = est.setor || '';
  }

  if (el.classList.contains('delete-stand')) {
    if (confirm('Deseja realmente excluir este estande?')) {
      const id = Number(el.dataset.id);
      const { error } = await supabase.from('stands').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir estande');
        console.error(error);
      } else {
        alert('Estande excluído com sucesso!');
        carregarEstandes();
      }
    }
  }
});

async function cadastrarStand(stand) {
  if (!stand.empresa || !stand.numero) {
    alert('Por favor, preencha o nome da empresa e o número do estande.');
    return;
  }

  let data, error;

  if (stand.id) {
    ({ data, error } = await supabase
      .from('stands')
      .update({
        empresa: stand.empresa,
        numero: stand.numero,
        responsavel: stand.responsavel,
        setor: stand.setor
      })
      .eq('id', stand.id));
  } else {
    ({ data, error } = await supabase
      .from('stands')
      .insert([{
        empresa: stand.empresa,
        numero: stand.numero,
        responsavel: stand.responsavel,
        setor: stand.setor
      }]));
  }

  if (error) {
    alert(`Erro ao salvar estande:\n${error.message || JSON.stringify(error)}`);
    console.error(error);
  } else {
    alert('Estande salvo com sucesso!');
    document.getElementById('formStand').reset();
    document.getElementById('estande-id').value = '';
    carregarEstandes();
  }
}

document.getElementById('formStand').addEventListener('submit', (e) => {
  e.preventDefault();

  const idValue = document.getElementById('estande-id').value.trim();
  const stand = {
    empresa: document.getElementById('nome-empresa-estande').value.trim(),
    numero: document.getElementById('numero-estande').value.trim(),
    responsavel: document.getElementById('responsavel-estande').value.trim(),
    setor: document.getElementById('setor-estande').value.trim()
  };

  if (idValue) {
    stand.id = Number(idValue);
  }

  console.log("Dados enviados:", stand);

  cadastrarStand(stand);
});

carregarEstandes();


async function salvarEvento(evento) {
  if (evento.id) {
    const { data, error } = await supabase
      .from('eventos')
      .update({
        nome: evento.nome,
        descricao: evento.descricao,
        data: evento.data,
        hora: evento.hora,
        local: evento.local
      })
      .eq('id', evento.id);
    return { data, error };
  } else {
    const { data, error } = await supabase
      .from('eventos')
      .insert([evento]);
    console.log("Resultado do insert:", data, error);
    return { data, error };
  }
}

document.getElementById('form-evento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const idValor = document.getElementById('evento-id').value;
  const evento = {
    nome: document.getElementById('nome-evento').value,
    descricao: document.getElementById('descricao-evento').value,
    data: document.getElementById('data-evento').value,
    hora: document.getElementById('hora-evento').value,
    local: document.getElementById('local-evento').value
  };

  if (idValor) {
    evento.id = idValor;
  }

  if (!evento.nome || !evento.data) {
    alert('Preencha os campos obrigatórios!');
    return;
  }

  const { data, error } = await salvarEvento(evento);

  if (error) {
    alert(`Erro ao salvar evento:
Mensagem: ${error.message || 'N/A'}
Detalhes: ${error.details || 'N/A'}
Código: ${error.code || 'N/A'}
Status: ${error.status || 'N/A'}`);
  } else {
    alert(evento.id ? 'Evento atualizado com sucesso!' : 'Evento cadastrado com sucesso!');
    document.getElementById('form-evento').reset();
    document.getElementById('evento-id').value = '';
    carregarEventos();
  }
});

function editarEvento(id, nome, descricao, data, hora, local) {
  document.getElementById('evento-id').value = id;
  document.getElementById('nome-evento').value = nome;
  document.getElementById('descricao-evento').value = descricao;
  document.getElementById('data-evento').value = data;
  document.getElementById('hora-evento').value = hora;
  document.getElementById('local-evento').value = local;
}

async function carregarEventos() {
  const { data: eventos, error } = await supabase.from('eventos').select('*').order('data');

  if (error) {
    alert(`Erro ao carregar eventos:
Mensagem: ${error.message || 'N/A'}
Detalhes: ${error.details || 'N/A'}
Código: ${error.code || 'N/A'}
Status: ${error.status || 'N/A'}`);
    return;
  }

  const tbody = document.querySelector('#tabela-eventos tbody');
  tbody.innerHTML = '';

  eventos.forEach((evento) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${evento.nome}</td>
      <td>${evento.data}</td>
      <td>${evento.local}</td>
      <td class="action-buttons">
        <button class="edit-btn" data-id="${evento.id}">Editar</button>
        <button class="delete-btn" data-id="${evento.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const evento = eventos.find(ev => ev.id == id);
      editarEvento(evento.id, evento.nome, evento.descricao, evento.data, evento.hora, evento.local);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      if (confirm('Deseja realmente excluir este evento?')) {
        const { error } = await supabase.from('eventos').delete().eq('id', id);
        if (error) {
          alert(`Erro ao excluir evento:
Mensagem: ${error.message || 'N/A'}
Detalhes: ${error.details || 'N/A'}
Código: ${error.code || 'N/A'}
Status: ${error.status || 'N/A'}`);
        } else {
          alert('Evento excluído com sucesso.');
          carregarEventos();
        }
      }
    });
  });
}

carregarEventos();
