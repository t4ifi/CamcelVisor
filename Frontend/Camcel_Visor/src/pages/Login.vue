<template>
    <q-layout view="lHh Lpr lFf">
        <q-page-container>
    <q-page class="flex flex-center">
      <q-card class="q-pa-md" style="width: 400px;">
        <q-card-section>
          <div class="text-h6">Iniciar Sesión</div>
        </q-card-section>
  
        <q-card-section>
          <q-input v-model="nombre" label="Usuario" filled />
          <q-input v-model="password" label="Contraseña" filled type="password" />
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn label=" Login " color="primary" @click="handleLogin" />
          <q-btn label="Reset PASS" color="primary" @click="handleReset" />
        </q-card-actions>
      </q-card>
      <!-- Marca de agua -->
<div class="watermark">BY MINIONS</div>
    </q-page>
    </q-page-container>
</q-layout>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '../stores/auth';
  import { useRouter } from 'vue-router';
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  const nombre = ref('');
  const password = ref('');
  
  const handleLogin = async () => {
  
    await authStore.login(nombre.value, password.value);
    if (authStore.token) {
      router.push('/');
    }
  };
  const handleReset = async () => {
  
  router.push("/reset_pwd")
};

  </script>
  
  <style scoped>

.watermark {
  position: fixed;
  bottom: 10px; /* Ajusta la posición vertical */
  left: 50%; /* Centra horizontalmente */
  transform: translateX(-50%); /* Ajusta el centrado */
  color: rgba(0, 0, 0, 0.823); /* Color con transparencia */
  font-size: 17px;
  font-weight: bold;
  z-index: 9999;
  pointer-events: none; /* Evita que interfiera con clics */
  user-select: none; /* Evita selección */
}

</style>