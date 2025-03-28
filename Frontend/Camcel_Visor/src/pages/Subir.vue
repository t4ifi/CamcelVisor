<template>
  <q-page class="q-pa-md" style="display: flex; min-width: 80%;">
    <!-- Formulario para subir noticia -->
    <q-card style="min-width: 50%; height: 90vh; display: block;">
      <q-card-section class="text-center">
        <h3>Subir Noticia</h3>
        <q-form @submit="submitForm">
          <q-input
            filled
            v-model="titulo"
            label="Título"
            required
            autofocus
          />
          <q-input
            filled
            v-model="descripcion"
            label="Descripción"
            type="textarea"
            required
          />
          <!-- Selector de fecha -->
          
          <!-- Selector para filiales -->
          <q-select
            filled
            v-model="filial"
            :options="filiales"
            label="Filial"
            required
            emit-value
            map-options
          />
          <q-input
            filled
            v-model="fecha"
            label="Fecha de la Noticia"
            type="date"
            required
          />
          <q-btn
            label="Subir Noticia"
            color="primary"
            type="submit"
            :disable="loading"
          />
        </q-form>
        <!-- Mensaje específico para el formulario de Noticias -->
        <q-banner v-if="mensajeNoticia" class="q-mt-md" :class="mensajeClassNoticia">
          {{ mensajeNoticia }}
        </q-banner>
      </q-card-section>
    </q-card>

    <!-- Formulario para subir servidor -->
    <q-card style="min-width: 50%; height: 90vh; display: block;">
      <q-card-section class="text-center">
        <h3>Subir Servidor</h3>
        <q-form @submit="submitForm2">
          <q-input
            filled
            v-model="nombre_serv"
            label="Nombre del Servidor"
            required
            autofocus
          />
          <q-input
            style="padding-block-end: 10%;"
            filled
            v-model="ip"
            label="IP"
            type="textarea"
            required
          />
          <q-btn
            label="Subir Servidor"
            color="primary"
            type="submit"
            :disable="loading"
          />
        </q-form>
        <!-- Mensaje específico para el formulario de Servidores -->
        <q-banner v-if="mensajeServidor" class="q-mt-md" :class="mensajeClassServidor">
          {{ mensajeServidor }}
        </q-banner>
      </q-card-section>  
    </q-card>
  </q-page>
</template>

<script>
import { api } from 'src/boot/axios'

export default {
  data() {
    return {
      titulo: '',
      descripcion: '',
      fecha: '',
      nombre_serv: '',
      ip: '',
      filial: '',
      // Lista de filiales
      filiales: ['Melo', 'Rio Branco', 'Fraile Muerto', 'Santa Clara', 'Noblia', 'Aceguá', 'Tupambaé'],
      mensajeNoticia: '',
      mensajeClassNoticia: '',
      mensajeServidor: '',
      mensajeClassServidor: '',
      loading: false,
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      try {
        const response = await api.post('/api/noticias', {
          titulo: this.titulo,
          descripcion: this.descripcion,
          fecha: this.fecha,
          filial: this.filial,
        });
        this.mensajeNoticia = 'Noticia subida exitosamente.';
        this.mensajeClassNoticia = 'bg-positive text-white';
        this.clearForm();
        setTimeout(() => { this.mensajeNoticia = ''; }, 5000);
      } catch (error) {
        this.mensajeNoticia = 'Error al subir la noticia.';
        this.mensajeClassNoticia = 'bg-negative text-white';
        setTimeout(() => { this.mensajeNoticia = ''; }, 5000);
      } finally {
        this.loading = false;
      }
    },
    async submitForm2() {
      this.loading = true;
      try {
        const response = await api.post('/api/Servidores', {
          nombre: this.nombre_serv,
          ip: this.ip,
        });
        this.mensajeServidor = 'Servidor subido exitosamente.';
        this.mensajeClassServidor = 'bg-positive text-white';
        this.clearForm2();
        setTimeout(() => { this.mensajeServidor = ''; }, 5000);
      } catch (error) {
        this.mensajeServidor = 'Error al subir el Servidor.';
        this.mensajeClassServidor = 'bg-negative text-white';
        setTimeout(() => { this.mensajeServidor = ''; }, 5000);
      } finally {
        this.loading = false;
      }
    },
    clearForm() {
      this.titulo = '';
      this.descripcion = '';
      this.fecha = '';
      this.filial = '';
    },
    clearForm2() {
      this.nombre_serv = '';
      this.ip = '';
    },
  },
};
</script>

<style scoped>
.q-page {
  max-width: 600px;
  margin: 0 auto;
}
</style>
