<template>
  

 
  <q-layout view="hHh Lpr lff" container style="height: 100vh;" class="shadow-2 rounded-borders">
    <div class="">
    <q-header elevated >
      <q-toolbar style="background-color: #085d71;">
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
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
</div>
<div>
  

    
    <q-drawer
    v-model="drawer"
    show-if-above
    :width="200"
    :breakpoint="500"
    style="background-color: aliceblue;"
    class="shadow-2 rounded-borders"
  >
  <q-scroll-area class="fit">
    <q-list>

      <template v-for="(menuItem, index) in menuList" :key="index">
        <q-item clickable :active="menuItem.label === 'Outbox'" v-ripple style="height: 15vh;" @click="$router.push(menuItem.Router)">
          <q-item-section avatar>
            <q-icon :name="menuItem.icon" />
          </q-item-section>
          <q-item-section>
            {{ menuItem.label }}
          </q-item-section>
        </q-item>
        <q-separator :key="'sep' + index"  v-if="menuItem.separator" />
      </template>

    </q-list>
  </q-scroll-area>
  </q-drawer>


    <q-page-container>
      <router-view />
    </q-page-container>
  </div>
  </q-layout> 

</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router' // Importa el enrutador para redirigir

const drawer = ref(false);
const router = useRouter()

// Verifica el token en el localStorage al montar el layout
onMounted(() => {
  const token = localStorage.getItem('token') // Obtiene el token almacenado

  if (!token) {
    router.push('/login') // Redirige al login si no hay token
  }
})
const menuList = [
  {
    icon: 'mdi-home',
    label: 'Inicio(Subir)',
    Router: '/',
    separator: true
  },
  {
    icon: 'mdi-eye',
    label: 'Vista',
    Router: '/visor',
    separator: true
  },
  {
    icon: 'mdi-pencil',
    Router: '/editar',
    label: 'Edicion/Borrar',
    separator: true
  },
  { 
    icon: 'settings',
    label: 'Configuracion',
    separator: true
  },
  {
    icon: 'feedback',
    label: 'Retroalimentacion',
    separator: true
  },
  {
    icon: 'help',
    iconColor: 'primary',
    label: 'Ayuda',
    separator: true
  }
]
</script>
