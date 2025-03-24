<template>
  <q-layout padding>
    <q-toolbar class="bg-primary text-white">
      <div style="width: 20%;"></div>
      <div style="width: 50%;">
        <q-toolbar-title>Noticias en Pantalla</q-toolbar-title>
      </div>
      <div style="width: 30%;">
        <q-toolbar-title>Estado de los Servidores</q-toolbar-title>
      </div>
    </q-toolbar>

    <q-page>
      <q-row class="q-pa-md" style="display: flex; height: 90vh;">
        <q-col style="width: 58%; height: 100%; display: block;">
          <div class="grid grid-cols-1 gap-4" v-if="noticias.length">
            <q-card v-for="noticia in noticias" :key="noticia.id" class="q-pa-md" style="height: 25vh;">
              <q-card-section>
                <q-row class="q-pa-md" style="display: flex; height: 100%; align-items: center;">
                  <q-col style="width: 85%; display: flex; flex-direction: column; justify-content: center;">
                    <div class="text-h6 truncate">{{ noticia.titulo }}</div>
                    <div class="text-body1">{{ noticia.descripcion }}</div>
                  </q-col>
                  <q-col style="width: 15%; display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
                    <div class="text-h6 text-grey">{{ noticia.filial }}</div>
                    <div class="text-caption text-grey">{{ formatearFecha(noticia.fecha) }}</div>
                    <div class="q-mt-sm" style="display: flex; justify-content: center; width: min-content;">
                      <q-btn color="primary" icon="mdi-pencil-outline" @click="editarElemento(noticia, 'noticia')" />
                      <q-btn color="negative" icon="mdi-delete-empty-outline" @click="eliminarNoticia(noticia.id)" class="q-ml-sm" />
                    </div>
                  </q-col>
                </q-row>
              </q-card-section>
            </q-card>
          </div>
          <q-spinner color="primary" v-else />
        </q-col>

        <q-col style="width: 1%; height: 100%; display: block;"></q-col>

        <q-col style="width: 40%; height: 100%; display: block;">
          <div v-if="servidores.length" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <q-card v-for="servidor in servidores" :key="servidor.id" class="q-pa-md" style="height: 25vh;">
              <q-card-section>
                <div class="text-h6">{{ servidor.nombre }}</div>
                <div class="text-body2">IP: {{ servidor.ip }}</div>
                <div :class="{'text-positive': servidor.estado === 'Activo', 'text-negative': servidor.estado === 'Caído'}">
                  Estado: {{ servidor.estado }}
                </div>
                <div class="q-mt-sm" style="display: flex; justify-content: center;">
                  <q-btn color="primary" icon="mdi-pencil-outline" @click="editarElemento(servidor, 'servidor')" style="width: 5px;"/>
                  <q-btn color="negative" icon="mdi-delete-empty-outline" @click="eliminarServidor(servidor.id)" class="q-ml-sm" style="width: 5px;" />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <q-spinner color="primary" v-else />
        </q-col>
      </q-row>
    </q-page>

    <q-dialog v-model="dialogoVisible">
      <q-card>
        <q-card-section>
          <q-input v-if="tipoEdicion === 'noticia'" v-model="edicionActual.titulo" label="Título" />
          <q-input v-if="tipoEdicion === 'noticia'" v-model="edicionActual.descripcion" label="Descripción" type="textarea" />
          <q-select v-if="tipoEdicion === 'noticia'" v-model="edicionActual.filial" :options="filiales" label="Filial" />
          
          <q-input v-if="tipoEdicion === 'servidor'" v-model="edicionActual.nombre" label="Nombre del Servidor" />
          <q-input v-if="tipoEdicion === 'servidor'" v-model="edicionActual.ip" label="IP del Servidor" />
          <q-select v-if="tipoEdicion === 'servidor'" v-model="edicionActual.estado" :options="['Activo', 'Caído']" label="Estado" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { api } from 'src/boot/axios'
import { io } from 'socket.io-client';




const filiales = ["Melo", "Río Branco", "Santa Clara", "Cerro Largo"];

const dialogoVisible = ref(false);
const tipoEdicion = ref(null);
const edicionActual = reactive({});
const noticias = ref([]);
const servidores = ref([]);
let socket = null;

onMounted(() => {
  cargarEstados();
  cargarNoticias();
  socket = io(import.meta.env.VITE_API);

  socket.on('noticiaCreada', (data) => noticias.value.unshift(data));
  socket.on('servidorCreado', (data) => servidores.value.unshift(data));
  socket.on('noticiaEditada', (data) => {
    

    // Verificar si `data` es un array o un solo objeto
    if (Array.isArray(data)) {
      // Si es un array, agregar cada noticia al inicio del array de noticias
      data.forEach((noticia) => {
        noticias.value.unshift(noticia);
      });
    } else if (data && typeof data === 'object') {
      // Si es un solo objeto, agregarlo directamente
      noticias.value.unshift(data);
    } else {
      console.error('El formato de data no es válido:', data);
    }
    
    actualizarNoticia(data)
    cargarNoticias();
  });
  socket.on('servidorEditado', (data) => {
  // Verificar si `data` es un array o un solo objeto
  if (Array.isArray(data)) {
    // Si es un array, agregar cada servidor al inicio del array de servidores
    data.forEach((servidor) => {
      servidores.value.unshift(servidor);
    });
  } else if (data && typeof data === 'object') {
    // Si es un solo objeto, agregarlo directamente
    servidores.value.unshift(data);
  } else {
    console.error('El formato de data no es válido:', data);
  }

  console.log('Nuevo servidor agregado:', data);
  cargarEstados();
});
  socket.on('estadoServidorCambiado', (data) => {
    const servidor = servidores.value.find((s) => s.id === data.id);
    if (servidor) servidor.estado = data.estado;
  });
});

function editarElemento(elemento, tipo) {
  tipoEdicion.value = tipo;
  Object.assign(edicionActual, elemento);
  dialogoVisible.value = true;
}

async function guardarEdicion() {
  if (tipoEdicion.value === 'noticia') {
    await api.put(`/api/noticias/${edicionActual.id}`, edicionActual);
    cargarNoticias();
  } else if (tipoEdicion.value === 'servidor') {
    await api.put(`/api/servidores/${edicionActual.id}`, edicionActual);
    cargarNoticias();
  }
  dialogoVisible.value = false;
}

async function eliminarNoticia(id) {
  await api.delete(`/api/noticias/${id}`);
  noticias.value = noticias.value.filter(n => n.id !== id);
}

async function eliminarServidor(id) {
  await api.delete(`/api/servidores/${id}`);
  servidores.value = servidores.value.filter(s => s.id !== id);
}

async function cargarNoticias() {
  const response = await api.get(`/api/noticias`);
  noticias.value = response.data;
}

async function cargarEstados() {
  const response = await api.get(`/api/servidores`);
  servidores.value = response.data;
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}
</script>

<style>
.text-h6 {
  font-weight: bold;
}
</style>