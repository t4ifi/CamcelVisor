<template>
  <q-page padding>
    <q-row gutter>
      <!-- Columna del calendario reducido -->
      <q-col cols="3">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-sm">Selecciona una fecha</div>
            <div class="calendar-container">
              <div class="calendar-header">
                <q-btn dense flat icon="chevron_left" @click="prevMonth" />
                <span class="calendar-title">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
                <q-btn dense flat icon="chevron_right" @click="nextMonth" />
              </div>
              <div class="calendar-grid">
                <div v-for="day in weekDays" :key="day" class="calendar-day header">{{ day }}</div>
                <div v-for="n in startOffset" :key="'offset-' + n" class="calendar-day empty"></div>
                <div v-for="day in daysInMonth" :key="'day-' + day" 
                  class="calendar-day"
                  :class="{ 'selected': selectedDate === formatDate(currentYear, currentMonth, day) }"
                  @click="selectDate(day)">
                  {{ day }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-col>
      
      <!-- Columna para mostrar noticias filtradas -->
      <q-col cols="9">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-sm">Noticias del día: {{ selectedDate }}</div>
            <q-list v-if="filteredNews.length">
              <q-item v-for="news in filteredNews" :key="news.id" clickable @click="openNews(news)">
                <q-item-section>
                  <q-item-label>{{ news.titulo }}</q-item-label>
                  <q-item-label caption>{{ formatearFecha(news.fecha) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey-6">No hay noticias para la fecha seleccionada.</div>
          </q-card-section>
        </q-card>
      </q-col>
    </q-row>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const selectedDate = ref('');
const newsList = ref([]);
const filteredNews = ref([]);

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; // Días abreviados
const monthNames = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const startOffset = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const selectDate = (day) => {
  selectedDate.value = formatDate(currentYear.value, currentMonth.value, day);
  filterNews();
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const fetchNews = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/noticias');
    newsList.value = response.data;
  } catch (error) {
    console.error('Error al obtener noticias:', error);
  }
};

const filterNews = () => {
  filteredNews.value = newsList.value.filter(news => {
    return news.fecha.split('T')[0] === selectedDate.value;
  });
};

const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES');
};

onMounted(fetchNews);
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 14px; /* Más pequeño */
  margin-bottom: 5px;
}
.calendar-title {
  font-size: 14px; /* Ajuste del título */
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px; /* Espaciado menor */
  text-align: center;
  width: 100%;
}
.calendar-day {
  padding: 5px; /* Reducción del tamaño */
  font-size: 12px; /* Texto más pequeño */
  cursor: pointer;
  border-radius: 3px;
}
.calendar-day:hover {
  background-color: #ddd;
}
.selected {
  background-color: #1976D2;
  color: white;
}
.header {
  font-weight: bold;
  font-size: 12px; /* Días de la semana más pequeños */
}
.empty {
  visibility: hidden;
}
</style>
