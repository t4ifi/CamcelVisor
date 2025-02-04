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
          <q-btn label="Login" color="primary" @click="handleLogin" />
        </q-card-actions>
      </q-card>
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
  </script>
  