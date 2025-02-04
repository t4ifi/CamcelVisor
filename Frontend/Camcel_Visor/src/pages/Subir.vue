<template>
    <q-page class="q-pa-md" style="display: flex; min-width: 80%;">
      <q-card style="min-width: 50%; height: 90vh;; display: block;">
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
            <q-input
              filled
              v-model="filial"
              label="Filial"
              required
            />
            <q-btn
              label="Subir Noticia"
              color="primary"
              type="submit"
              :disable="loading"
            />
          </q-form>
          <q-banner v-if="mensaje" class="q-mt-md" :class="mensajeClass">
            {{ mensaje }}
          </q-banner>
        </q-card-section>
        
      </q-card>
      <q-card style="min-width: 50%; height: 90vh;; display: block;">
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
          <q-banner v-if="mensaje" class="q-mt-md" :class="mensajeClass">
            {{ mensaje }}
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
        mensaje: '',
        mensajeClass: '',
        loading: false,
      };
    },
    methods: {
      async submitForm() {
        this.loading = true;
        try {
          const response = await axios.post('http://localhost:3000/api/SubirNoticias', {
            titulo: this.titulo,
            descripcion: this.descripcion,
            filial: this.filial,
          });
          this.mensaje = 'Noticia subida exitosamente.';
          this.mensajeClass = 'bg-positive text-white';
          this.clearForm();
        } catch (error) {
          this.mensaje = 'Error al subir la noticia.';
          this.mensajeClass = 'bg-negative text-white';
        } finally {
          this.loading = false;
        }
      },
      async submitForm2() {
        this.loading = true;
        try {
          const response = await axios.post('http://localhost:3000/api/SubirServ', {
            nombre: this.nombre_serv,
            ip: this.ip,
            
          });
          this.mensaje = 'Servidor subido exitosamente.';
          this.mensajeClass = 'bg-positive text-white';
          this.clearForm();
        } catch (error) {
          this.mensaje = 'Error al subir el Servidor.';
          this.mensajeClass = 'bg-negative text-white';
        } finally {
          this.loading = false;
        }
      },
      clearForm() {
        this.titulo = '';
        this.descripcion = '';
        this.filial = '';
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
  