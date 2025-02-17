<template>
  <q-page class="q-pa-md" style="display: flex; min-width: 80%;">
    <!-- Formulario para subir noticia -->
    <q-card style="min-width: 50%; height: 90vh; display: block;">
      <q-card-section class="text-center">
        <h2>Subir Noticia</h2>
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
        <h2>Subir Servidor</h2>
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
import axios from 'axios';

export default {
  data() {
    return {
      titulo: '',
      descripcion: '',
      nombre_serv: '',
      ip: '',
      filial: '',
      // Lista de filiales (puede ser traída desde una API)
      filiales: ['Melo', 'Rio Branco', 'Fraile Muerto', 'Santa Clara', 'Noblia', 'Aceguá', 'Tupambaé'],  // ejemplo de filiales
      // Mensajes independientes para cada formulario
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
        const response = await axios.post('http://100.0.2.27:3000/api/SubirNoticias', {
          titulo: this.titulo,
          descripcion: this.descripcion,
          filial: this.filial,
        });
        this.mensajeNoticia = 'Noticia subida exitosamente.';
        this.mensajeClassNoticia = 'bg-positive text-white';
        this.clearForm();
        // Desaparecer el mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajeNoticia = '';
        }, 5000);
      } catch (error) {
        this.mensajeNoticia = 'Error al subir la noticia.';
        this.mensajeClassNoticia = 'bg-negative text-white';
        // Desaparecer el mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajeNoticia = '';
        }, 5000);
      } finally {
        this.loading = false;
      }
    },
    async submitForm2() {
      this.loading = true;
      try {
        const response = await axios.post('http://100.0.2.27:3000/api/SubirServ', {
          nombre: this.nombre_serv,
          ip: this.ip,
        });
        this.mensajeServidor = 'Servidor subido exitosamente.';
        this.mensajeClassServidor = 'bg-positive text-white';
        this.clearForm2();
        // Desaparecer el mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajeServidor = '';
        }, 5000);
      } catch (error) {
        this.mensajeServidor = 'Error al subir el Servidor.';
        this.mensajeClassServidor = 'bg-negative text-white';
        // Desaparecer el mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajeServidor = '';
        }, 5000);
      } finally {
        this.loading = false;
      }
    },
    clearForm() {
      this.titulo = '';
      this.descripcion = '';
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
