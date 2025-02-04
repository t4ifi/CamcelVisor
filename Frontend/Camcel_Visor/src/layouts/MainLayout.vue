<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar style="background-color: #085d71;">
        <div style="width: 20%;">
          <img
            src="src/assets/LogoCamcel.jpg"
            alt="Logo Camcel"
            style="max-width: 200px"
            class="q-ml-xl"
          />
        </div>
        <div style="width: 60%;">
          <q-toolbar-title class="text-center">
            Control Web
          </q-toolbar-title>
        </div>
        <div style="width: 20%;">
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router' // Importa el enrutador para redirigir

const router = useRouter()

// Verifica el token en el localStorage al montar el layout
onMounted(() => {
  const token = localStorage.getItem('token') // Obtiene el token almacenado

  if (!token) {
    router.push('/login') // Redirige al login si no hay token
  }
})
</script>
