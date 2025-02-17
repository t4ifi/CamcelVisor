<template>
    <q-page padding>
      <q-row gutter>
        <!-- Calendario -->
        <q-col cols="3">
          <q-card>
            <q-card-section>
              <div class="text-h6">Selecciona una fecha</div>
              <q-date v-model="selectedDate" mask="YYYY-MM-DD" @update:model-value="filterNews" color="primary" />
            </q-card-section>
          </q-card>
        </q-col>
  
        <!-- Noticias del día -->
        <q-col cols="9">
          <q-card>
            <q-card-section>
              <div class="text-h6">Noticias del {{ selectedDate }}</div>
              <q-list v-if="filteredNews.length">
                <q-item v-for="news in filteredNews" :key="news.id" clickable @click="openNews(news)">
                  <q-item-section>
                    <q-item-label>{{ news.titulo }}</q-item-label>
                    <q-item-label caption>{{ formatDate(news.fecha) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-grey-6">No hay noticias para esta fecha.</div>
            </q-card-section>
          </q-card>
        </q-col>
      </q-row>
  
      <!-- Detalle de la noticia -->
      <q-dialog v-model="dialogOpen">
        <q-card style="min-width: 300px">
          <q-card-section>
            <div class="text-h6">{{ selectedNews.titulo }}</div>
            <div class="q-mt-sm">{{ selectedNews.descripcion }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" @click="dialogOpen = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const selectedDate = ref(new Date().toISOString().split('T')[0]) // Fecha actual en formato YYYY-MM-DD
  const newsList = ref([]) // Lista completa de noticias
  const filteredNews = ref([]) // Noticias filtradas por fecha
  const dialogOpen = ref(false) // Control del modal
  const selectedNews = ref({}) // Noticia seleccionada
  
  // Cargar noticias desde el backend
  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/noticias')
      newsList.value = response.data
      filterNews() // Filtrar noticias al inicio
    } catch (error) {
      console.error('Error al obtener noticias:', error)
    }
  }
  
  // Filtrar noticias según la fecha seleccionada
  const filterNews = () => {
    filteredNews.value = newsList.value.filter(news => news.fecha.split('T')[0] === selectedDate.value)
  }
  
  // Abrir diálogo con la noticia seleccionada
  const openNews = (news) => {
    selectedNews.value = news
    dialogOpen.value = true
  }
  
  // Formatear fecha a DD/MM/YYYY
  const formatDate = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`
  }
  
  onMounted(fetchNews)
  </script>
  
  <style scoped>
  /* Estilos opcionales */
  </style>
  