<template>
    <q-layout>
      <q-page-container>
        <q-page class="flex flex-center bg-grey-3">
          <q-card class="q-pa-md" style="max-width: 400px; width: 100%;">
            <q-card-section>
              <div class="text-h6 text-center">Recuperar contraseña</div>
              <q-input v-model="email" label="Correo electrónico" outlined class="q-mt-md" />
              <q-btn label="Enviar" color="primary" class="full-width q-mt-md" @click="sendRequest" />
              <q-card-section v-if="message" class="text-center text-positive q-mt-sm">
                
              </q-card-section>
            </q-card-section>
          </q-card>
          <!-- Marca de agua -->
<div class="watermark">BY MINIONS</div>
        </q-page>
      </q-page-container>
    </q-layout>
      
    </template>
    
    <script setup>
    import { ref } from "vue";
    import { useAuthStore } from "stores/auth";
    import { useQuasar } from 'quasar';
  
    const $q = useQuasar();
    const authStore = useAuthStore();
    const email = ref("");
    const message = ref("");
    
    const sendRequest = async () => {
      
      const res = await authStore.requestPasswordReset(email.value);
      message.value = res.message;
      $q.notify({ type: 'positive', message: message });
      
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